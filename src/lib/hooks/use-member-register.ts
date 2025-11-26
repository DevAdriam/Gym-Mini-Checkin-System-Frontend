import { useAsyncQuery } from "./use-async-query";
import { useAsyncMutate } from "./use-async-mutate";
import {
  getAvailablePackages,
  registerMember,
  type MemberRegisterDto,
} from "../api/member-register";

// Get Available Packages Query
export const useAvailablePackages = () => {
  return useAsyncQuery({
    queryKey: ["member", "packages", "available"],
    queryFn: () => getAvailablePackages(),
  });
};

// Register Member Mutation
export const useRegisterMember = () => {
  return useAsyncMutate({
    mutationFn: (data: MemberRegisterDto) => registerMember(data),
    successMessage: "Registration submitted successfully! We'll review your application soon.",
    showErrorToast: true,
  });
};

