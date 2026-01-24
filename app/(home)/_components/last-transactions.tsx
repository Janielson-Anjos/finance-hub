import { Button } from "@/app/_components/ui/button";
import { CardContent, CardHeader } from "@/app/_components/ui/card";
import { CardTitle } from "@/app/_components/ui/card";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import {
  TRANSACTION_PAYMENT_METHOD_ICONS,
  TRANSACTION_PAYMENT_METHOD_LABELS,
} from "@/app/_constants/transaction";
import { formatCurrency } from "@/app/_utils/currency";
import { TransactionType } from "@prisma/client";
import { SerializedTransaction } from "@/app/_data/get-dashboard/types";
import Image from "next/image";
import Link from "next/link";

interface LastTransactionsProps {
  lastTransactions: SerializedTransaction[];
}

const LastTransactions = ({ lastTransactions }: LastTransactionsProps) => {
  const getAmountColor = (transaction: SerializedTransaction) => {
    if (transaction.type === TransactionType.EXPENSE) {
      return "text-danger";
    }
    if (transaction.type === TransactionType.DEPOSIT) {
      return "text-primary";
    }
    return "text-white";
  };
  const getAmountPrefix = (transaction: SerializedTransaction) => {
    if (transaction.type === TransactionType.DEPOSIT) {
      return "+";
    }
    return "-";
  };
  return (
    <ScrollArea className="rounded-md border-2 border-white/5">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="font-bold">Últimas transações</CardTitle>
        <Button
          variant="outline"
          className="w-full rounded-full font-bold sm:w-auto"
          asChild
        >
          <Link href="/transactions">Ver mais</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {lastTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                className={`rounded-lg bg-white bg-opacity-[3%] p-2 sm:p-3 ${getAmountColor(transaction)}`}
              >
                <Image
                  src={
                    TRANSACTION_PAYMENT_METHOD_ICONS[transaction.paymentMethod]
                  }
                  alt={
                    TRANSACTION_PAYMENT_METHOD_LABELS[transaction.paymentMethod]
                  }
                  width={20}
                  height={20}
                  style={{
                    filter:
                      transaction.type === TransactionType.EXPENSE
                        ? "brightness(0) saturate(100%) invert(27%) sepia(95%) saturate(7481%) hue-rotate(352deg) brightness(96%) contrast(96%)"
                        : transaction.type === TransactionType.DEPOSIT
                          ? "brightness(0) saturate(100%) invert(60%) sepia(95%) saturate(400%) hue-rotate(60deg) brightness(95%) contrast(85%)"
                          : "brightness(0) invert(1)",
                  }}
                />
              </div>
              <div>
                <p className="text-sm font-bold">{transaction.name}</p>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  {new Date(transaction.date).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <p className={`text-sm font-bold ${getAmountColor(transaction)}`}>
              {getAmountPrefix(transaction)}{" "}
              {formatCurrency(transaction.amount)}
            </p>
          </div>
        ))}
      </CardContent>
    </ScrollArea>
  );
};

export default LastTransactions;
