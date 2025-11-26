import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCheckMemberStatus } from "../../lib/hooks/use-member-status";
import { useAsyncQuery } from "../../lib/hooks/use-async-query";
import { getMemberCheckInsPublic } from "../../lib/api/admin-checkins";
import QRScanner from "../../components/QRScanner";
import axios from "axios";
import { API_BASE_URL } from "../../lib/axios-config";
import type {
  PaginatedResponse,
  CheckInLog,
  MembershipPackage,
} from "../../types/index";

const MEMBER_EMAIL_KEY = "gym_member_email";

export default function MemberDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);

  // Get email from localStorage or location state
  useEffect(() => {
    const storedEmail = localStorage.getItem(MEMBER_EMAIL_KEY);
    if (storedEmail) {
      setEmail(storedEmail);
    } else if (location.state?.member?.email) {
      setEmail(location.state.member.email);
    } else {
      // No email found, redirect to register
      navigate("/members/register");
    }
  }, [location, navigate]);

  const { data: statusData, isLoading } = useCheckMemberStatus(email || "");
  const member = statusData?.member;

  // Get check-in logs for this member (public, no auth)
  const { data: checkInData, refetch: refetchCheckIns } = useAsyncQuery<
    PaginatedResponse<CheckInLog>
  >({
    queryKey: ["member", "checkins", member?.id],
    queryFn: () =>
      getMemberCheckInsPublic(member?.id || "", { page: 1, limit: 20 }),
    enabled: !!member?.id,
  });

  // Get membership package details (public, no auth)
  const { data: packageData } = useAsyncQuery<MembershipPackage>({
    queryKey: ["member", "package", member?.membershipPackageId],
    queryFn: async () => {
      const response = await axios.get(
        `${API_BASE_URL}/membership-packages/${member?.membershipPackageId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data =
        response.data._data?.data || response.data.data || response.data;
      return data;
    },
    enabled: !!member?.membershipPackageId,
  });

  const checkInLogs = (checkInData as any)?.data || [];

  const handleCheckInSuccess = () => {
    // Refetch check-in logs
    refetchCheckIns();
    setShowQRScanner(false);
  };

  if (isLoading || !email) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-400">
          Loading...
        </div>
      </div>
    );
  }

  if (!statusData || !member) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Member Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Unable to load your membership information.
          </p>
          <button
            onClick={() => navigate("/members/register")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Register
          </button>
        </div>
      </div>
    );
  }

  const status = statusData.status || member.membershipStatus;

  // If not approved/active, redirect
  if (status !== "APPROVED" && status !== "ACTIVE") {
    if (status === "PENDING") {
      navigate("/members/register");
    } else if (status === "REJECTED") {
      navigate("/members/register");
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome, {member.name}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Your membership dashboard
            </p>
          </div>
          <button
            onClick={() => setShowQRScanner(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
              />
            </svg>
            <span>Scan QR / Check In</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Membership Info Card */}
          <div className="lg:col-span-2 space-y-6">
            {/* Membership Status Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Membership Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </label>
                  <p>
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      ACTIVE
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Member ID
                  </label>
                  <p className="text-gray-900 dark:text-white font-mono">
                    {member.memberId || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Start Date
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {member.startDate
                      ? new Date(member.startDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    End Date
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {member.endDate
                      ? new Date(member.endDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Check-in Logs Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Check-in History
              </h2>
              {checkInLogs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Date & Time
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Reason
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {checkInLogs.map((log: any) => (
                        <tr key={log.id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {new Date(log.checkInTime).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                log.status === "ALLOWED"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                            {log.reason || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No check-in history yet.
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Member ID Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Your Member ID
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                <p className="text-2xl font-mono font-bold text-gray-900 dark:text-white">
                  {member.memberId || "N/A"}
                </p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Use this ID at the gym for check-in
              </p>
            </div>

            {/* Package Info Card */}
            {packageData && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Membership Package
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Package
                    </label>
                    <p className="text-gray-900 dark:text-white font-semibold">
                      {packageData.title}
                    </p>
                  </div>
                  {packageData.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Description
                      </label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {packageData.description}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Price
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      ${packageData.price.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Duration
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {packageData.durationDays} days
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && member.memberId && (
        <QRScanner
          memberId={member.memberId}
          onCheckInSuccess={handleCheckInSuccess}
          onClose={() => setShowQRScanner(false)}
        />
      )}
    </div>
  );
}
