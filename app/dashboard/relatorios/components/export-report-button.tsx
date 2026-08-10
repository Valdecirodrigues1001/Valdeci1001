"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Download,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";

export default function ExportReportButton() {
  const searchParams = useSearchParams();

  const [downloading, setDownloading] =
    useState(false);

  async function handleExport() {
    try {
      setDownloading(true);

      const params = new URLSearchParams(
        searchParams.toString()
      );

      const queryString = params.toString();

      const exportUrl = queryString
        ? `/dashboard/relatorios/exportar?${queryString}`
        : "/dashboard/relatorios/exportar";

      const response = await fetch(exportUrl);

      if (!response.ok) {
        let message =
          "Não foi possível gerar a planilha.";

        try {
          const result = await response.json();

          if (
            result &&
            typeof result.message === "string"
          ) {
            message = result.message;
          }
        } catch {
          // A resposta pode não ser JSON.
        }

        throw new Error(message);
      }

      const blob = await response.blob();

      const disposition =
        response.headers.get(
          "content-disposition"
        );

      const fileNameMatch =
        disposition?.match(
          /filename="?([^"]+)"?/i
        );

      const fileName =
        fileNameMatch?.[1] ||
        "relatorio-atlas-360.xlsx";

      const objectUrl =
        URL.createObjectURL(blob);

      const anchor =
        document.createElement("a");

      anchor.href = objectUrl;
      anchor.download = decodeURIComponent(
        fileName
      );

      document.body.appendChild(anchor);

      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error(
        "Erro ao exportar relatório:",
        error
      );

      window.alert(
        error instanceof Error
          ? error.message
          : "Não foi possível gerar a planilha."
      );
    } finally {
      setDownloading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={downloading}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#081B33] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#102A4C] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {downloading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Gerando planilha...
        </>
      ) : (
        <>
          <FileSpreadsheet className="h-4 w-4" />
          Exportar Excel
          <Download className="h-4 w-4" />
        </>
      )}
    </button>
  );
}