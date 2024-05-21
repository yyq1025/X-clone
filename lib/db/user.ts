"use server";

import prisma from "@/lib/prisma";
import type { User } from "firebase/auth";

export const createUserIfNotExists = async (
  user: Partial<User> & { uid: string },
) => {
  const username =
    user.displayName?.toLocaleLowerCase().split(" ")[0] || "anonymous";

  return prisma.user.upsert({
    where: { userId: user.uid },
    update: {},
    create: {
      userId: user.uid,
      avatar: user.photoURL,
      name: user.displayName || "Anonymous",
      username: username + Math.floor(Math.random() * 100000),
    },
  });
};

export const getUserById = async (userId: string) => {
  return prisma.user.findUnique({ where: { userId } });
};
