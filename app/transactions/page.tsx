import { db } from "../_lib/prisma";
import { DataTable } from "../_components/ui/data-table";
import { TransactionColumns } from "./_columns";
import UpsertTransactionButton from "../_components/add-transaction-button";
import { Transaction } from "@prisma/client";
import Navbar from "../_components/navbar";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// Type for serialized transactions (Decimal converted to number)
type SerializedTransaction = Omit<Transaction, "amount"> & {
  amount: number;
};

const TransactionsPage = async () => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }
  const transactions = await db.transaction.findMany({
    where: {
      userId,
    },
  });

  // Convert Decimal to number for Client Component serialization
  const serializedTransactions: SerializedTransaction[] = transactions.map(
    (transaction) => ({
      ...transaction,
      amount: Number(transaction.amount),
    }),
  );

  return (
    <>
      <Navbar />
      <div className="space-y-6 p-6">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-2xl font-bold">Transações</h1>
          <UpsertTransactionButton />
        </div>
        <DataTable
          columns={TransactionColumns}
          data={serializedTransactions as unknown as Transaction[]}
        />
      </div>
    </>
  );
};

export default TransactionsPage;
