"use client";

import { Button } from "@/app/_components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog";
import { BotIcon, Loader2Icon, DownloadIcon } from "lucide-react";
import React, { useState } from "react";
import { generateAiReport } from "../_actions/generate-ai-report";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import Markdown from "react-markdown";
import Link from "next/link";
import { exportReportToPdf } from "@/app/_utils/pdf-export";
import { toast } from "sonner";

interface AiReportButtonProps {
  month: string;
  hasPremiumPlan: boolean;
}

const AiReportButton = ({ month, hasPremiumPlan }: AiReportButtonProps) => {
  const [report, setReport] = useState<string | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  const handleGenerateReportClick = async () => {
    try {
      setReportLoading(true);
      const aiReport = await generateAiReport({ month });
      setReport(aiReport ?? null);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao gerar relatório");
    } finally {
      setReportLoading(false);
    }
  };

  const handleExportPdf = () => {
    if (!report) return;

    try {
      setExportingPdf(true);
      exportReportToPdf({
        content: report,
        month,
      });
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao exportar PDF");
    } finally {
      setExportingPdf(false);
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="font-bold">
          Relatório IA
          <BotIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent
        className={
          report
            ? "flex h-[95vh] max-h-[95vh] max-w-2xl flex-col"
            : "max-w-[600px]"
        }
      >
        {hasPremiumPlan ? (
          <>
            <DialogHeader>
              <DialogTitle>Relatório IA</DialogTitle>
              <DialogDescription>
                Use a IA para gerar um relatório de suas transações com insights
                para facilitar o controle financeiro.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea
              className={
                report
                  ? "prose flex-1 text-white prose-h3:text-white prose-h4:text-white prose-strong:text-white"
                  : "prose max-h-[450px] text-white prose-h3:text-white prose-h4:text-white prose-strong:text-white"
              }
            >
              <div className={report ? "pr-4" : ""}>
                <Markdown>{report}</Markdown>
              </div>
            </ScrollArea>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Cancelar</Button>
              </DialogClose>
              {report && (
                <Button
                  onClick={handleExportPdf}
                  disabled={exportingPdf}
                  variant="outline"
                >
                  {exportingPdf ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      Exportando...
                    </>
                  ) : (
                    <>
                      <DownloadIcon className="mr-2 h-4 w-4" />
                      Exportar PDF
                    </>
                  )}
                </Button>
              )}
              <Button
                onClick={handleGenerateReportClick}
                disabled={reportLoading}
              >
                {reportLoading ? (
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                ) : (
                  "Gerar Relatório"
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Relatório IA</DialogTitle>
              <DialogDescription>
                Você precisa ser premium para gerar relatórios com a IA.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Cancelar</Button>
              </DialogClose>
              <Button asChild>
                <Link href="/subscription">Assinar Plano Premium</Link>
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AiReportButton;
