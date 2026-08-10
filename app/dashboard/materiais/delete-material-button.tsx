"use client";

import { useState, useTransition } from "react";
import {
  AlertTriangle,
  Loader2,
  Trash2,
  X,
} from "lucide-react";

import { deleteMaterial } from "./actions";

type DeleteMaterialButtonProps = {
  materialId: string;
};

export default function DeleteMaterialButton({
  materialId,
}: DeleteMaterialButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteMaterial(materialId);
      setOpen(false);
    });
  }

  return (
    <>
      <button
        type="button"
        title="Excluir material"
        onClick={() => setOpen(true)}
        className="flex h-9 w-full items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Excluir material
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Tem certeza que deseja excluir este
                    material?
                  </p>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border-y border-slate-100 px-6 py-5">
              <p className="text-sm font-medium text-slate-800">
                Esta ação removerá permanentemente:
              </p>

              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>• O cadastro do material</li>
                <li>• O arquivo armazenado</li>
              </ul>

              <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                Esta ação não poderá ser desfeita.
              </p>
            </div>

            <div className="flex justify-end gap-3 p-6">
              <button
                type="button"
                disabled={pending}
                onClick={() => setOpen(false)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={pending}
                onClick={handleDelete}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Excluir material
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}