"use client";

import { PAGE_SIZE } from "@/lib/db/pagination";
import { supabase } from "@/lib/supabaseClient";
import type { Tables } from "@/lib/types/supabase";
import { isUndefined, omitBy } from "lodash";
import type { CamelCasedProperties } from "type-fest";

export const createPost = async ({
  parentId,
  ownerId,
  content,
  mentions,
}: CamelCasedProperties<
  Pick<Tables<"posts">, "parent_id" | "owner_id" | "content" | "mentions">
>) => {
  const { error } = await supabase.from("posts").insert({
    parent_id: parentId,
    owner_id: ownerId,
    content,
    mentions,
  });
  if (error) throw error;
};

export const getPostById = async (postId: number) => {
  const { data, error } = await supabase
    .from("posts")
    .select()
    .eq("id", postId);
  if (error) throw error;
  return data.length ? data[0] : null;
};

export const getPosts = async ({
  parentId,
  ownerId,
  before,
}: {
  parentId?: number;
  ownerId?: string;
  before?: number;
}) => {
  let query = supabase
    .from("valid_posts")
    .select("*")
    .match(omitBy({ parent_id: parentId, owner_id: ownerId }, isUndefined));
  if (before) query = query.lt("id", before);
  const { data, error } = await query
    .order("id", { ascending: false })
    .limit(PAGE_SIZE);
  if (error) throw error;

  return {
    posts: data,
    next:
      data.length === PAGE_SIZE
        ? { parentId, ownerId, before: data[PAGE_SIZE - 1].id ?? undefined }
        : null,
  };
};

export const getRepliesCountByPostId = async (postId: number) => {
  const { count, error } = await supabase
    .from("valid_posts")
    .select("*", { count: "exact", head: true })
    .eq("parent_id", postId);
  if (error) throw error;
  return count;
};

export const getPostsCountByUserId = async (userId: string) => {
  const { count, error } = await supabase
    .from("user_valid_posts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);
  if (error) throw error;
  return count;
};

export const getRepliesByUserId = async ({
  userId,
  before,
}: {
  userId: string;
  before?: number;
}) => {
  let query = supabase
    .from("valid_posts")
    .select()
    .eq("owner_id", userId)
    .neq("parent_id", 0);
  if (before) query = query.lt("id", before);
  const { data, error } = await query
    .order("id", { ascending: false })
    .limit(PAGE_SIZE);
  if (error) throw error;

  return {
    posts: data,
    next:
      data.length === PAGE_SIZE
        ? { userId, before: data[PAGE_SIZE - 1].id ?? undefined }
        : null,
  };
};

export const getParentPosts = async (postId: number) => {
  const { data, error } = await supabase.rpc("get_parent_posts", {
    parent_id: postId,
  });
  if (error) throw error;
  return data;
};

export const logicDeletePost = async (postId: number) => {
  const { data, error } = await supabase
    .from("posts")
    .update({ deleted: true })
    .eq("id", postId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getFollowingPosts = async () => {
  const { data, error } = await supabase.rpc("get_following_posts");
  if (error) throw error;
  return data;
}
