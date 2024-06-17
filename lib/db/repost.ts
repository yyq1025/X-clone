"use client";

import { PAGE_SIZE } from "@/lib/db/pagination";
import { supabase } from "@/lib/supabaseClient";
import type { Tables } from "@/lib/types/supabase";

export const getRepostCountByPostId = async (postId: number) => {
  const { count, error } = await supabase
    .from("repost")
    .select("valid_posts(*)", { count: "exact", head: true })
    .eq("post_id", postId);
  if (error) throw error;
  return count;
};

export const getReposted = async ({
  post_id,
  user_id,
}: Pick<Tables<"repost">, "post_id" | "user_id">) => {
  const { count, error } = await supabase
    .from("repost")
    .select("valid_posts(*)", { count: "exact", head: true })
    .match({ post_id, user_id });
  if (error) throw error;
  return !!count;
};

export const repost = async ({
  post_id,
  user_id,
}: Pick<Tables<"repost">, "post_id" | "user_id">) => {
  const { error } = await supabase
    .from("repost")
    .upsert({ post_id, user_id }, { ignoreDuplicates: true });
  if (error) throw error;
};

export const unrepost = async ({
  post_id,
  user_id,
}: Pick<Tables<"repost">, "post_id" | "user_id">) => {
  const { error } = await supabase
    .from("repost")
    .delete()
    .match({ post_id, user_id });
  if (error) throw error;
};

export const getRepostedPostsByUserId = async ({
  userId,
  before,
}: {
  userId: string;
  before?: number;
}) => {
  let query = supabase
    .from("repost")
    .select("*, valid_posts(*)")
    .eq("user_id", userId);
  if (before) query = query.lt("id", before);
  const { data, error } = await query
    .order("id", { ascending: false })
    .limit(PAGE_SIZE);
  if (error) throw error;

  return {
    repostedPosts: data,
    next:
      data.length === PAGE_SIZE
        ? { userId, before: data[PAGE_SIZE - 1].id }
        : null,
  };
};