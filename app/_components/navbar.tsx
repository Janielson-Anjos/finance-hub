"use client";

import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();
  return (
    <div className="flex justify-between border-b border-solid px-8 py-4">
      {/* Esquerda */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-10">
          <Image
            src="/logo-alternativa.svg"
            alt="FinHub.IA"
            width={180}
            height={39}
          />
          <Link
            href="/"
            className={
              pathname === "/"
                ? "font-bold text-primary"
                : "text-muted-foreground"
            }
          >
            Dashboard
          </Link>
          <Link
            href="/transactions"
            className={
              pathname === "/transactions"
                ? "font-bold text-primary"
                : "text-muted-foreground"
            }
          >
            Transações
          </Link>
          <Link
            href="/subscription"
            className={
              pathname === "/subscription"
                ? "font-bold text-primary"
                : "text-muted-foreground"
            }
          >
            Assinatura
          </Link>
        </div>
      </div>
      {/* Direita */}
      <div className="flex items-center gap-2">
        <UserButton showName />
      </div>
    </div>
  );
};

export default Navbar;
