"use client";

import Notification from "@/components/notification/notification";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import {
  useMarkAllAsRead,
  useNotificationsByUserId,
  useUnreadCountByUserId,
} from "@/lib/hooks/useNotification";
import { useUserStore } from "@/lib/stores/user";
import { InView } from "react-intersection-observer";

export default function Notifications() {
  const { userId } = useUserStore();
  const markAllAsRead = useMarkAllAsRead();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
    isLoading,
  } = useNotificationsByUserId(userId);

  useInfiniteScroll({
    fetchMore: fetchNextPage,
    hasMore: hasNextPage,
    isFetching: isFetchingNextPage,
  });

  const handleRead = (inView: boolean) => {
    if (inView) {
      const lastestNotificationId = data?.pages[0].notifications[0].id;
      const lastestNotificationUnread = !data?.pages[0].notifications[0].read;
      userId &&
        lastestNotificationId &&
        lastestNotificationUnread &&
        markAllAsRead.mutate({ userId, lastestNotificationId });
    }
  };

  return (
    <>
      <div className="sticky top-0 z-[1] flex h-[53px] w-full items-center justify-center border-b bg-white/85 px-4 backdrop-blur">
        <div className="flex h-full flex-auto flex-col items-stretch justify-center">
          <h2 className="py-0.5 text-xl font-semibold">Notifications</h2>
        </div>
      </div>
      {!isLoading && !isRefetching && (
        <InView className="h-0" onChange={handleRead} triggerOnce />
      )}
      {data?.pages.map((page) =>
        page.notifications.map((notification) => (
          <Notification
            key={notification.id}
            notificationId={notification.id}
          />
        )),
      )}
    </>
  );
}
