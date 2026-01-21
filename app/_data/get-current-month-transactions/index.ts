import { db } from "@/app/_lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";
import { auth } from "@clerk/nextjs/server";

export const getCurrentMonthTransactions = async () => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return await db.transaction.count({
    where: {
      userId: userId,
      createdAt: {
        gte: startOfMonth(new Date()),
        lt: endOfMonth(new Date()),
      },
    },
  });
};
