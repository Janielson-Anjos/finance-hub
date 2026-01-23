import jsPDF from "jspdf";

interface ExportPdfOptions {
  content: string;
  month: string;
  fileName?: string;
}

/**
 * Tipos de elementos markdown
 */
type MarkdownElementType = "title" | "list" | "paragraph";

interface MarkdownElement {
  type: MarkdownElementType;
  level?: number; // Nível do título (1-4) ou undefined
  content: string;
  isListItem?: boolean;
}

/**
 * Calcula a altura de linha baseada no tamanho da fonte
 * Usa um fator de 1.4 para espaçamento confortável entre linhas
 */
const getLineHeight = (fontSize: number): number => {
  // Converte pontos para mm (1pt = 0.352778mm)
  // Usa fator de 1.4 para espaçamento confortável
  return fontSize * 0.352778 * 1.4;
};

/**
 * Remove formatação markdown de uma string (bold, italic)
 */
const removeMarkdownFormatting = (text: string): string => {
  return text
    .replace(/\*\*(.*?)\*\*/gim, "$1") // Remove **bold**
    .replace(/\*(.*?)\*/gim, "$1") // Remove *italic*
    .trim();
};

/**
 * Identifica e classifica elementos markdown linha por linha
 */
const parseMarkdownElements = (markdown: string): MarkdownElement[] => {
  const lines = markdown.split("\n");
  const elements: MarkdownElement[] = [];
  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const content = currentParagraph.join(" ").trim();
      if (content) {
        elements.push({
          type: "paragraph",
          content: removeMarkdownFormatting(content),
        });
      }
      currentParagraph = [];
    }
  };

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      flushParagraph();
      return;
    }

    // Detecta títulos markdown (#, ##, ###, ####)
    const titleMatch = trimmedLine.match(/^(#{1,4})\s+(.+)$/);
    if (titleMatch) {
      flushParagraph();
      const level = titleMatch[1].length;
      const content = removeMarkdownFormatting(titleMatch[2]);
      elements.push({
        type: "title",
        level,
        content,
      });
      return;
    }

    // Detecta itens de lista (- ou números)
    const listMatch =
      trimmedLine.match(/^[\-\*]\s+(.+)$/) ||
      trimmedLine.match(/^\d+\.\s+(.+)$/);
    if (listMatch) {
      flushParagraph();
      const content = removeMarkdownFormatting(listMatch[1]);
      elements.push({
        type: "list",
        content: `• ${content}`,
        isListItem: true,
      });
      return;
    }

    // Linha normal - adiciona ao parágrafo atual
    currentParagraph.push(trimmedLine);
  });

  flushParagraph();
  return elements;
};

/**
 * Quebra texto longo em linhas que cabem na largura do PDF
 */
const splitTextIntoLines = (
  doc: jsPDF,
  text: string,
  maxWidth: number,
): string[] => {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = doc.getTextWidth(testLine);

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
};

/**
 * Exporta o relatório em formato PDF
 */
export const exportReportToPdf = ({
  content,
  month,
  fileName,
}: ExportPdfOptions): void => {
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Cores
    const primaryColor = [85, 176, 46]; // #55B02E (verde primário)
    const textColor = [0, 0, 0];
    const grayColor = [128, 128, 128];

    // Cabeçalho
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("FinHub.IA - Relatório Financeiro", margin, 25);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const monthNames = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];
    const monthName = monthNames[parseInt(month) - 1] || month;
    const currentYear = new Date().getFullYear();
    doc.text(`Mês: ${monthName}/${currentYear}`, margin, 35);

    yPosition = 50;

    // Conteúdo do relatório
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    const baseFontSize = 11;
    doc.setFontSize(baseFontSize);
    doc.setFont("helvetica", "normal");
    const baseLineHeight = getLineHeight(baseFontSize);

    // Parse markdown em elementos estruturados
    const elements = parseMarkdownElements(content);
    const listIndent = 8; // Indentação para itens de lista em mm
    const paragraphMargin = 25; // Margem para quebra de página

    elements.forEach((element) => {
      if (element.type === "title" && element.level) {
        // Título markdown
        const titleFontSizes: Record<number, number> = {
          1: 16,
          2: 14,
          3: 13,
          4: 12,
        };
        const titleFontSize = titleFontSizes[element.level] || 12;
        const titleLineHeight = getLineHeight(titleFontSize);
        const titleMargin = 30;

        // Verifica espaço antes de renderizar
        if (yPosition + titleLineHeight > pageHeight - titleMargin) {
          doc.addPage();
          yPosition = margin;
        }

        doc.setFontSize(titleFontSize);
        doc.setFont("helvetica", "bold");
        const titleLines = splitTextIntoLines(doc, element.content, maxWidth);

        titleLines.forEach((line) => {
          doc.text(line, margin, yPosition);
          yPosition += titleLineHeight;
        });

        yPosition += 6; // Espaço após título
        doc.setFontSize(baseFontSize);
        doc.setFont("helvetica", "normal");
      } else if (element.type === "list") {
        // Item de lista
        const listMargin = 25;
        const listLineHeight = baseLineHeight;
        const bulletText = "• ";
        const bulletWidth = doc.getTextWidth(bulletText);
        const listMaxWidth = maxWidth - listIndent; // Largura reduzida para acomodar indentação

        // Remove o bullet do conteúdo para calcular quebra de linha
        const contentWithoutBullet = element.content.replace(/^•\s+/, "");
        // Calcula largura disponível para texto (descontando espaço do bullet)
        const textMaxWidth = listMaxWidth - bulletWidth;
        const wrappedLines = splitTextIntoLines(
          doc,
          contentWithoutBullet,
          textMaxWidth,
        );

        wrappedLines.forEach((wrappedLine, lineIndex) => {
          // Verifica espaço antes de renderizar
          if (yPosition + listLineHeight > pageHeight - listMargin) {
            doc.addPage();
            yPosition = margin;
          }

          // Primeira linha tem bullet na margem, linhas seguintes são indentadas
          if (lineIndex === 0) {
            doc.text(bulletText + wrappedLine, margin, yPosition);
          } else {
            doc.text(wrappedLine, margin + listIndent, yPosition);
          }
          yPosition += listLineHeight;
        });

        yPosition += 3; // Espaço entre itens de lista
      } else {
        // Parágrafo normal
        const wrappedLines = splitTextIntoLines(doc, element.content, maxWidth);

        wrappedLines.forEach((wrappedLine) => {
          // Verifica espaço antes de renderizar
          if (yPosition + baseLineHeight > pageHeight - paragraphMargin) {
            doc.addPage();
            yPosition = margin;
          }

          doc.text(wrappedLine, margin, yPosition);
          yPosition += baseLineHeight;
        });

        yPosition += 5; // Espaço entre parágrafos
      }
    });

    // Rodapé
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.setFont("helvetica", "italic");
      const now = new Date();
      const dateStr = now.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const timeStr = now.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const footerText = `Gerado em ${dateStr} às ${timeStr} - Página ${i} de ${totalPages}`;
      doc.text(footerText, pageWidth / 2, pageHeight - 10, {
        align: "center",
      });
    }

    // Salvar PDF
    const finalFileName =
      fileName || `relatorio-financeiro-${month}-${currentYear}.pdf`;
    doc.save(finalFileName);
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    throw new Error("Falha ao exportar relatório em PDF");
  }
};
