import PostCreate from "@/components/post/post-create";
import { Button, ButtonProps } from "@/components/ui/button";
import { Dialog, DialogPanel } from "@headlessui/react";
import { X } from "lucide-react";
import { FC, ReactNode, useState } from "react";

interface PostModalProps {
  renderTrigger: (props: { buttonProps: ButtonProps }) => ReactNode;
}

const PostModal: FC<PostModalProps> = ({ renderTrigger }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {renderTrigger({ buttonProps: { onClick: () => setOpen(true) } })}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        className="fixed top-0 z-[2] flex h-full w-screen items-start justify-center bg-black/40"
      >
        <DialogPanel className="relative top-[5%] flex min-w-[600px] shrink flex-col rounded-xl bg-white">
          <div className="flex h-[53px] w-full items-center px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="rounded-full p-2"
            >
              <X size={20} />
            </Button>
          </div>
          <PostCreate minRows={3} afterSubmit={() => setOpen(false)} />
        </DialogPanel>
      </Dialog>
    </>
  );
};

export default PostModal;
