"use server";

import { db } from "@/app/_lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { GoogleGenAI } from "@google/genai";
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
  // pegar as transações do mês recebido
  const transactions = await db.transaction.findMany({
    where: {
      date: {
        gte: new Date(`2026-${month}-01`),
        lt: new Date(`2026-${month}-31`),
      },
    },
  });
  // mandar as transações para o ChatGPT e pedir para ele gerar um relatório com insights
  const content = `Gere um relatório com insights sobre as minhas finanças, com dicas e orientações de como melhorar minha vida financeira. As transações estão divididas por ponto e vírgula. A estrutura de cada uma é {DATA}-{TIPO}-{VALOR}-{CATEGORIA}. São elas:
  ${transactions
    .map(
      (transaction) =>
        `${transaction.date.toLocaleDateString("pt-BR")}-R$${transaction.amount}-${transaction.type}-${transaction.category}`,
    )
    .join(";")}`;
  const prompt = `Você é um especialista em gestão e organização de finanças pessoais. Você ajuda as pessoas a organizarem melhor as suas finanças.\n\n${content}`;
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
