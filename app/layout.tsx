import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "@/app/_components/ui/sonner";

const mulish = Mulish({
  subsets: ["latin-ext"],
});

export const metadata: Metadata = {
  title: "FinHub.IA",
  description:
    "plataforma de gestão financeira com inteligência artificial que monitora suas movimentações e gera insights personalizados para facilitar o controle do seu orçamento.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${mulish.className} dark antialiased`}>
        <ClerkProvider
          appearance={{
            baseTheme: dark,
          }}
        >
          <div className="flex h-full flex-col overflow-auto">
            {" "}
            {/* mudar o overflow-hidden para overflow-auto para permitir scroll na tela */}
            {children}
          </div>
          <Toaster />
        </ClerkProvider>
      </body>
    </html>
  );
}
