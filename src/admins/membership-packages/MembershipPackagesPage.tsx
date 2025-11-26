import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useMembershipPackages,
  useCreateMembershipPackage,
  useUpdateMembershipPackage,
  useDeleteMembershipPackage,
  useUpdatePackageStatus,
} from "../../lib/hooks/use-admin-membership-packages";
import type { MembershipPackage } from "../../types/index";

const packageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  durationDays: z.number().min(1, "Duration must be at least 1 day"),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

type PackageFormData = z.infer<typeof packageSchema>;

export default function MembershipPackagesPage() {
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(
    undefined
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] =
    useState<MembershipPackage | null>(null);
  const [deletingPackage, setDeletingPackage] =
    useState<MembershipPackage | null>(null);

  const {
    data: packages,
    isLoading,
    error,
  } = useMembershipPackages(
    isActiveFilter !== undefined ? { isActive: isActiveFilter } : undefined
  );

  const createMutation = useCreateMembershipPackage();
  const updateMutation = useUpdateMembershipPackage();
  const deleteMutation = useDeleteMembershipPackage();
  const statusMutation = useUpdatePackageStatus();

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    formState: { errors: createErrors },
    reset: resetCreate,
  } = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      isActive: true,
    },
  });

  const {
    register: registerUpdate,
    handleSubmit: handleSubmitUpdate,
    formState: { errors: updateErrors },
    reset: resetUpdate,
  } = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
  });

  const handleCreate = (data: PackageFormData) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsCreateModalOpen(false);
        resetCreate();
      },
    });
  };

  const handleUpdate = (data: PackageFormData) => {
    if (editingPackage) {
      updateMutation.mutate(
        { id: editingPackage.id, data },
        {
          onSuccess: () => {
            setEditingPackage(null);
            resetUpdate();
          },
        }
      );
    }
  };

  const handleDelete = (pkg: MembershipPackage) => {
    setDeletingPackage(pkg);
  };

  const confirmDelete = () => {
    if (deletingPackage) {
      deleteMutation.mutate(deletingPackage.id, {
        onSuccess: () => {
          setDeletingPackage(null);
        },
      });
    }
  };

  const handleToggleStatus = (pkg: MembershipPackage) => {
    statusMutation.mutate({
      id: pkg.id,
      data: { isActive: !pkg.isActive },
    });
  };

  const openEditModal = (pkg: MembershipPackage) => {
    setEditingPackage(pkg);
    resetUpdate({
      title: pkg.title,
      description: pkg.description || "",
      price: pkg.price,
      durationDays: pkg.durationDays,
      sortOrder: pkg.sortOrder,
      isActive: pkg.isActive,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600 dark:text-gray-400">
          Loading packages...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600 dark:text-red-400">
          Error loading packages
        </div>
      </div>
    );
  }

  const packagesList = Array.isArray(packages) ? packages : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Membership Packages
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage membership packages and pricing
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Create Package
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex items-center gap-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Status
          </label>
          <select
            value={
              isActiveFilter === undefined
                ? "all"
                : isActiveFilter
                ? "active"
                : "inactive"
            }
            onChange={(e) => {
              const value = e.target.value;
              setIsActiveFilter(
                value === "all" ? undefined : value === "active" ? true : false
              );
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Packages Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {packagesList.length > 0 ? (
                packagesList.map((pkg) => (
                  <tr key={pkg.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {pkg.title}
                      </div>
                      {pkg.description && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {pkg.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      ${pkg.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {pkg.durationDays} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          pkg.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {pkg.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openEditModal(pkg)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(pkg)}
                        className={`${
                          pkg.isActive
                            ? "text-orange-600 hover:text-orange-900 dark:text-orange-400"
                            : "text-green-600 hover:text-green-900 dark:text-green-400"
                        }`}
                      >
                        {pkg.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDelete(pkg)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No packages found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/10 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Create Membership Package
            </h2>
            <form
              onSubmit={handleSubmitCreate(handleCreate)}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Title *
                </label>
                <input
                  {...registerCreate("title")}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
                {createErrors.title && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {createErrors.title.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  {...registerCreate("description")}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...registerCreate("price", { valueAsNumber: true })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                  {createErrors.price && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {createErrors.price.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Duration (Days) *
                  </label>
                  <input
                    type="number"
                    {...registerCreate("durationDays", { valueAsNumber: true })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                  {createErrors.durationDays && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {createErrors.durationDays.message}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sort Order
                </label>
                <input
                  type="number"
                  {...registerCreate("sortOrder", { valueAsNumber: true })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...registerCreate("isActive")}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Active
                </label>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    resetCreate();
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {createMutation.isPending ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Edit Membership Package
            </h2>
            <form
              onSubmit={handleSubmitUpdate(handleUpdate)}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Title *
                </label>
                <input
                  {...registerUpdate("title")}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
                {updateErrors.title && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {updateErrors.title.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  {...registerUpdate("description")}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...registerUpdate("price", { valueAsNumber: true })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                  {updateErrors.price && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {updateErrors.price.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Duration (Days) *
                  </label>
                  <input
                    type="number"
                    {...registerUpdate("durationDays", { valueAsNumber: true })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                  {updateErrors.durationDays && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {updateErrors.durationDays.message}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sort Order
                </label>
                <input
                  type="number"
                  {...registerUpdate("sortOrder", { valueAsNumber: true })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPackage(null);
                    resetUpdate();
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {updateMutation.isPending ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingPackage && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Delete Membership Package
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold">"{deletingPackage.title}"</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setDeletingPackage(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
