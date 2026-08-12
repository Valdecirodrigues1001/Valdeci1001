"use client";

import {
  useActionState,
} from "react";

import {
  Loader2,
  Mail,
  Send,
} from "lucide-react";

import {
  requestPasswordReset,
  type ForgotPasswordState,
} from "./actions";

const initialState: ForgotPasswordState = {
  success: false,
  message: "",
};

export default function ForgotPasswordForm() {
  const [
    state,
    formAction,
    pending,
  ] = useActionState(
    requestPasswordReset,
    initialState
  );

  return (
    <form
      action={formAction}
      className="space-y-5"
    >
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          E-mail
        </label>

        <div className="relative">
          <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="seuemail@exemplo.com"
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#081B33] focus:ring-4 focus:ring-[#081B33]/10"
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
            Enviando...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Enviar link de recuperação
          </>
        )}
      </button>
    </form>
  );
}