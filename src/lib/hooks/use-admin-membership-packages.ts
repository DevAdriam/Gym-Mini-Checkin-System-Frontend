import { useAsyncQuery } from "./use-async-query";
import { useAsyncMutate } from "./use-async-mutate";
import {
  getMembershipPackages,
  getMembershipPackage,
  createMembershipPackage,
  updateMembershipPackage,
  deleteMembershipPackage,
  updatePackageStatus,
  restoreMembershipPackage,
  type MembershipPackagesQueryParams,
  type CreateMembershipPackageDto,
  type UpdateMembershipPackageDto,
  type UpdatePackageStatusDto,
} from "../api/admin-membership-packages";

// Get Membership Packages Query
export const useMembershipPackages = (params?: MembershipPackagesQueryParams) => {
  return useAsyncQuery({
    queryKey: ["admin", "membership-packages", params],
    queryFn: () => getMembershipPackages(params),
  });
};

// Get Single Membership Package Query
export const useMembershipPackage = (id: string) => {
  return useAsyncQuery({
    queryKey: ["admin", "membership-packages", id],
    queryFn: () => getMembershipPackage(id),
    enabled: !!id,
  });
};

// Create Membership Package Mutation
export const useCreateMembershipPackage = () => {
  return useAsyncMutate({
    mutationFn: (data: CreateMembershipPackageDto) =>
      createMembershipPackage(data),
    successMessage: "Membership package created successfully",
    invalidateQueries: [["admin", "membership-packages"]],
  });
};

// Update Membership Package Mutation
export const useUpdateMembershipPackage = () => {
  return useAsyncMutate({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateMembershipPackageDto;
    }) => updateMembershipPackage(id, data),
    successMessage: "Membership package updated successfully",
    invalidateQueries: [["admin", "membership-packages"]],
  });
};

// Delete Membership Package Mutation
export const useDeleteMembershipPackage = () => {
  return useAsyncMutate({
    mutationFn: (id: string) => deleteMembershipPackage(id),
    successMessage: "Membership package deleted successfully",
    invalidateQueries: [["admin", "membership-packages"]],
  });
};

// Update Package Status Mutation
export const useUpdatePackageStatus = () => {
  return useAsyncMutate({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePackageStatusDto;
    }) => updatePackageStatus(id, data),
    successMessage: "Package status updated successfully",
    invalidateQueries: [["admin", "membership-packages"]],
  });
};

// Restore Membership Package Mutation
export const useRestoreMembershipPackage = () => {
  return useAsyncMutate({
    mutationFn: (id: string) => restoreMembershipPackage(id),
    successMessage: "Membership package restored successfully",
    invalidateQueries: [["admin", "membership-packages"]],
  });
};

