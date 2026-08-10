"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          E-mail
        </label>

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="seu@email.com"
          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Senha
        </label>

        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="Digite sua senha"
          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10"
        />
      </div>

      {state.error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-xl bg-[#081B33] font-semibold text-white transition hover:bg-[#102A4C] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Entrando..." : "Entrar no sistema"}
      </button>
    </form>
  );
}