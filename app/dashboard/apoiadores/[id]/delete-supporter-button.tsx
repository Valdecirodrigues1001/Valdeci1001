"use client";

import { useState, useTransition } from "react";
import { Trash2, X } from "lucide-react";

import { deleteSupporter } from "./actions";

type DeleteSupporterButtonProps = {
  supporterId: string;
  supporterName: string;
};

export function DeleteSupporterButton({
  supporterId,
  supporterName,
}: DeleteSupporterButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);

    startTransition(async () => {
      const result = await deleteSupporter(supporterId);

      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setIsOpen(true);
        }}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-red-200 px-5 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
        Excluir apoiador
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-5 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-supporter-title"
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-500">
                  Atenção
                </p>

                <h2
                  id="delete-supporter-title"
                  className="mt-2 text-2xl font-bold text-slate-950"
                >
                  Excluir apoiador
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={pending}
                aria-label="Fechar"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-5 leading-7 text-slate-600">
              Tem certeza de que deseja remover{" "}
              <strong className="text-slate-950">
                {supporterName}
              </strong>{" "}
              do CRM?
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              O registro será arquivado e deixará de aparecer na lista de
              apoiadores. Os dados permanecerão preservados no banco.
            </p>

            {error ? (
              <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={pending}
                className="h-12 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={pending}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                {pending ? "Excluindo..." : "Confirmar exclusão"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}