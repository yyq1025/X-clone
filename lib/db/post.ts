"use client";

import { getPagination, PAGE_SIZE } from "@/lib/common/pagination";
import { supabase } from "@/lib/supabaseClient";
import type { Tables } from "@/lib/types/supabase";

export const createPost = async (
  post: Pick<
    Tables<"posts">,
    "parent_id" | "owner_id" | "content" | "mentions"
  >,
) => {
  const { data, error } = await supabase.from("posts").insert(post).select();
  if (error) {
    throw error;
  }
  return data[0];
};

export const getPostById = async (postId: string) => {
  const { data, error } = await supabase
    .from("posts")
    .select()
    .eq("id", postId)
    .single();
  if (error) {
    throw error;
  }
  return data;
};

export const getPostsByParentId = async ({
  parentId,
  page,
}: {
  parentId: string | null;
  page: number;
}) => {
  const { from, to } = getPagination(page);
  const query = parentId
    ? supabase.from("posts").select().eq("parent_id", parentId).range(from, to)
    : supabase.from("posts").select().is("parent_id", null).range(from, to);
  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return {
    posts: data,
    next: data.length === PAGE_SIZE ? page + 1 : null,
  };
};

export const getPostsByUserId = async ({
  userId,
  page,
}: {
  userId: string;
  page: number;
}) => {
  const { from, to } = getPagination(page);
  const { data, error } = await supabase
    .from("posts")
    .select()
    .eq("owner_id", userId)
    .is("parent_id", null)
    .range(from, to);
  if (error) {
    throw error;
  }

  return {
    posts: data,
    next: data.length === PAGE_SIZE ? page + 1 : null,
  };
};

export const getRepliesCountByPostId = async (postId: string) => {
  const { count, error } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("parent_id", postId);
  if (error) throw error;
  return count;
};

export const getPostsCountByUserId = async (userId: string) => {
  const { count, error } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", userId);
  if (error) throw error;
  return count;
};

export const getRepliesByUserId = async ({
  userId,
  page,
}: {
  userId: string;
  page: number;
}) => {
  const { from, to } = getPagination(page);
  const { data, error } = await supabase
    .from("posts")
    .select()
    .eq("owner_id", userId)
    .not("parent_id", "is", null)
    .range(from, to);
  if (error) throw error;

  return {
    posts: data,
    next: data.length === PAGE_SIZE ? page + 1 : null,
  };
};
