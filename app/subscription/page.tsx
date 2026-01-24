import { auth, clerkClient } from "@clerk/nextjs/server";
import Navbar from "../_components/navbar";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "../_components/ui/card";
import { CheckIcon, XIcon } from "lucide-react";
import AcquirePlanButton from "./_components/acquire-plan-button";
import { Badge } from "../_components/ui/badge";
import { getCurrentMonthTransactions } from "../_data/get-current-month-transactions";

const SubscriptionPage = async () => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }
  const user = await clerkClient().users.getUser(userId);

  const hasPremiumPlan = user.publicMetadata.subscriptionPlan === "premium";
  const currentMonthTransactions = await getCurrentMonthTransactions();
  return (
    <>
      <Navbar />
      <div className="space-y-4 p-3 sm:space-y-6 sm:p-6">
        <h1 className="text-2xl font-bold">Assinatura</h1>

        <div className="flex flex-col gap-4 md:flex-row md:gap-6">
          <Card className="w-full border-white/10 md:w-[450px]">
            <CardHeader className="border-b border-solid border-white/10 py-6 sm:py-8">
              <h2 className="text-center text-xl font-semibold sm:text-2xl">
                Plano Básico
              </h2>
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-4xl">R$</span>
                <span className="text-4xl font-semibold sm:text-6xl">0</span>
                <span className="text-lg text-muted-foreground sm:text-2xl">
                  /mês
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 py-6 sm:space-y-6 sm:py-8">
              <div className="flex items-center gap-2">
                <CheckIcon className="h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm sm:text-base">
                  Apenas 12 transações por mês ({currentMonthTransactions}/10)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <XIcon className="h-5 w-5 shrink-0" />
                <p className="text-sm sm:text-base">Relatórios com IA</p>
              </div>
            </CardContent>
          </Card>
          <Card className="w-full border-white/10 md:w-[450px]">
            <CardHeader className="relative border-b border-solid border-white/10 py-6 sm:py-8">
              {hasPremiumPlan && (
                <Badge className="absolute left-2 top-4 bg-primary/10 text-primary hover:bg-primary/20 sm:left-4 sm:top-8">
                  Ativo
                </Badge>
              )}
              <h2 className="text-center text-xl font-semibold sm:text-2xl">
                Plano Premium
              </h2>
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-4xl">R$</span>
                <span className="text-4xl font-semibold sm:text-6xl">
                  14,99
                </span>
                <span className="text-lg text-muted-foreground sm:text-2xl">
                  /mês
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 py-6 sm:space-y-6 sm:py-8">
              <div className="flex items-center gap-2">
                <CheckIcon className="h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm sm:text-base">Transações ilimitadas</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm sm:text-base">Relatórios com IA</p>
              </div>
              <AcquirePlanButton />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default SubscriptionPage;
