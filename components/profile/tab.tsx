import { cn } from "@/lib/utils";
import Link from "next/link";
import { FC } from "react";

interface TabProps {
  href: string;
  label: string;
  active: boolean;
}

const Tab: FC<TabProps> = ({ href, label, active }) => (
  <Link
    href={href}
    replace
    scroll={false}
    className="flex grow justify-center px-4"
  >
    <div
      className={cn(
        "relative flex h-[53px] justify-center py-4 font-medium",
        active && "font-semibold text-foreground",
      )}
    >
      {label}
      {active && <div className="absolute inset-x-0 bottom-0 h-1 bg-primary" />}
    </div>
  </Link>
);

export default Tab;
