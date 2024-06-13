import { useUserById } from "@/lib/hooks/useUser";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { forwardRef, HTMLAttributes } from "react";

const Username = forwardRef<
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
      className={cn(className)}
      {...props}
    >
      @{user?.username}
    </Link>
  );
});
Username.displayName = "Username";

export default Username;
