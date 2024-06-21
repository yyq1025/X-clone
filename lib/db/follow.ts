"use client";

import { PAGE_SIZE } from "@/lib/db/pagination";
import { supabase } from "@/lib/supabaseClient";
import type { Tables } from "@/lib/types/supabase";

export const follow = async ({
  follower_id,
  following_id,
}: Pick<Tables<"follow">, "follower_id" | "following_id">) => {
  const { error } = await supabase
    .from("follow")
    .upsert({ follower_id, following_id }, { ignoreDuplicates: true });
  if (error) throw error;
};

export const unfollow = async ({
  follower_id,
  following_id,
}: Pick<Tables<"follow">, "follower_id" | "following_id">) => {
  const { error } = await supabase
    .from("follow")
    .delete()
    .match({ follower_id, following_id });
  if (error) throw error;
};

export const getFollowed = async ({
  follower_id,
  following_id,
}: Pick<Tables<"follow">, "follower_id" | "following_id">) => {
  const { count, error } = await supabase
    .from("follow")
    .select("*", { count: "exact", head: true })
    .match({ follower_id, following_id });
  if (error) throw error;
  return !!count;
};

export const getFollowingCountByUserId = async (userId: string) => {
  const { count, error } = await supabase
    .from("follow")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", userId);
  if (error) throw error;
  return count;
};

export const getFollowersCountByUserId = async (userId: string) => {
  const { count, error } = await supabase
    .from("follow")
    .select("*", { count: "exact", head: true })
    .eq("following_id", userId);
  if (error) throw error;
  return count;
};

export const getUserFollowingByUserId = async ({
  userId,
  before,
}: {
  userId: string;
  before?: number;
}) => {
  let query = supabase
    .from("follow")
    .select("*,users:following_id (*)")
    .eq("follower_id", userId);
  if (before) query = query.lt("id", before);
  const { data, error } = await query
    .order("id", { ascending: false })
    .limit(PAGE_SIZE)
    .returns<(Tables<"follow"> & { users: Tables<"users"> })[]>();
  if (error) throw error;

  return {
    following: data,
    next:
      data.length === PAGE_SIZE
        ? { userId, before: data[PAGE_SIZE - 1].id }
        : null,
  };
};

export const getUserFollowersByUserId = async ({
  userId,
  before,
}: {
  userId: string;
  before?: number;
}) => {
  let query = supabase
    .from("follow")
    .select("*,users:follower_id (*)")
    .eq("following_id", userId);
  if (before) query = query.lt("id", before);
  const { data, error } = await query
    .order("id", { ascending: false })
    .limit(PAGE_SIZE)
    .returns<(Tables<"follow"> & { users: Tables<"users"> })[]>();
  if (error) throw error;

  return {
    followers: data,
    next:
      data.length === PAGE_SIZE
        ? { userId, before: data[PAGE_SIZE - 1].id }
        : null,
  };
};

export const getFollowingPosts = async () => {
  const { data, error } = await supabase.rpc("get_following_posts");
  if (error) throw error;
  return data;
};
