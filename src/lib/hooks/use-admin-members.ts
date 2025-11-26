import { useAsyncQuery } from "./use-async-query";
import { useAsyncMutate } from "./use-async-mutate";
import {
  getMembers,
  getMemberDetail,
  approveMember,
  rejectMember,
  deleteMember,
  restoreMember,
  getMemberImages,
} from "../api";
import type { MembersQueryParams } from "../../types/index";

// Get Members Query
export const useMembers = (params?: MembersQueryParams) => {
  return useAsyncQuery({
    queryKey: ["admin", "members", params],
    queryFn: () => getMembers(params),
  });
};

// Get Member Detail Query
export const useMemberDetail = (id: string) => {
  return useAsyncQuery({
    queryKey: ["admin", "members", id],
    queryFn: () => getMemberDetail(id),
    enabled: !!id,
  });
};

// Approve Member Mutation
export const useApproveMember = () => {
  return useAsyncMutate({
    mutationFn: (id: string) => approveMember(id),
    successMessage: "Member approved successfully",
    invalidateQueries: [["admin", "members"]],
  });
};

// Reject Member Mutation
export const useRejectMember = () => {
  return useAsyncMutate({
    mutationFn: (id: string) => rejectMember(id),
    successMessage: "Member rejected",
    invalidateQueries: [["admin", "members"]],
  });
};

// Delete Member Mutation
export const useDeleteMember = () => {
  return useAsyncMutate({
    mutationFn: (id: string) => deleteMember(id),
    successMessage: "Member deleted successfully",
    invalidateQueries: [["admin", "members"]],
  });
};

// Restore Member Mutation
export const useRestoreMember = () => {
  return useAsyncMutate({
    mutationFn: (id: string) => restoreMember(id),
    successMessage: "Member restored successfully",
    invalidateQueries: [["admin", "members"]],
  });
};

// Get Member Images Query
export const useMemberImages = (id: string) => {
  return useAsyncQuery({
    queryKey: ["admin", "members", id, "images"],
    queryFn: () => getMemberImages(id),
    enabled: !!id,
  });
};
