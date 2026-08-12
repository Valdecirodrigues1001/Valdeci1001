"use client";

import Link from "next/link";
import {
  useActionState,
} from "react";

import {
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  LogIn,
  Mail,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  login,
  type LoginState,
} from "./actions";

const initialState: LoginState = {
  error: undefined,
};

export function LoginForm() {
  const [
    state,
    formAction,
    pending,
  ] = useActionState(
    login,
    initialState
  );

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  return (
    <form
      action={formAction}
      className="mt-8 space-y-5"
    >
      {/* E-mail */}
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

      {/* Senha */}
      <div>
        <div className="mb-2 flex items-center justify-between gap-4">
          <label
            htmlFor="password"
            className="text-sm font-semibold text-slate-700"
          >
            Senha
          </label>

          <Link
            href="/auth/esqueci-senha"
            className="text-sm font-semibold text-[#081B33] transition hover:text-[#D4AF37]"
          >
            Esqueci minha senha?
          </Link>
        </div>

        <div className="relative">
          <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            id="password"
            name="password"
            type={
              showPassword
                ? "text"
                : "password"
            }
            required
            autoComplete="current-password"
            placeholder="Digite sua senha"
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#081B33] focus:ring-4 focus:ring-[#081B33]/10"
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                (current) =>
                  !current
              )
            }
            aria-label={
              showPassword
                ? "Ocultar senha"
                : "Mostrar senha"
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#081B33]"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Erro */}
      {state.error ? (
        <div
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
        >
          {state.error}
        </div>
      ) : null}

      {/* Entrar */}
      <button
        type="submit"
        disabled={pending}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#081B33] px-5 text-sm font-semibold text-white transition hover:bg-[#102A4C] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Entrando...
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" />
            Entrar no painel
          </>
        )}
      </button>

      <p className="text-center text-xs leading-5 text-slate-400">
        Acesso exclusivo para integrantes autorizados da campanha.
      </p>
    </form>
  );
}