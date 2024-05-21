"use server";

import { PAGE_SIZE } from "@/lib/db/constant";
import prisma from "@/lib/prisma";
import type { Like } from "@prisma/client";

export const getLikesCountByPostId = async (postId: string) => {
  return prisma.like.count({ where: { postId } });
};

export const getLiked = async ({
  postId,
  userId,
}: Pick<Like, "postId" | "userId">) => {
  return !!(await prisma.like.findFirst({ where: { postId, userId } }));
};

export const likePost = async ({
  postId,
  userId,
}: Pick<Like, "postId" | "userId">) => {
  await prisma.like.upsert({
    where: { postId_userId: { postId, userId } },
    update: {},
    create: { postId, userId },
  });
  return true;
};

export const unlikePost = async ({
  postId,
  userId,
}: Pick<Like, "postId" | "userId">) => {
  await prisma.like.delete({ where: { postId_userId: { postId, userId } } });
  return false;
};

export const getLikesCountByUserId = async (userId: string) => {
  return prisma.like.count({ where: { userId } });
};

export const getLikedPostsByUserId = async ({
  userId,
  cursor,
}: {
  userId: string;
  cursor?: string;
}) => {
  const queryResults = await prisma.like.findMany({
    where: { userId },
    take: PAGE_SIZE,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      post: {
        omit: { id: true },
      },
    },
  });

  return {
    likedPosts: queryResults,
    nextCursor:
      queryResults.length === PAGE_SIZE
        ? queryResults[queryResults.length - 1].id
        : null,
  };
};
