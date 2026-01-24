import { CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { Progress } from "@/app/_components/ui/progress";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import { TRANSACTION_CATEGORY_LABELS } from "@/app/_constants/transaction";
import { TotalExpensesPerCategory } from "@/app/_data/get-dashboard/types";

interface ExpensesPerCategoryProps {
  expensesPerCategory: TotalExpensesPerCategory[];
}

const ExpensesPerCategory = ({
  expensesPerCategory,
}: ExpensesPerCategoryProps) => {
  return (
    <ScrollArea className="h-full rounded-md border-2 border-white/5 pb-6 md:col-span-2">
      <CardHeader>
        <CardTitle className="font-bold">Despesas por categoria</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {expensesPerCategory.map((category) => (
          <div key={category.category} className="space-y-2">
            <div className="flex w-full justify-between">
              <p className="text-xs font-bold sm:text-sm">
                {TRANSACTION_CATEGORY_LABELS[category.category]}
              </p>
              <p className="text-xs font-bold sm:text-sm">
                {category.percentageOfTotal}%
              </p>
            </div>
            <Progress value={category.percentageOfTotal} />
          </div>
        ))}
      </CardContent>
    </ScrollArea>
  );
};

export default ExpensesPerCategory;
