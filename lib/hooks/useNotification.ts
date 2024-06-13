"use client";

import {
  getNotificationById,
  getNotificationsByUserId,
  getUnreadNotificationCountByUserId,
  markNotificationsAsRead,
} from "@/lib/db/notification";
import { optimiticUpdate } from "@/lib/hooks/optimistic";
import { queryClient } from "@/lib/queryClient";
import {
  skipToken,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

export const useNotificationById = (id?: number) => {
  return useQuery({
    queryKey: ["notification", id],
    queryFn: id ? () => getNotificationById(id) : skipToken,
    enabled: !!id,
  });
};

export const useNotificationsByUserId = (userId?: string) => {
  return useInfiniteQuery({
    queryKey: ["notifications", userId],
    queryFn: ({ pageParam }) =>
      getNotificationsByUserId(pageParam).then((data) => {
        data.notifications.forEach((notification) => {
          queryClient.setQueryData(
            ["notification", notification.id],
            notification,
          );
          queryClient.setQueryData(
            ["post", notification.valid_posts?.id],
            notification.valid_posts,
          );
        });
        return data;
      }),
    initialPageParam: { userId: userId as string },
    getNextPageParam: (lastPage) => lastPage.next,
    enabled: !!userId,
  });
};

export const useUnreadCountByUserId = (userId?: string) => {
  return useQuery({
    queryKey: ["unreadCount", userId],
    queryFn: userId
      ? () => getUnreadNotificationCountByUserId(userId)
      : skipToken,
    enabled: !!userId,
    refetchInterval: 1000 * 30,
    structuralSharing: (oldData, newData) => {
      if (oldData !== newData) {
        queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
        return newData;
      }
      return oldData;
    },
  });
};

export const useMarkAllAsRead = () => {
  return useMutation({
    mutationFn: markNotificationsAsRead,
    onMutate: async ({ userId }) => {
      const previousUnreadCount = await optimiticUpdate(
        ["unreadCount", userId],
        0,
      );
      return { previousUnreadCount };
    },
    onError: (_err, { userId }, context: any) => {
      queryClient.setQueryData(
        ["unreadCount", userId],
        context.previousUnreadCount,
      );
    },
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
    },
  });
};
