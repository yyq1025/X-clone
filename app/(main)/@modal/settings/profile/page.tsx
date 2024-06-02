"use client";

import AvatarInput from "@/components/profile/avatar-input";
import BannerInput from "@/components/profile/banner-input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateUserById, useUserById } from "@/lib/hooks/useUser";
import { useUserStore } from "@/lib/stores/user";
import { Dialog, DialogPanel } from "@headlessui/react";
import { CameraIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const FormSchema = z.object({
  name: z.string().min(1, {
    message: "Name can't be blank",
  }),
  bio: z.string(),
  location: z.string(),
  website: z.string().url().or(z.literal("")),
  avatarFile: z.instanceof(Blob).optional(),
  bannerFile: z.instanceof(Blob).nullish(),
});

export default function ProfileModal() {
  const router = useRouter();
  const { userId } = useUserStore();
  const { data: user } = useUserById(userId);
  const updateUser = useUpdateUserById();

  const form = useForm<z.infer<typeof FormSchema>>({
    mode: "onBlur",
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: user?.name,
      bio: user?.bio,
      location: user?.location,
      website: user?.website,
    },
  });

  const handleClose = () => {
    history.length > 1
      ? history.back()
      : router.push("/home", { scroll: false });
  };

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    console.log(data);
    userId &&
      (await updateUser.mutateAsync({
        userId,
        updates: data,
      }));
    handleClose();
  };

  useEffect(() => {
    form.register("avatarFile");
    form.register("bannerFile");
  }, []);

  return (
    <Dialog
      open={true}
      onClose={handleClose}
      className="fixed top-0 z-[2] flex h-full w-screen items-center justify-center bg-black/40"
    >
      <DialogPanel className="relative flex h-[650px] min-h-[400px] min-w-[600px] shrink flex-col overflow-hidden rounded-xl bg-white">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="max-h-full overflow-auto pb-16"
          >
            <div className="sticky top-0 z-[2] flex h-[53px] w-full items-center bg-white/85 px-4 backdrop-blur">
              <div className="min-w-14">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={handleClose}
                  className="rounded-full p-2"
                >
                  <X size={20} />
                </Button>
              </div>
              <h2 className="flex-auto text-xl font-semibold">Edit profile</h2>
              <Button
                size="sm"
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                Save
              </Button>
            </div>
            <div className="flex flex-col">
              <div className="relative w-full border-2 border-white">
                <div className="pb-[33.3%]" />
                {/* <img
                  className="absolute inset-0 h-full w-full object-cover"
                  src="https://pbs.twimg.com/profile_banners/1636470674725257216/1679000255/1080x360"
                />
                <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-black/30"></div> */}
                <BannerInput onChange={(e) => form.setValue("bannerFile", e)}
                  initialImg={user?.banner || ""}/>
              </div>
              <div className="relative -mt-12 ml-4 max-w-32 rounded-full border-4 border-white">
                <div className="pb-[100%]" />
                <AvatarInput
                  onChange={(e) => form.setValue("avatarFile", e)}
                  initialImg={user?.avatar || ""}
                />
              </div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="px-4 py-3">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem className="px-4 py-3">
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Bio" rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem className="px-4 py-3">
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem className="px-4 py-3">
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="Website" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </DialogPanel>
    </Dialog>
  );
}
