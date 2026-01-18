"use server";

import { db } from "@/app/_lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  TransactionCategory,
  TransactionPaymentMethod,
  TransactionType,
} from "@prisma/client";
import { addTransactionSchema } from "./schema";
import { revalidatePath } from "next/cache";

interface addTransactionParams {
  id?: string;
  name: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  paymentMethod: TransactionPaymentMethod;
  date: Date;
}

export const upsertTransaction = async (params: addTransactionParams) => {
  addTransactionSchema.parse(params);
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  if (params.id) {
    await db.transaction.upsert({
      where: {
        id: params.id,
      },
      update: {
        name: params.name,
        amount: params.amount,
        type: params.type,
        category: params.category,
        paymentMethod: params.paymentMethod,
        date: params.date,
        userId,
      },
      create: {
        name: params.name,
        amount: params.amount,
        type: params.type,
        category: params.category,
        paymentMethod: params.paymentMethod,
        date: params.date,
        userId,
      },
    });
  } else {
    const { ...createData } = params;
    await db.transaction.create({
      data: {
        ...createData,
        userId,
      },
    });
  }
  revalidatePath("/transactions");
};
