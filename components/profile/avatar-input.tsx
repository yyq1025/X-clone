import getCroppedImg from "@/components/profile/cropImage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import {
  ArrowLeftIcon,
  CameraIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
} from "@heroicons/react/24/outline";
import { Content } from "@radix-ui/react-dialog";
import { FC, useRef, useState } from "react";
import Cropper, { Area, Point } from "react-easy-crop";

interface AvatarInputProps {
  initialImg: string;
  onChange: (event: Blob) => void;
}

const AvatarInput: FC<AvatarInputProps> = ({ initialImg, onChange }) => {
  const [imgSrc, setImgSrc] = useState(initialImg);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [originImg, setOriginImg] = useState("");
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area>({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });

  const showCroppedImage = async () => {
    try {
      const croppedImage = await getCroppedImg(originImg, croppedAreaPixels);
      if (!croppedImage) throw new Error("Failed to get cropped image.");
      onChange(croppedImage);
      setImgSrc(URL.createObjectURL(croppedImage));
      setOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <Avatar className="absolute inset-0 h-full w-full">
        <AvatarImage
          src={imgSrc}
          onLoadingStatusChange={(status) =>
            status === "loaded" && URL.revokeObjectURL(imgSrc)
          }
        />
        <AvatarFallback>Avatar</AvatarFallback>
      </Avatar>
      <div className="absolute inset-0 flex h-full w-full items-center justify-center rounded-full bg-black/30">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="bg-gray-900/75 text-white/75 hover:bg-gray-800/75 hover:text-white/75"
        >
          <CameraIcon className="size-5 stroke-2" />
        </Button>
        <input
          accept="image/jpeg,image/png,image/webp"
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              setOriginImg(URL.createObjectURL(e.target.files[0]));
              setOpen(true);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }
          }}
        />
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogPortal>
          <DialogOverlay className="bg-black/40" />
          <Content className="fixed left-[50%] top-[50%] z-50 flex h-[650px] w-[600px] translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden border bg-background shadow-lg duration-200 sm:rounded-lg">
            <div className="sticky top-0 z-[2] flex h-[53px] w-full items-center bg-white/85 px-4 backdrop-blur">
              <div className="flex min-w-14 items-center">
                <DialogClose asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    className="-m-2 h-auto p-2"
                  >
                    <ArrowLeftIcon className="size-5 stroke-2" />
                  </Button>
                </DialogClose>
              </div>
              <h2 className="flex-auto text-xl font-semibold">Edit media</h2>
              <Button size="sm" onClick={showCroppedImage}>
                Apply
              </Button>
            </div>
            <div className="flex flex-auto flex-col">
              <div className="relative grow">
                <Cropper
                  image={originImg}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, croppedPixels) =>
                    setCroppedAreaPixels(croppedPixels)
                  }
                  showGrid={false}
                  style={{
                    cropAreaStyle: {
                      borderWidth: 4,
                      borderColor: "hsl(var(--primary))",
                      color: "rgba(230, 236, 240, 0.7)",
                    },
                  }}
                />
              </div>
              <div className="flex items-center justify-center p-1">
                <div className="flex h-10 w-[360px] items-center justify-center">
                  <MagnifyingGlassMinusIcon className="mr-3 size-6 stroke-2" />
                  <Slider
                    value={[zoom]}
                    min={1}
                    max={3}
                    step={0.1}
                    onValueChange={(value) => setZoom(value[0])}
                  />
                  <MagnifyingGlassPlusIcon className="ml-3 size-6 stroke-2" />
                </div>
              </div>
            </div>
          </Content>
        </DialogPortal>
      </Dialog>
    </>
  );
};

export default AvatarInput;
