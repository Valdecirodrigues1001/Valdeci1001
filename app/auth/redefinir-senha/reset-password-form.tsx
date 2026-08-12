"use client";

import Link from "next/link";
import {
  useActionState,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";

import {
  KeyRound,
  Loader2,
  Save,
} from "lucide-react";

import {
  resetPassword,
  type ResetPasswordState,
} from "./actions";

const initialState: ResetPasswordState = {
  success: false,
  message: "",
};

export default function ResetPasswordForm() {
  const router = useRouter();

  const [
    state,
    formAction,
    pending,
  ] = useActionState(
    resetPassword,
    initialState
  );

  useEffect(() => {
    if (!state.success) {
      return;
    }

    const timeout =
      window.setTimeout(() => {
        router.replace("/login");
        router.refresh();
      }, 1200);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [
    state.success,
    router,
  ]);

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

        <div className="relative">
          <KeyRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Mínimo de 8 caracteres"
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#081B33] focus:ring-4 focus:ring-[#081B33]/10"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="confirmation"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Confirmar nova senha
        </label>

        <div className="relative">
          <KeyRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            id="confirmation"
            name="confirmation"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Digite novamente"
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#081B33] focus:ring-4 focus:ring-[#081B33]/10"
          />
        </div>
      </div>

      {state.message ? (
        <div
          role="status"
          className={`rounded-xl px-4 py-3 text-sm leading-6 ${
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
        disabled={
          pending ||
          state.success
        }
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#081B33] px-5 text-sm font-semibold text-white transition hover:bg-[#102A4C] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : state.success ? (
          "Senha alterada"
        ) : (
          <>
            <Save className="h-4 w-4" />
            Salvar nova senha
          </>
        )}
      </button>

      <div className="text-center">
        <Link
          href="/login"
          className="text-sm font-semibold text-[#081B33] transition hover:opacity-70"
        >
          Voltar para o login
        </Link>
      </div>
    </form>
  );
}