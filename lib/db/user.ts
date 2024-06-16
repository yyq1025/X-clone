"use client";

import { supabase } from "@/lib/supabaseClient";
import type { Tables } from "@/lib/types/supabase";
import { omit } from "lodash";
import { nanoid } from "nanoid";

export const getUserById = async (userId: string) => {
  const { data, error } = await supabase
    .from("users")
    .select()
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
};

export const getUserByUsername = async (username: string) => {
  const { data, error } = await supabase
    .from("users")
    .select()
    .eq("username", username)
    .single();
  if (error) throw error;
  return data;
};

export const getTopUsers = async (num: number) => {
  const { data, error } = await supabase.rpc("get_top_users", { num });
  if (error) throw error;
  return data;
};

export const updateUserById = async ({
  userId,
  updates,
}: {
  userId: string;
  updates: Partial<Tables<"users">> & {
    avatarFile?: Blob;
    bannerFile?: Blob | null;
  };
}) => {
  if (updates.avatarFile) {
    const avatarId = nanoid();
    const { error } = await supabase.storage
      .from("profile_images")
      .upload(`${userId}/${avatarId}.jpg`, updates.avatarFile, {
        cacheControl: "3600",
      });
    if (error) throw error;
    const { data: url } = supabase.storage
      .from("profile_images")
      .getPublicUrl(`${userId}/${avatarId}.jpg`);
    updates = { ...updates, avatar: url.publicUrl };
  }
  if (updates.bannerFile) {
    const bannerId = nanoid();
    const { error } = await supabase.storage
      .from("profile_banners")
      .upload(`${userId}/${bannerId}.jpg`, updates.bannerFile, {
        cacheControl: "3600",
      });
    if (error) throw error;
    const { data: url } = supabase.storage
      .from("profile_banners")
      .getPublicUrl(`${userId}/${bannerId}.jpg`);
    updates = { ...updates, banner: url.publicUrl };
  } else if (updates.bannerFile === null) {
    updates = { ...updates, banner: "" };
  }
  const { data, error } = await supabase
    .from("users")
    .update(omit(updates, ["avatarFile", "bannerFile"]))
    .eq("id", userId)
    .select();
  if (error) throw error;
  return data[0];
};
