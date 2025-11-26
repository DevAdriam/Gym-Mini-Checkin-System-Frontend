import { useAsyncQuery } from "./use-async-query";
import { getCheckInLogs, getMemberCheckIns } from "../api";
import type { CheckInsQueryParams } from "../../types/index";

// Get Check-in Logs Query
export const useCheckInLogs = (params?: CheckInsQueryParams) => {
  return useAsyncQuery({
    queryKey: ["admin", "checkin-logs", params],
    queryFn: () => getCheckInLogs(params),
  });
};

// Get Member Check-ins Query
export const useMemberCheckIns = (
  memberId: string,
  params?: Omit<CheckInsQueryParams, "memberId">
) => {
  return useAsyncQuery({
    queryKey: ["admin", "checkin-logs", "member", memberId, params],
    queryFn: () => getMemberCheckIns(memberId, params),
    enabled: !!memberId,
  });
};
