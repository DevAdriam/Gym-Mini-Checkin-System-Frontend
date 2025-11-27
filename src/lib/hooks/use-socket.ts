import { useEffect, useRef } from "react";
import { connectSocket, disconnectSocket, getSocket } from "../socket";
import type {
  MemberRegisteredEvent,
  MemberApprovalStatusChangedEvent,
  MemberApprovedEvent,
  MemberRejectedEvent,
} from "../socket";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface UseSocketOptions {
  onMemberRegistered?: (event: MemberRegisteredEvent) => void;
  onMemberApprovalStatusChanged?: (
    event: MemberApprovalStatusChangedEvent
  ) => void;
  onMemberApproved?: (event: MemberApprovedEvent) => void;
  onMemberRejected?: (event: MemberRejectedEvent) => void;
  enabled?: boolean;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const {
    onMemberRegistered,
    onMemberApprovalStatusChanged,
    onMemberApproved,
    onMemberRejected,
    enabled = true,
  } = options;
  const queryClient = useQueryClient();
  const handlersRef = useRef(options);

  // Update handlers ref when they change
  useEffect(() => {
    handlersRef.current = options;
  }, [
    onMemberRegistered,
    onMemberApprovalStatusChanged,
    onMemberApproved,
    onMemberRejected,
  ]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const socket = connectSocket();

    // Default handler for member registered
    const handleMemberRegistered = (event: MemberRegisteredEvent) => {
      console.log("Member registered event:", event);

      // Show toast notification
      toast.success(`New member registered: ${event.data.name}`, {
        duration: 5000,
      });

      // Invalidate members query to refresh the list and pending count
      queryClient.invalidateQueries({ queryKey: ["admin", "members"] });

      // Call custom handler if provided
      handlersRef.current.onMemberRegistered?.(event);
    };

    // Default handler for member approval status changed (backward compatibility)
    const handleMemberApprovalStatusChanged = (
      event: MemberApprovalStatusChangedEvent
    ) => {
      console.log("Member approval status changed event:", event);

      const action = event.data.status === "APPROVED" ? "approved" : "rejected";

      // Show toast notification
      toast.success(`Member ${action}: ${event.data.name}`, {
        duration: 5000,
      });

      // Invalidate members query to refresh the list and pending count
      queryClient.invalidateQueries({ queryKey: ["admin", "members"] });

      // Call custom handler if provided
      handlersRef.current.onMemberApprovalStatusChanged?.(event);
    };

    // Handler for member approved event
    const handleMemberApproved = (event: MemberApprovedEvent) => {
      console.log("Member approved event:", event);

      // Show toast notification
      toast.success(
        `Member approved: ${event.data.name} (${event.data.memberId})`,
        {
          duration: 5000,
        }
      );

      // Invalidate members query to refresh the list and pending count
      queryClient.invalidateQueries({ queryKey: ["admin", "members"] });

      // Call custom handler if provided
      handlersRef.current.onMemberApproved?.(event);
    };

    // Handler for member rejected event
    const handleMemberRejected = (event: MemberRejectedEvent) => {
      console.log("Member rejected event:", event);

      // Show toast notification
      toast.error(
        `Member rejected: ${event.data.name} (${event.data.memberId})`,
        {
          duration: 5000,
        }
      );

      // Invalidate members query to refresh the list and pending count
      queryClient.invalidateQueries({ queryKey: ["admin", "members"] });

      // Call custom handler if provided
      handlersRef.current.onMemberRejected?.(event);
    };

    // Listen to events
    socket.on("member:registered", handleMemberRegistered);
    socket.on(
      "member:approval-status-changed",
      handleMemberApprovalStatusChanged
    );
    socket.on("member:approved", handleMemberApproved);
    socket.on("member:rejected", handleMemberRejected);

    // Cleanup on unmount
    return () => {
      socket.off("member:registered", handleMemberRegistered);
      socket.off(
        "member:approval-status-changed",
        handleMemberApprovalStatusChanged
      );
      socket.off("member:approved", handleMemberApproved);
      socket.off("member:rejected", handleMemberRejected);
    };
  }, [enabled, queryClient]);

  return {
    socket: getSocket(),
  };
};
