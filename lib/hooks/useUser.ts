"use client";

import { createUserIfNotExists, getUserById } from "@/lib/db/user";
import { queryClient } from "@/lib/queryClient";
import {
  skipToken,
  useMutation,
  useQueries,
  useQuery,
} from "@tanstack/react-query";

export const useAddUser = () => {
  return useMutation({
    mutationFn: createUserIfNotExists,
    onSuccess: (data) => {
      queryClient.setQueryData(["user", data.userId], data);
    },
  });
};

export const useUserById = (userId?: string) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: userId ? () => getUserById(userId) : skipToken,
    enabled: !!userId,
  });
};

export const useUsersByIds = (userIds?: string[]) => {
  return useQueries({
    queries:
      userIds?.map((userId) => ({
        queryKey: ["user", userId],
        queryFn: () => getUserById(userId),
      })) || [],
    combine: (results) => ({
      users: results.map((r) => r.data),
    }),
  });
};
