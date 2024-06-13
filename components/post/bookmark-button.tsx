import { Button } from "@/components/ui/button";
import {
  useBookmark,
  useBookmarked,
  useBookmarksCount,
  useUnbookmark,
} from "@/lib/hooks/useBookmark";
import { usePostById } from "@/lib/hooks/usePost";
import { useUserStore } from "@/lib/stores/user";
import { cn } from "@/lib/utils";
import { BookmarkIcon as BookmarkOutline } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";
import { FC, MouseEvent } from "react";

interface BookmarkButtonProps {
  postId?: number;
  className?: string;
}

const BookmarkButton: FC<BookmarkButtonProps> = ({ postId, className }) => {
  const { userId } = useUserStore();

  const { data: post } = usePostById(postId);

  const { data: bookmarksCount } = useBookmarksCount(post?.id);

  const { data: bookmarked } = useBookmarked({ userId, postId: post?.id });

  const bookmark = useBookmark();
  const handleBookmark = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    userId && post && bookmark.mutate({ userId, postId: post.id });
  };

  const unbookmark = useUnbookmark();
  const handleUnbookmark = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    userId && post && unbookmark.mutate({ userId, postId: post.id });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={bookmarked ? handleUnbookmark : handleBookmark}
      className={cn(
        "-m-2 h-auto gap-1 p-2 font-normal hover:bg-primary/10 hover:text-primary",
        bookmarked && "text-primary",
      )}
    >
      {bookmarked ? (
        <BookmarkSolid className={cn(className)} />
      ) : (
        <BookmarkOutline className={cn("stroke-2", className)} />
      )}
      {!!bookmarksCount && <span className="text-xs">{bookmarksCount}</span>}
    </Button>
  );
};

export default BookmarkButton;
