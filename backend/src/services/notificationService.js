import { prisma } from "../config/prisma.js";

export function createNotification(userId, title, message) {
  return prisma.notification.create({
    data: { userId, title, message },
  });
}

export function listMyNotifications(userId) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}
