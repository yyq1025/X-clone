"use client";

import { getPagination, PAGE_SIZE } from "@/lib/db/pagination";
import { supabase } from "@/lib/supabaseClient";
import type { Tables } from "@/lib/types/supabase";

export const getBookmarked = async ({
  user_id,
  post_id,
}: Pick<Tables<"bookmarks">, "user_id" | "post_id">) => {
  const { count, error } = await supabase
    .from("bookmarks")
    .select("valid_posts(*)", { count: "exact", head: true })
    .match({ user_id, post_id });
  if (error) throw error;
  return !!count;
};

export const getBookmarksCount = async (postId: number) => {
  const { count, error } = await supabase
    .from("bookmarks")
    .select("valid_posts(*)", { count: "exact", head: true })
    .eq("post_id", postId);
  if (error) throw error;
  return count;
};

export const bookmark = async ({
  user_id,
  post_id,
}: Pick<Tables<"bookmarks">, "user_id" | "post_id">) => {
  const { error } = await supabase
    .from("bookmarks")
    .upsert({ user_id, post_id }, { ignoreDuplicates: true });
  if (error) throw error;
};

export const unbookmark = async ({
  user_id,
  post_id,
}: Pick<Tables<"bookmarks">, "user_id" | "post_id">) => {
  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .match({ user_id, post_id });
  if (error) throw error;
};

export const removeAllBookmarksByUserId = async (userId: string) => {
  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", userId);
  if (error) throw error;
};

export const getBookmarksByUserId = async ({
  userId,
  before,
}: {
  userId: string;
  before?: number;
}) => {
  let query = supabase
    .from("bookmarks")
    .select("*, valid_posts(*)")
    .eq("user_id", userId);
  if (before) query = query.lt("id", before);
  const { data, error } = await query
    .order("id", { ascending: false })
    .limit(PAGE_SIZE);
  if (error) throw error;

  return {
    bookmarks: data,
    next:
      data.length === PAGE_SIZE
        ? { userId, before: data[PAGE_SIZE - 1].id }
        : null,
  };
};
