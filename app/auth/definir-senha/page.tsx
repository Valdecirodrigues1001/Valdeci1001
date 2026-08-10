import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DefinePasswordForm } from "./define-password-form";

export default async function DefinePasswordPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=convite-invalido");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#D4AF37]">
          Primeiro acesso
        </p>

        <h1 className="mt-3 text-3xl font-semibold text-[#081B33]">
          Defina sua senha
        </h1>

        <p className="mt-3 leading-7 text-slate-500">
          Crie uma senha para acessar o sistema da campanha.
        </p>

        <div className="mt-7">
          <DefinePasswordForm />
        </div>
      </section>
    </main>
  );
}