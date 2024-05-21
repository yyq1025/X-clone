import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface NavProps {
  links: {
    title: string;
    icon: LucideIcon;
    variant: "secondary" | "ghost";
    onClick: () => void;
  }[];
}

const Nav: React.FC<NavProps> = ({ links }) => {
  return (
    <nav className="flex flex-col gap-2">
      {links.map((link, index) => (
        <Button
          key={index}
          variant={link.variant}
          className="flex justify-start gap-4"
          onClick={link.onClick}
        >
          <link.icon size={20} />
          <span className="hidden xl:block">{link.title}</span>
        </Button>
      ))}
    </nav>
  );
};

export default Nav;
