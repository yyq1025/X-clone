"use client";

import { supabase } from "@/lib/supabaseClient";

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
  const { data, error } = await supabase
    .rpc("get_top_users", { num });
  if (error) throw error;
  return data;
};
