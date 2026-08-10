import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen bg-slate-100">
      <section className="hidden w-1/2 flex-col justify-between bg-[#081B33] p-14 text-white lg:flex">
        <div>
          <div className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm">
            Sistema de Gestão Política
          </div>

          <h1 className="mt-10 max-w-xl text-5xl font-semibold leading-tight">
            Organização, estratégia e mobilização em um só lugar.
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
            Gerencie apoiadores, lideranças, agenda, conteúdos e informações da
            campanha por meio de um painel exclusivo.
          </p>
        </div>

        <p className="text-sm text-slate-400">
          Desenvolvido por BP Resultados
        </p>
      </section>

      <section className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl shadow-slate-900/5 sm:p-10">
          <div className="mb-2 h-1 w-16 rounded-full bg-[#D4AF37]" />

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
            Acesso exclusivo
          </p>

          <h2 className="mt-3 text-3xl font-semibold text-[#081B33]">
            Bem-vindo
          </h2>

          <p className="mt-2 text-slate-500">
            Entre com seus dados para acessar o painel.
          </p>

          <LoginForm />
        </div>
      </section>
    </main>
  );
}