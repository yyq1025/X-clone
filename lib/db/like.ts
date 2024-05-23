"use client";

import { getPagination, PAGE_SIZE } from "@/lib/common/pagination";
import { supabase } from "@/lib/supabaseClient";
import type { Tables } from "@/lib/types/supabase";

export const getLikesCountByPostId = async (postId: string) => {
  const { count, error } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId);
  if (error) throw error;
  return count;
};

export const getLiked = async ({
  post_id,
  user_id,
}: Pick<Tables<"likes">, "post_id" | "user_id">) => {
  const { count, error } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", post_id)
    .eq("user_id", user_id);
  if (error) throw error;
  return !!count;
};

export const likePost = async ({
  post_id,
  user_id,
}: Pick<Tables<"likes">, "post_id" | "user_id">) => {
  const { error } = await supabase
    .from("likes")
    .upsert({ post_id, user_id }, { ignoreDuplicates: true });
  if (error) throw error;
  return true;
};

export const unlikePost = async ({
  post_id,
  user_id,
}: Pick<Tables<"likes">, "post_id" | "user_id">) => {
  const { error } = await supabase
    .from("likes")
    .delete()
    .match({ post_id, user_id });
  if (error) throw error;
  return false;
};

export const getLikesCountByUserId = async (userId: string) => {
  const { count, error } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);
  if (error) throw error;
  return count;
};

export const getLikedPostsByUserId = async ({
  userId,
  page,
}: {
  userId: string;
  page: number;
}) => {
  const { from, to } = getPagination(page);
  const { data, error } = await supabase
    .from("likes")
    .select("posts(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error) throw error;

  return {
    likedPosts: data,
    next: data.length === PAGE_SIZE ? page + 1 : null,
  };
};
