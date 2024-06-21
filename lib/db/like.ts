"use client";

import { supabase } from "@/lib/supabaseClient";
import type { Tables } from "@/lib/types/supabase";

export const getLikesCountByPostId = async (postId: number) => {
  const { count, error } = await supabase
    .from("like")
    .select("valid_posts(*)", { count: "exact", head: true })
    .eq("post_id", postId);
  if (error) throw error;
  return count;
};

export const getLiked = async ({
  post_id,
  user_id,
}: Pick<Tables<"like">, "post_id" | "user_id">) => {
  const { count, error } = await supabase
    .from("like")
    .select("valid_posts(*)", { count: "exact", head: true })
    .match({ post_id, user_id });
  if (error) throw error;
  return !!count;
};

export const likePost = async ({
  post_id,
  user_id,
}: Pick<Tables<"like">, "post_id" | "user_id">) => {
  const { error } = await supabase
    .from("like")
    .upsert({ post_id, user_id }, { ignoreDuplicates: true });
  if (error) throw error;
};

export const unlikePost = async ({
  post_id,
  user_id,
}: Pick<Tables<"like">, "post_id" | "user_id">) => {
  const { error } = await supabase
    .from("like")
    .delete()
    .match({ post_id, user_id });
  if (error) throw error;
};
