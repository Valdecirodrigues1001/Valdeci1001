import ResetPasswordForm from "./reset-password-form";

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
          Recuperação de acesso
        </p>

        <h1 className="mt-2 text-3xl font-black tracking-tight text-[#081B33]">
          Criar nova senha
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Escolha uma nova senha para acessar o sistema.
        </p>

        <div className="mt-7">
          <ResetPasswordForm />
        </div>
      </div>
    </main>
  );
}