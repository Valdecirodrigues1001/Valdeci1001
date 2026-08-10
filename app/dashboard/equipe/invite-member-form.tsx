"use client";

import {
  Mail,
  Send,
  UserRoundPlus,
  X,
} from "lucide-react";
import {
  useActionState,
  useEffect,
  useState,
} from "react";
import {
  inviteTeamMember,
  type InviteTeamMemberState,
} from "./actions";

const initialState: InviteTeamMemberState = {
  success: false,
  message: "",
};

export function InviteMemberForm() {
  const [open, setOpen] = useState(false);

  const [state, formAction, pending] =
    useActionState(
      inviteTeamMember,
      initialState
    );

  useEffect(() => {
    if (state.success) {
      const timeout = window.setTimeout(() => {
        setOpen(false);
      }, 1800);

      return () => {
        window.clearTimeout(timeout);
      };
    }
  }, [state.success]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#081B33] px-5 text-sm font-semibold text-white transition hover:bg-[#102A4C]"
      >
        <UserRoundPlus size={19} />
        Convidar integrante
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-950/60"
            aria-label="Fechar formulário"
          />

          <section className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              aria-label="Fechar"
            >
              <X size={20} />
            </button>

            <div className="pr-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#081B33] text-white">
                <Mail size={22} />
              </div>

              <h2 className="mt-5 text-2xl font-semibold text-[#081B33]">
                Convidar integrante
              </h2>

              <p className="mt-2 leading-7 text-slate-500">
                O integrante receberá um e-mail para
                acessar o sistema e definir sua senha.
              </p>
            </div>

            <form
              action={formAction}
              className="mt-7 space-y-5"
            >
              <div>
                <label
                  htmlFor="full_name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Nome completo
                </label>

                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  placeholder="Nome do integrante"
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#081B33] focus:ring-4 focus:ring-[#081B33]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  E-mail
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="integrante@email.com"
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#081B33] focus:ring-4 focus:ring-[#081B33]/10"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="job_title"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Função na campanha
                  </label>

                  <input
                    id="job_title"
                    name="job_title"
                    type="text"
                    placeholder="Ex.: Coordenador regional"
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#081B33]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Telefone
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#081B33]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Nível de acesso
                </label>

                <select
                  id="role"
                  name="role"
                  defaultValue="viewer"
                  required
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-[#081B33]"
                >
                  <option value="campaign_admin">
                    Administrador
                  </option>

                  <option value="manager">
                    Gestor
                  </option>

                  <option value="editor">
                    Editor
                  </option>

                  <option value="viewer">
                    Visualizador
                  </option>
                </select>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Administradores gerenciam a equipe;
                  gestores coordenam áreas; editores
                  cadastram informações; visualizadores
                  apenas consultam.
                </p>
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

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-12 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#081B33] px-6 text-sm font-semibold text-white transition hover:bg-[#102A4C] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send size={18} />

                  {pending
                    ? "Enviando convite..."
                    : "Enviar convite"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}