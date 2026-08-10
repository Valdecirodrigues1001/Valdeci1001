"use client";

import {
  useActionState,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import {
  definePassword,
  type DefinePasswordState,
} from "./actions";

const initialState: DefinePasswordState = {
  success: false,
  message: "",
};

export function DefinePasswordForm() {
  const router = useRouter();

  const [state, formAction, pending] =
    useActionState(
      definePassword,
      initialState
    );

  useEffect(() => {
    if (!state.success) {
      return;
    }

    const timeout = window.setTimeout(() => {
      router.replace("/dashboard");
      router.refresh();
    }, 700);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [state.success, router]);

  return (
    <form
      action={formAction}
      className="space-y-5"
    >
      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Nova senha
        </label>

        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Mínimo de 8 caracteres"
          className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#081B33] focus:ring-4 focus:ring-[#081B33]/10"
        />
      </div>

      <div>
        <label
          htmlFor="confirmation"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Confirmar senha
        </label>

        <input
          id="confirmation"
          name="confirmation"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Digite novamente"
          className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#081B33] focus:ring-4 focus:ring-[#081B33]/10"
        />
      </div>

      {state.message ? (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            state.success
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending || state.success}
        className="h-12 w-full rounded-xl bg-[#081B33] px-5 text-sm font-semibold text-white transition hover:bg-[#102A4C] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending
          ? "Configurando acesso..."
          : state.success
            ? "Acesso configurado"
            : "Criar senha e acessar"}
      </button>
    </form>
  );
}