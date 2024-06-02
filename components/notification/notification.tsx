import Post from "@/components/post/post";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNotificationById } from "@/lib/hooks/useNotification";
import { usePostById } from "@/lib/hooks/usePost";
import { useUserById } from "@/lib/hooks/useUser";
import { cn } from "@/lib/utils";
import { HeartIcon, UserIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { FC } from "react";

interface NotificationProps {
  notificationId?: number;
}

const Notification: FC<NotificationProps> = ({ notificationId }) => {
  const { data: notification } = useNotificationById(notificationId);
  const { data: sender } = useUserById(notification?.sender_id);
  const { data: recipient } = useUserById(notification?.recipient_id);
  const { data: post, isLoading } = usePostById(notification?.post_id);

  if (!isLoading && !post) return null;

  return (
    <>
      {notification?.type === "reply" && (
        <Post
          postId={notification?.post_id}
          mode="withReplyTo"
          className={cn("border-b", !notification?.read && "bg-primary/10")}
        />
      )}
      {notification?.type === "like" && (
        <Link
          href={`/${recipient?.username}/status/${post?.id}`}
          className={cn(
            "flex border-b px-4 py-3 text-sm transition-colors hover:bg-accent",
            !notification?.read && "bg-primary/10",
          )}
        >
          <div className="mr-2 flex basis-10 flex-col items-end">
            <HeartIcon className="size-8 text-red-500" />
          </div>
          <div className="flex grow flex-col">
            <Avatar className="mb-3 h-8 w-8">
              <AvatarImage src={sender?.avatar || ""} alt={sender?.name} />
              <AvatarFallback>
                {sender?.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="font-semibold">{sender?.name}</span> liked your{" "}
              {post?.parent_id ? "reply" : "post"}
            </div>
            <p className="mt-3 text-gray-500">{post?.content}</p>
          </div>
        </Link>
      )}
      {notification?.type === "follow" && (
        <Link
          href={`/${sender?.username}`}
          className={cn(
            "flex border-b px-4 py-3 text-sm transition-colors hover:bg-accent",
            !notification?.read && "bg-primary/10",
          )}
        >
          <div className="mr-2 flex basis-10 flex-col items-end">
            <UserIcon className="size-8 text-primary" />
          </div>
          <div className="flex grow flex-col">
            <Avatar className="mb-3 h-8 w-8">
              <AvatarImage src={sender?.avatar || ""} alt={sender?.name} />
              <AvatarFallback>
                {sender?.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="font-semibold">{sender?.name}</span> followed you
            </div>
          </div>
        </Link>
      )}
    </>
  );
};

export default Notification;
