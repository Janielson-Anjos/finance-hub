import Image from "next/image";
import { Button } from "../_components/ui/button";
import { LogInIcon } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const LoginPage = async () => {
  const { userId } = await auth();

  if (userId) {
    redirect("/");
  }
  return (
    <div className="grid h-full grid-cols-1 lg:grid-cols-2">
      {/* ESQUERDA*/}
      <div className="mx-auto flex h-full max-w-[550px] flex-col justify-center p-6 sm:p-8">
        <Image
          src="/logo-alternativa.svg"
          alt="FinHub AI"
          width={173}
          height={39}
          className="mb-6 sm:mb-8"
        />
        <h1 className="mb-3 text-3xl font-bold sm:text-4xl">Bem-vindo</h1>
        <p className="mb-6 text-sm text-muted-foreground sm:mb-8 sm:text-base">
          A FinHub.ia é uma plataforma de gestão financeira com inteligência
          artificial que monitora suas movimentações e gera insights
          personalizados para facilitar o controle do seu orçamento.
        </p>
        <SignInButton>
          <Button variant={"outline"} className="w-full sm:w-auto">
            <LogInIcon className="mr-2 h-4 w-4" />
            Fazer login ou Criar conta
          </Button>
        </SignInButton>
      </div>

      {/* DIREITA*/}
      <div className="relative hidden h-full w-full lg:block">
        <Image
          src="/login.png"
          alt="Faça login"
          fill
          className="object-cover"
        />
      </div>
    </div>
  );
};

export default LoginPage;
