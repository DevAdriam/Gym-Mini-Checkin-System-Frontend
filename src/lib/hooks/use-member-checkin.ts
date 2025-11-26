import { useAsyncMutate } from "./use-async-mutate";
import { memberCheckIn, type CheckInResponse } from "../api/member-checkin";

// Member Check-in Mutation
export const useMemberCheckIn = () => {
  return useAsyncMutate<CheckInResponse, Error, string>({
    mutationFn: (memberId: string) => memberCheckIn(memberId),
    successMessage: "Check-in successful!",
    errorMessage: "Check-in failed",
    invalidateQueries: [["member", "checkins"]],
  });
};

