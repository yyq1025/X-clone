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
          notification.post_id &&
            queryClient.setQueryData(
              ["postId", notification.post_id],
              notification.valid_posts,
            );
          switch (notification.type) {
            case "reply":
              queryClient.invalidateQueries({
                queryKey: [
                  "postId",
                  notification.valid_posts?.parent_id,
                  "reply",
                ],
              });
              queryClient.invalidateQueries({
                queryKey: ["userId", notification.sender_id, "post"],
              });
              break;
            case "follow":
              queryClient.invalidateQueries({
                queryKey: ["userId", notification.sender_id, "follow"],
              });
              queryClient.invalidateQueries({
                queryKey: ["userId", notification.recipient_id, "follow"],
              });
              break;
            case "like":
              queryClient.invalidateQueries({
                queryKey: ["postId", notification.post_id, "like"],
              });
              break;
            case "repost":
              queryClient.invalidateQueries({
                queryKey: ["postId", notification.post_id, "repost"],
              });
              queryClient.invalidateQueries({
                queryKey: ["userId", notification.sender_id, "post"],
              });
              break;
            default:
              break;
          }
        });
        return data;
      }),
    initialPageParam: { userId: userId! },
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
