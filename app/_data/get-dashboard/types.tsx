import {
  TransactionCategory,
  TransactionType,
  TransactionPaymentMethod,
} from "@prisma/client";

export type TransactionPercentagePerType = {
  [key in TransactionType]: number;
};

export interface TotalExpensesPerCategory {
  category: TransactionCategory;
  totalAmount: number;
  percentageOfTotal: number;
}

/**
 * Tipo para transações serializadas (com amount como number ao invés de Decimal)
 * Usado para serialização JSON em Server Components
 */
export interface SerializedTransaction {
  id: string;
  name: string;
  type: TransactionType;
  amount: number; // Serializado de Decimal para number
  category: TransactionCategory;
  paymentMethod: TransactionPaymentMethod;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}
