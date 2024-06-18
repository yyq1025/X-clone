"use client";

import AvatarInput from "@/components/profile/avatar-input";
import BannerInput from "@/components/profile/banner-input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateUserById, useUserById } from "@/lib/hooks/useUser";
import { useUserStore } from "@/lib/stores/user";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { Content } from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
  const { data: user, isLoading } = useUserById(userId);
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
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogPortal>
        <DialogOverlay className="bg-black/40" />
        <Content className="fixed left-[50%] top-[50%] z-50 flex h-[650px] min-h-[400px] min-w-[600px] -translate-x-[50%] -translate-y-[50%] flex-col overflow-hidden rounded-xl bg-background">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="max-h-full overflow-auto pb-16"
            >
              <div className="sticky top-0 z-[2] flex h-[53px] w-full items-center bg-white/85 px-4 backdrop-blur">
                <div className="flex min-w-14 items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={handleClose}
                    className="-m-2 h-auto p-2"
                  >
                    <XMarkIcon className="size-5 stroke-2" />
                  </Button>
                </div>
                <h2 className="flex-auto text-xl font-semibold">
                  Edit profile
                </h2>
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
                  {!isLoading && (
                    <BannerInput
                      onChange={(e) => form.setValue("bannerFile", e)}
                      initialImg={user?.banner || ""}
                    />
                  )}
                </div>
                <div className="relative -mt-12 ml-4 max-w-32 rounded-full border-4 border-white">
                  <div className="pb-[100%]" />
                  {!isLoading && (
                    <AvatarInput
                      onChange={(e) => form.setValue("avatarFile", e)}
                      initialImg={user?.avatar || ""}
                    />
                  )}
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
        </Content>
      </DialogPortal>
    </Dialog>
  );
}
