import { Button } from "@/components/ui/button";
import {
  useBookmark,
  useBookmarked,
  useBookmarksCount,
  useUnbookmark,
} from "@/lib/hooks/useBookmark";
import {
  useLiked,
  useLikePost,
  useLikesCountByPostId,
  useUnlikePost,
} from "@/lib/hooks/useLike";
import { usePostById } from "@/lib/hooks/usePost";
import { useUserStore } from "@/lib/stores/user";
import { cn } from "@/lib/utils";
import { Bookmark, Heart } from "lucide-react";
import { FC, MouseEvent } from "react";

interface BookmarkButtonProps {
  postId?: number;
  size: number;
}

const BookmarkButton: FC<BookmarkButtonProps> = ({ postId, size }) => {
  const { userId } = useUserStore();

  const { data: post } = usePostById(postId);

  const { data: bookmarksCount } = useBookmarksCount(post?.id);

  const { data: bookmarked } = useBookmarked({ userId, postId: post?.id });

  const bookmark = useBookmark();
  const handleBookmark = (event: MouseEvent) => {
    event.preventDefault();
    userId && post && bookmark.mutate({ userId, postId: post.id });
  };

  const unbookmark = useUnbookmark();
  const handleUnbookmark = (event: MouseEvent) => {
    event.preventDefault();
    userId && post && unbookmark.mutate({ userId, postId: post.id });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={bookmarked ? handleUnbookmark : handleBookmark}
      className={cn(
        "-m-2 h-8 gap-1 p-2 font-normal hover:bg-primary/10 hover:text-primary",
        bookmarked && "text-primary",
      )}
    >
      <Bookmark size={size} className={cn(bookmarked && "fill-current")} />
      {!!bookmarksCount && <span className="text-xs">{bookmarksCount}</span>}
    </Button>
  );
};

export default BookmarkButton;
