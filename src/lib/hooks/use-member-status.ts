import { useAsyncQuery } from "./use-async-query";
import {
  checkMemberStatus,
  type MemberStatusResponse,
} from "../api/member-status";

// Check Member Status Query
export const useCheckMemberStatus = (email: string) => {
  return useAsyncQuery<MemberStatusResponse | null>({
    queryKey: ["member", "check-status", email],
    queryFn: () => checkMemberStatus(email),
    enabled: !!email,
    retry: false,
  });
};
