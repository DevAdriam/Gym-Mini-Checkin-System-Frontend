import { useEffect, useRef } from "react";
import { connectSocket, getSocket } from "../socket";
import type {
  MemberApprovedEvent,
  MemberRejectedEvent,
} from "../socket";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface UseMemberSocketOptions {
  memberId?: string;
  onMemberApproved?: (event: MemberApprovedEvent) => void;
  onMemberRejected?: (event: MemberRejectedEvent) => void;
  enabled?: boolean;
}

/**
 * Hook for member-specific socket events
 * Subscribes to member's personal room to receive approval/rejection notifications
 */
export const useMemberSocket = (options: UseMemberSocketOptions = {}) => {
  const {
    memberId,
    onMemberApproved,
    onMemberRejected,
    enabled = true,
  } = options;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const handlersRef = useRef(options);

  // Update handlers ref when they change
  useEffect(() => {
    handlersRef.current = options;
  }, [onMemberApproved, onMemberRejected]);

  useEffect(() => {
    if (!enabled || !memberId) {
      return;
    }

    const socket = connectSocket(memberId);

    // Handler for member approved event
    const handleMemberApproved = (event: MemberApprovedEvent) => {
      console.log("Member approved event received:", event);

      // Only handle if this event is for the current member
      if (event.data.id === memberId || event.data.memberId === memberId) {
        // Show toast notification
        toast.success("Your membership has been approved! Redirecting to dashboard...", {
          duration: 5000,
        });

        // Invalidate member status query to refresh data
        queryClient.invalidateQueries({ queryKey: ["member", "check-status"] });
        queryClient.invalidateQueries({ queryKey: ["member"] });

        // Navigate to dashboard after a short delay
        setTimeout(() => {
          navigate("/members/dashboard");
        }, 1000);

        // Call custom handler if provided
        handlersRef.current.onMemberApproved?.(event);
      }
    };

    // Handler for member rejected event
    const handleMemberRejected = (event: MemberRejectedEvent) => {
      console.log("Member rejected event received:", event);

      // Only handle if this event is for the current member
      if (event.data.id === memberId || event.data.memberId === memberId) {
        // Show toast notification
        toast.error("Your membership registration has been rejected.", {
          duration: 5000,
        });

        // Invalidate member status query to refresh data
        queryClient.invalidateQueries({ queryKey: ["member", "check-status"] });
        queryClient.invalidateQueries({ queryKey: ["member"] });

        // Call custom handler if provided
        handlersRef.current.onMemberRejected?.(event);
      }
    };

    // Listen to member-specific events
    socket.on("member:approved", handleMemberApproved);
    socket.on("member:rejected", handleMemberRejected);

    // Cleanup on unmount
    return () => {
      socket.off("member:approved", handleMemberApproved);
      socket.off("member:rejected", handleMemberRejected);
    };
  }, [enabled, memberId, queryClient, navigate]);

  return {
    socket: getSocket(),
  };
};

