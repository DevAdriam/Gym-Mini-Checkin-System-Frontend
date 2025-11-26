import { useState } from "react";
import {
  useMembers,
  useApproveMember,
  useRejectMember,
  useMemberDetail,
  useMemberImages,
} from "../../lib/hooks/use-admin-members";

export default function AdminMembersPage() {
  const [statusFilter, setStatusFilter] = useState<
    "PENDING" | "APPROVED" | "REJECTED" | ""
  >("");
  const [activeFilter, setActiveFilter] = useState<"ACTIVE" | "EXPIRED" | "">(
    ""
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const { data, isLoading, error } = useMembers({
    status: statusFilter || undefined,
    active: activeFilter || undefined,
    search: searchQuery || undefined,
    page: 1,
    limit: 50,
  });

  const approveMutation = useApproveMember();
  const rejectMutation = useRejectMember();

  const { data: memberDetail } = useMemberDetail(selectedMemberId || "");
  const { data: memberImages } = useMemberImages(selectedMemberId || "");

  const members = (data as any)?.data || [];

  const handleApprove = (id: string) => {
    if (confirm("Are you sure you want to approve this member?")) {
      approveMutation.mutate(id);
    }
  };

  const handleReject = (id: string) => {
    if (confirm("Are you sure you want to reject this member?")) {
      rejectMutation.mutate(id);
    }
  };

  const handleViewDetail = (id: string) => {
    setSelectedMemberId(id);
  };

  const closeDetailModal = () => {
    setSelectedMemberId(null);
  };

  const paymentScreenshots =
    (memberImages as any)?.filter(
      (img: any) => img.type === "PAYMENT_SCREENSHOT"
    ) || [];
  const profileImage = (memberImages as any)?.find(
    (img: any) => img.type === "PROFILE"
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600 dark:text-gray-400">
          Loading members...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600 dark:text-red-400">
          Error loading members
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Members Management
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          View and manage all gym members
        </p>
      </div>

      {/* Filters */}
      <div className="mb-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as "PENDING" | "APPROVED" | "REJECTED" | ""
                )
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Membership
            </label>
            <select
              value={activeFilter}
              onChange={(e) =>
                setActiveFilter(e.target.value as "ACTIVE" | "EXPIRED" | "")
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value="">All</option>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Membership End
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {members && members.length > 0 ? (
                members.map((member: (typeof members)[0]) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {member.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {member.email || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {member.phone || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          member.membershipStatus === "ACTIVE"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : member.membershipStatus === "EXPIRED"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : member.membershipStatus === "APPROVED"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : member.membershipStatus === "REJECTED"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}
                      >
                        {member.membershipStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {member.endDate
                        ? new Date(member.endDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetail(member.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs"
                        >
                          View Detail
                        </button>
                        {member.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleApprove(member.id)}
                              disabled={
                                approveMutation.isPending ||
                                rejectMutation.isPending
                              }
                              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                            >
                              {approveMutation.isPending ? "..." : "Approve"}
                            </button>
                            <button
                              onClick={() => handleReject(member.id)}
                              disabled={
                                approveMutation.isPending ||
                                rejectMutation.isPending
                              }
                              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                            >
                              {rejectMutation.isPending ? "..." : "Reject"}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Detail Modal */}
      {selectedMemberId && memberDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Member Details
                </h2>
                <button
                  onClick={closeDetailModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Member Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Name
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {(memberDetail as any).name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Email
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {(memberDetail as any).email || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Phone
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {(memberDetail as any).phone || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Member ID
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {(memberDetail as any).memberId || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Membership Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </label>
                      <p>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            (memberDetail as any).membershipStatus === "ACTIVE"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : (memberDetail as any).membershipStatus ===
                                "EXPIRED"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : (memberDetail as any).membershipStatus ===
                                "APPROVED"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : (memberDetail as any).membershipStatus ===
                                "REJECTED"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          }`}
                        >
                          {(memberDetail as any).membershipStatus}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Start Date
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {(memberDetail as any).startDate
                          ? new Date(
                              (memberDetail as any).startDate
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        End Date
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {(memberDetail as any).endDate
                          ? new Date(
                              (memberDetail as any).endDate
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Photo */}
              {profileImage && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Profile Photo
                  </h3>
                  <img
                    src={profileImage.imageUrl}
                    alt="Profile"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Payment Screenshots */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Payment Screenshots ({paymentScreenshots.length})
                </h3>
                {paymentScreenshots.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paymentScreenshots.map((screenshot: any) => (
                      <div
                        key={screenshot.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <img
                          src={screenshot.imageUrl}
                          alt="Payment screenshot"
                          className="w-full h-48 object-cover rounded-lg mb-2"
                        />
                        {screenshot.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {screenshot.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    No payment screenshots available
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              {(memberDetail as any).membershipStatus === "PENDING" && (
                <div className="mt-6 flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      handleApprove(selectedMemberId);
                      closeDetailModal();
                    }}
                    disabled={
                      approveMutation.isPending || rejectMutation.isPending
                    }
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {approveMutation.isPending ? "Approving..." : "Approve"}
                  </button>
                  <button
                    onClick={() => {
                      handleReject(selectedMemberId);
                      closeDetailModal();
                    }}
                    disabled={
                      approveMutation.isPending || rejectMutation.isPending
                    }
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {rejectMutation.isPending ? "Rejecting..." : "Reject"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
