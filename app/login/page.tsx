import Image from "next/image"
import { Button } from "../_components/ui/button"
import { LogInIcon } from "lucide-react"

const LoginPage = () => {
    return (
        <div className="grid grid-cols-2 h-full">
            {/* ESQUERDA*/}
            <div className="flex flex-col justify-center p-8 h-full max-w-[550px] mx-auto">
                <Image src="/logo-alternativa.svg" alt="FinHub AI" width={173} height={39} className="mb-8" />
                <h1 className="mb-3 text-4xl font-bold">Bem-vindo</h1>
                <p className="text-muted-foreground mb-8">A FinHub.ia é uma plataforma de gestão financeira com inteligência artificial que monitora suas movimentações e gera insights personalizados para facilitar o controle do seu orçamento.
                </p>
                <Button variant={"outline"}>
                    <LogInIcon className="mr-2" />
                    Fazer login ou Criar conta
                </Button>
            </div>

            {/* DIREITA*/}
            <div className="relative h-full w-full">
                <Image src="/login.png" alt="Faça login" fill className="object-cover" />
            </div>
        </div>
    )
}

export default LoginPage