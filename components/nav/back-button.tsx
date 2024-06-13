import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { FC } from "react";

const BackButton: FC = () => {
  const router = useRouter();

  const handleBack = () => {
    history.length > 1
      ? router.back()
      : router.push("/home", { scroll: false });
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      className="-m-2 h-auto p-2"
      onClick={handleBack}
    >
      <ArrowLeftIcon className="size-5 stroke-2" />
    </Button>
  );
};

export default BackButton;
