"use client";

import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

const Navbar = () => {
  const pathname = usePathname();
  return (
    <div className="flex min-h-14 items-center justify-between border-b border-solid px-3 py-2 md:min-h-[85px] md:px-6 md:py-0">
      {/* Esquerda */}
      <div className="flex items-center gap-10">
        {/* Menu mobile - antes da logo */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <MenuIcon className="h-6 w-6" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="mt-8 flex flex-col gap-4">
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
            </nav>
          </SheetContent>
        </Sheet>
        <Image
          src="/logo-alternativa.svg"
          alt="FinHub.IA"
          width={180}
          height={39}
          className="h-6 w-auto md:h-12"
        />
        {/* Links desktop - ocultos em mobile */}
        <div className="hidden items-center gap-6 lg:flex">
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
        <div className="hidden sm:block">
          <UserButton showName />
        </div>
        <div className="sm:hidden">
          <UserButton />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
