import { db } from "../_lib/prisma";
import { DataTable } from "../_components/ui/data-table";
import { TransactionColumns } from "./_columns";
import UpsertTransactionButton from "../_components/add-transaction-button";
import { Transaction } from "@prisma/client";
import Navbar from "../_components/navbar";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ScrollArea } from "../_components/ui/scroll-area";
import { canUserAddTransaction } from "../_data/can-user-add-transaction";

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
  const userCanAddTransaction = await canUserAddTransaction();

  return (
    <>
      <Navbar />
      <div className="flex h-[calc(100vh-90px)] flex-col space-y-6 p-6">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-2xl font-bold">Transações</h1>
          <UpsertTransactionButton
            userCanAddTransaction={userCanAddTransaction}
          />
        </div>
        <ScrollArea className="flex-1">
          <DataTable
            columns={TransactionColumns}
            data={serializedTransactions as unknown as Transaction[]}
          />
        </ScrollArea>
      </div>
    </>
  );
};

export default TransactionsPage;
