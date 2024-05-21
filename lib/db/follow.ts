"use server";

import prisma from "@/lib/prisma";
import type { Follow } from "@prisma/client";

export const follow = async ({
  followedById,
  followingId,
}: Pick<Follow, "followedById" | "followingId">) => {
  await prisma.follow.upsert({
    where: { followedById_followingId: { followedById, followingId } },
    update: {},
    create: { followedById, followingId },
  });
  return true;
};

export const unfollow = async ({
  followedById,
  followingId,
}: Pick<Follow, "followedById" | "followingId">) => {
  await prisma.follow.delete({
    where: { followedById_followingId: { followedById, followingId } },
  });
  return false;
};

export const getFollowingCountByUserId = async (userId: string) => {
  return prisma.follow.count({ where: { followedById: userId } });
};

export const getFollowersCountByUserId = async (userId: string) => {
  return prisma.follow.count({ where: { followingId: userId } });
};
