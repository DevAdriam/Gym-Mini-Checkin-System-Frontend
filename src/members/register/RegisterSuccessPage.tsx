import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCheckMemberStatus } from "../../lib/hooks/use-member-status";
import { useMemberSocket } from "../../lib/hooks/use-member-socket";
import toast from "react-hot-toast";

const MEMBER_EMAIL_KEY = "gym_member_email";
const MEMBER_ID_KEY = "gym_member_id";

export default function RegisterSuccessPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);

  // Get email and memberId from localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem(MEMBER_EMAIL_KEY);
    const storedMemberId = localStorage.getItem(MEMBER_ID_KEY);
    if (storedEmail) {
      setEmail(storedEmail);
    }
    if (storedMemberId) {
      setMemberId(storedMemberId);
    }
  }, []);

  // Check member status periodically
  const { data: statusData, refetch: refetchStatus } = useCheckMemberStatus(
    email || ""
  );

  // Subscribe to member-specific socket events for real-time approval/rejection notifications
  useMemberSocket({
    memberId: memberId || statusData?.member?.id || undefined,
    enabled: !!(memberId || statusData?.member?.id),
    onMemberApproved: () => {
      // When approved, navigate to dashboard
      toast.success(
        "Your membership has been approved! Redirecting to dashboard...",
        {
          duration: 3000,
        }
      );
      setTimeout(() => {
        navigate("/members/dashboard");
      }, 1000);
    },
    onMemberRejected: () => {
      // When rejected, navigate back to register page
      toast.error("Your registration has been rejected.", {
        duration: 5000,
      });
      setTimeout(() => {
        navigate("/members/register");
      }, 2000);
    },
  });

  // Poll for status changes every 5 seconds
  useEffect(() => {
    if (!email) return;

    const interval = setInterval(() => {
      refetchStatus();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [email, refetchStatus]);

  // Check if status changed and redirect accordingly
  useEffect(() => {
    if (statusData) {
      const status = statusData.status;
      if (status === "APPROVED" || status === "ACTIVE") {
        // Redirect to dashboard
        navigate("/members/dashboard", {
          state: { member: statusData.member },
        });
      } else if (status === "REJECTED") {
        // Redirect back to register
        navigate("/members/register");
      }
    }
  }, [statusData, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Registration Submitted!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your registration has been submitted successfully. Our admin will
            review your application and notify you once it's approved.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>What's next?</strong>
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-left list-disc list-inside space-y-1">
              <li>Admin will review your registration</li>
              <li>You'll receive a notification once approved</li>
              <li>Your membership will be activated upon approval</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
