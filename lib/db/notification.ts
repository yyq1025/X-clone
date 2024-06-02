"use client";

import { PAGE_SIZE } from "@/lib/db/pagination";
import { supabase } from "@/lib/supabaseClient";

export const getNotificationById = async (id: number) => {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("id", id);
  if (error) throw error;
  return data.length ? data[0] : null;
};

export const getUnreadNotificationCountByUserId = async (userId: string) => {
  const { count, error } = await supabase
    .from("notifications")
    .select("valid_posts(*)", { count: "exact", head: true })
    .match({ recipient_id: userId, read: false });
  if (error) throw error;
  return count;
};

export const getNotificationsByUserId = async ({
  userId,
  before,
}: {
  userId: string;
  before?: number;
}) => {
  let query = supabase
    .from("notifications")
    .select("*, valid_posts(*)")
    .eq("recipient_id", userId);
  if (before) query = query.lt("id", before);
  const { data, error } = await query
    .order("id", { ascending: false })
    .limit(PAGE_SIZE);
  if (error) throw error;
  return {
    notifications: data,
    next:
      data.length === PAGE_SIZE
        ? { userId, before: data[PAGE_SIZE - 1].id }
        : null,
  };
};

export const markNotificationsAsRead = async ({
  userId,
  lastestNotificationId,
}: {
  userId: string;
  lastestNotificationId: number;
}) => {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("recipient_id", userId)
    .lte("id", lastestNotificationId);
  if (error) throw error;
};
