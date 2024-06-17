import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserById } from "@/lib/hooks/useUser";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { forwardRef, HTMLAttributes } from "react";

const UserAvatar = forwardRef<
  HTMLAnchorElement,
  HTMLAttributes<HTMLAnchorElement> & { uid?: string }
>(({ uid, className, ...props }, ref) => {
  const { data: user } = useUserById(uid);
  return (
    <Link
      ref={ref}
      href={`/${user?.username}`}
      scroll={false}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      <Avatar className={cn(className)}>
        <AvatarImage src={user?.avatar} />
        <AvatarFallback>{user?.name.charAt(0).toUpperCase()}</AvatarFallback>
        <div className="absolute inset-0 h-full w-full hover:bg-gray-900/15" />
      </Avatar>
    </Link>
  );
});
UserAvatar.displayName = "UserAvatar";

export default UserAvatar;
