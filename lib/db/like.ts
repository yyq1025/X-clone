"use client";

import { PAGE_SIZE } from "@/lib/db/pagination";
import { supabase } from "@/lib/supabaseClient";
import type { Tables } from "@/lib/types/supabase";

export const getLikesCountByPostId = async (postId: number) => {
  const { count, error } = await supabase
    .from("likes")
    .select("valid_posts(*)", { count: "exact", head: true })
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
    .select("valid_posts(*)", { count: "exact", head: true })
    .match({ post_id, user_id });
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
};

export const getLikesCountByUserId = async (userId: string) => {
  const { count, error } = await supabase
    .from("likes")
    .select("valid_posts(*)", { count: "exact", head: true })
    .eq("user_id", userId);
  if (error) throw error;
  return count;
};

export const getLikedPostsByUserId = async ({
  userId,
  before,
}: {
  userId: string;
  before?: number;
}) => {
  let query = supabase
    .from("likes")
    .select("*, valid_posts(*)")
    .eq("user_id", userId);
  if (before) query = query.lt("id", before);
  const { data, error } = await query
    .order("id", { ascending: false })
    .limit(PAGE_SIZE);
  if (error) throw error;

  return {
    likedPosts: data,
    next:
      data.length === PAGE_SIZE
        ? { userId, before: data[PAGE_SIZE - 1].id }
        : null,
  };
};
