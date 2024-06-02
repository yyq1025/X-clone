import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { FC } from "react";

interface NavButtonProps {
  href: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
  badgeCount?: number | null;
}

const NavButton: FC<NavButtonProps> = ({
  href,
  icon: Icon,
  label,
  active,
  badgeCount,
}) => {
  return (
    <Button
      variant="ghost"
      size="lg"
      className="flex h-auto p-3 font-normal"
      asChild
    >
      <Link href={href} scroll={false}>
        <div className="relative">
          <Icon size={24} className={cn(active && "fill-current")} />
          {!!badgeCount && (
            <div className="absolute -right-1 -top-1.5 box-content flex h-4 min-w-4 items-center justify-center rounded-full border border-white bg-primary text-[11px] leading-3 text-white">
              {badgeCount}
            </div>
          )}
        </div>
        <h2
          className={cn(
            "ml-5 mr-auto hidden text-xl xl:block",
            active && "font-semibold",
          )}
        >
          {label}
        </h2>
      </Link>
    </Button>
  );
};

export default NavButton;
