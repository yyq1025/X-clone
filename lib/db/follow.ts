"use client";

import { getPagination, PAGE_SIZE } from "@/lib/common/pagination";
import { supabase } from "@/lib/supabaseClient";
import type { Tables } from "@/lib/types/supabase";

export const follow = async ({
  follower_id,
  following_id,
}: Pick<Tables<"follows">, "follower_id" | "following_id">) => {
  const { error } = await supabase
    .from("follows")
    .upsert({ follower_id, following_id }, { ignoreDuplicates: true });
  if (error) throw error;
  return true;
};

export const unfollow = async ({
  follower_id,
  following_id,
}: Pick<Tables<"follows">, "follower_id" | "following_id">) => {
  const { error } = await supabase
    .from("follows")
    .delete()
    .match({ follower_id, following_id });
  if (error) throw error;
  return false;
};

export const getFollowed = async ({
  follower_id,
  following_id,
}: Pick<Tables<"follows">, "follower_id" | "following_id">) => {
  const { count, error } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .match({ follower_id, following_id });
  if (error) throw error;
  return !!count;
};

export const getFollowingCountByUserId = async (userId: string) => {
  const { count, error } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", userId);
  if (error) throw error;
  return count;
};

export const getFollowersCountByUserId = async (userId: string) => {
  const { count, error } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", userId);
  if (error) throw error;
  return count;
};

export const getUserFollowingByUserId = async ({
  userId,
  page,
}: {
  userId: string;
  page: number;
}) => {
  const { from, to } = getPagination(page);
  const { data, error } = await supabase
    .from("follows")
    .select("users:following_id (*)")
    .eq("follower_id", userId)
    .range(from, to)
    .returns<{ users: Tables<"users"> }[]>();
  if (error) throw error;

  return {
    following: data,
    next: data.length === PAGE_SIZE ? page + 1 : null,
  };
};

export const getUserFollowersByUserId = async ({
  userId,
  page,
}: {
  userId: string;
  page: number;
}) => {
  const { from, to } = getPagination(page);
  const { data, error } = await supabase
    .from("follows")
    .select("users:follower_id (*)")
    .eq("following_id", userId)
    .range(from, to)
    .returns<{ users: Tables<"users"> }[]>();
  if (error) throw error;

  return {
    followers: data,
    next: data.length === PAGE_SIZE ? page + 1 : null,
  };
};
