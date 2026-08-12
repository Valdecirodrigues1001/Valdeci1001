import Link from "next/link";

import ForgotPasswordForm from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
          Recuperar acesso
        </p>

        <h1 className="mt-2 text-3xl font-black tracking-tight text-[#081B33]">
          Esqueci minha senha
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Informe o e-mail utilizado no Atlas. Enviaremos um link para você criar uma nova senha.
        </p>

        <div className="mt-7">
          <ForgotPasswordForm />
        </div>

        <div className="mt-6 border-t border-slate-100 pt-5">
          <Link
            href="/login"
            className="text-sm font-bold text-[#081B33] transition hover:opacity-70"
          >
            Voltar para o login
          </Link>
        </div>
      </div>
    </main>
  );
}