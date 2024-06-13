import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFollow, useFollowed, useUnfollow } from "@/lib/hooks/useFollow";
import { useDeletePost, usePostById } from "@/lib/hooks/usePost";
import { useUserById } from "@/lib/hooks/useUser";
import { useUserStore } from "@/lib/stores/user";
import {
  EllipsisHorizontalIcon,
  UserMinusIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { Trash2 } from "lucide-react";
import { FC, MouseEvent, useState } from "react";

interface MoreButtonProps {
  postId?: number;
}

const MoreButton: FC<MoreButtonProps> = ({ postId }) => {
  const { userId } = useUserStore();

  const { data: post } = usePostById(postId);

  const { data: postOwner } = useUserById(post?.owner_id);

  const { data: followed } = useFollowed({
    followerId: userId,
    followingId: postOwner?.id,
  });

  const follow = useFollow();
  const handleFollow = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    userId &&
      postOwner &&
      follow.mutate({ followerId: userId, followingId: postOwner.id });
  };

  const unfollow = useUnfollow();
  const handleUnfollow = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    userId &&
      postOwner &&
      unfollow.mutate({ followerId: userId, followingId: postOwner.id });
  };

  const [open, setOpen] = useState(false);
  const deletePost = useDeletePost();
  const handleDelete = async (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    post?.id && (await deletePost.mutateAsync(post.id));
    setOpen(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="-m-2 h-auto gap-1 p-2 hover:bg-primary/10 hover:text-primary"
        >
          <EllipsisHorizontalIcon className="size-5 stroke-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="font-semibold"
        onClick={(e) => e.stopPropagation()}
      >
        {userId === postOwner?.id ? (
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                onClick={(e) => e.stopPropagation()}
                className="flex cursor-pointer px-4 py-3 text-destructive focus:text-destructive"
              >
                <div className="flex items-center pr-3">
                  <Trash2 size={20} />
                </div>
                <span className="flex-auto">Delete</span>
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent className="w-80">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete post?</AlertDialogTitle>
                <AlertDialogDescription>
                  This can&apos;t be undone and it will be removed from your profile,
                  the timeline of any accounts that follow you, and from search
                  results.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex flex-col gap-3">
                <Button
                  size="lg"
                  variant="destructive"
                  className="w-full"
                  onClick={handleDelete}
                >
                  Delete
                </Button>
                <AlertDialogCancel asChild>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Cancel
                  </Button>
                </AlertDialogCancel>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        ) : followed ? (
          <DropdownMenuItem
            onSelect={handleUnfollow}
            className="flex cursor-pointer px-4 py-3"
          >
            <div className="flex items-center pr-3">
              <UserMinusIcon className="size-5 stroke-2" />
            </div>
            <span className="flex-auto">Unfollow @{postOwner?.username}</span>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onSelect={handleFollow}
            className="flex cursor-pointer px-4 py-3"
          >
            <div className="flex items-center pr-3">
              <UserPlusIcon className="size-5 stroke-2" />
            </div>
            <span className="flex-auto">Follow @{postOwner?.username}</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MoreButton;
