"use server";

import { db } from "@/app/_lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { GoogleGenAI } from "@google/genai";
import {
  TRANSACTION_CATEGORY_LABELS,
  TRANSACTION_TYPE_LABELS,
} from "@/app/_constants/transaction";
import { GenerateAiReportSchema, generateAiReportSchema } from "./schema";

export const generateAiReport = async ({ month }: GenerateAiReportSchema) => {
  generateAiReportSchema.parse({ month });
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  const user = await clerkClient().users.getUser(userId);
  const hasPremiumPlan = user.publicMetadata.subscriptionPlan === "premium";
  if (!hasPremiumPlan) {
    throw new Error("You need a premium plan to generate AI reports");
  }
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key is not set");
  }
  const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
  const year = new Date().getFullYear();
  const monthIndex = Number(month) - 1;
  const start = new Date(year, monthIndex, 1);
  const end = new Date(year, monthIndex + 1, 1);

  // pegar as transações do mês recebido (do usuário logado)
  const transactions = await db.transaction.findMany({
    where: {
      userId,
      date: {
        gte: start,
        lt: end,
      },
    },
  });

  if (transactions.length === 0) {
    return `Não encontrei transações para ${month}/${year}.`;
  }

  const transactionsText = transactions
    .map((transaction) => {
      const date = new Date(transaction.date).toISOString().slice(0, 10); // YYYY-MM-DD
      const type = TRANSACTION_TYPE_LABELS[transaction.type];
      const category = TRANSACTION_CATEGORY_LABELS[transaction.category];
      const amount = Number(transaction.amount).toFixed(2);
      return `${date}-${type}-${amount}-${category}`;
    })
    .join(";");

  const prompt = [
    "Você é um especialista em gestão e organização de finanças pessoais.",
    "Responda sempre em português (pt-BR).",
    "Não peça para eu fornecer transações — elas já estão abaixo.",
    "Gere um relatório com insights e dicas práticas, com seções e bullets, usando as transações informadas.",
    "",
    "As transações estão divididas por ponto e vírgula e cada uma segue exatamente:",
    "{DATA}-{TIPO}-{VALOR}-{CATEGORIA}",
    "",
    "Transações:",
    transactionsText,
  ].join("\n");
  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    // pegar o relatório gerado pelo Gemini e retornar para o usuário
    return response.text;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : "Gemini request failed";
    if (
      message.includes("429") ||
      message.toLowerCase().includes("resource_exhausted") ||
      message.toLowerCase().includes("quota")
    ) {
      throw new Error(
        "Limite/Quota da Gemini API excedida (ou quota=0). Verifique billing e quotas do seu projeto na Google AI.",
      );
    }
    // Se o modelo estiver indisponível/overloaded, retorne um erro mais claro
    if (
      message.includes("503") ||
      message.toLowerCase().includes("unavailable")
    ) {
      throw new Error(
        "O modelo de IA está indisponível no momento. Tente novamente em instantes.",
      );
    }
    throw error;
  }
};
