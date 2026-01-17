import { Badge } from "@/app/_components/ui/badge";
import { Transaction, TransactionType } from "@prisma/client";
import { CircleAlertIcon } from "lucide-react";

interface TransactionTypeBadgeProps {
  transaction: Transaction;
}

const TransactionTypeBadge = ({ transaction }: TransactionTypeBadgeProps) => {
  if (transaction.type === TransactionType.DEPOSIT) {
    return (
      <Badge className="bg-muted font-bold text-primary hover:bg-muted">
        <CircleAlertIcon className="mr-2 fill-primary" size={10} />
        Depósito
      </Badge>
    );
  } else if (transaction.type === TransactionType.EXPENSE) {
    return (
      <Badge className="font bold bg-danger/10 text-danger hover:bg-danger/10">
        <CircleAlertIcon className="mr-2 fill-danger" size={10} />
        Despesa
      </Badge>
    );
  } else if (transaction.type === TransactionType.INVESTMENT) {
    return (
      <Badge className="bg-white/10 font-bold text-white hover:bg-muted">
        <CircleAlertIcon className="mr-2 fill-white" size={10} />
        Investimento
      </Badge>
    );
  }
};

export default TransactionTypeBadge;
