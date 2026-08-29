"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

type DashboardErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({
  error,
  reset,
}: DashboardErrorProps) {
  useEffect(() => {
    console.error("Erro no painel:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F6F8] p-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-[#081B33]">
          Algo deu errado
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Não foi possível concluir a operação. Tente
          novamente. Se o problema persistir, entre em
          contato com o suporte.
        </p>

        {error.digest ? (
          <p className="mt-2 text-xs text-slate-400">
            Código: {error.digest}
          </p>
        ) : null}

        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#081B33] px-6 text-sm font-semibold text-white transition hover:bg-[#102A4C]"
        >
          <RotateCcw size={16} />
          Tentar novamente
        </button>
      </div>
    </main>
  );
}
