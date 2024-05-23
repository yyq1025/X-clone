"use client";

import { getTopUsers, getUserById, getUserByUsername } from "@/lib/db/user";
import { queryClient } from "@/lib/queryClient";
import {
  skipToken,
  useMutation,
  useQueries,
  useQuery,
} from "@tanstack/react-query";

export const useUserById = (userId?: string) => {
  return useQuery({
    queryKey: ["user", "userId", userId],
    queryFn: userId ? () => getUserById(userId) : skipToken,
    enabled: !!userId,
  });
};

export const useUserByUsername = (username?: string) => {
  return useQuery({
    queryKey: ["user", "username", username],
    queryFn: username ? () => getUserByUsername(username) : skipToken,
    enabled: !!username,
  });
};

export const useUsersByIds = (userIds?: string[]) => {
  return useQueries({
    queries:
      userIds?.map((userId) => ({
        queryKey: ["user", "userId", userId],
        queryFn: () => getUserById(userId),
      })) || [],
    combine: (results) => ({
      users: results.map((r) => r.data),
    }),
  });
};

export const useTopUsers = (num: number) => {
  return useQuery({
    queryKey: ["topUsers", num],
    queryFn: () =>
      getTopUsers(num).then((users) => {
        users.forEach((user) => {
          queryClient.setQueryData(["user", user.id], user);
        });
        return users;
      }),
  });
};
