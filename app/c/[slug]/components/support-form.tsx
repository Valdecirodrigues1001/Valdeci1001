"use client";

import { useActionState } from "react";
import {
  CheckCircle2,
  HeartHandshake,
  Loader2,
} from "lucide-react";

import {
  type PublicSupportFormState,
  submitPublicSupportForm,
} from "../support-actions";

type SupportFormProps = {
  slug: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  communityGroupUrl?: string | null;
};



const initialState: PublicSupportFormState = {};

export default function SupportForm({
  slug,
  primaryColor,
  secondaryColor,
  accentColor,
  communityGroupUrl,
}: SupportFormProps) {
  const submitAction = submitPublicSupportForm.bind(
    null,
    slug
  );

  const [state, formAction, pending] =
    useActionState(
      submitAction,
      initialState
    );

  const inputClassName =
    "h-12 w-full rounded-xl border border-white/15 bg-white/10 px-4 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-white/40 focus:bg-white/15 focus:ring-4 focus:ring-white/10";

  const labelClassName =
    "mb-2 block text-sm font-semibold text-white/80";

if (state.success) {
  return (
    <div
      className="rounded-[2rem] border p-7 text-center sm:p-8"
      style={{
        borderColor: `${secondaryColor}40`,
        backgroundColor: `${accentColor}0A`,
      }}
    >
      <div
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{
          backgroundColor: `${secondaryColor}1F`,
          color: secondaryColor,
        }}
      >
        <CheckCircle2 className="h-8 w-8" />
      </div>

      <h3 className="mt-5 text-2xl font-black text-white">
        Obrigado pelo apoio!
      </h3>

      <p className="mt-3 leading-7 text-white/70">
        {state.success}
      </p>

      {communityGroupUrl && (
        <>
          <p className="mt-8 text-sm leading-6 text-white/60">
            Enquanto isso, participe da comunidade oficial da campanha e acompanhe
            novidades, eventos e conteúdos exclusivos.
          </p>

          <a
            href={communityGroupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl px-7 text-sm font-black shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            style={{
              backgroundColor: secondaryColor,
              color: primaryColor,
            }}
          >
            👥 Entrar no grupo da campanha
          </a>
        </>
      )}
    </div>
  );
}
  return (
    <form
      action={formAction}
      className="rounded-[2rem] border p-6 sm:p-7"
      style={{
        borderColor: `${secondaryColor}40`,
        backgroundColor: `${accentColor}0A`,
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: `${secondaryColor}1F`,
            color: secondaryColor,
          }}
        >
          <HeartHandshake className="h-6 w-6" />
        </div>

        <div>
          <h3 className="text-xl font-black text-white">
            Quero apoiar
          </h3>

          <p className="mt-1 text-sm leading-6 text-white/60">
            Preencha seus dados e nossa equipe entrará em contato.
          </p>
        </div>
      </div>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            htmlFor="support_full_name"
            className={labelClassName}
          >
            Nome completo *
          </label>

          <input
            id="support_full_name"
            name="full_name"
            autoComplete="name"
            required
            placeholder="Digite seu nome completo"
            className={inputClassName}
          />

          {state.errors?.full_name ? (
            <p className="mt-2 text-sm text-red-300">
              {state.errors.full_name}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="support_whatsapp"
            className={labelClassName}
          >
            WhatsApp *
          </label>

          <input
            id="support_whatsapp"
            name="whatsapp"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            placeholder="(51) 99999-9999"
            className={inputClassName}
          />

          {state.errors?.whatsapp ? (
            <p className="mt-2 text-sm text-red-300">
              {state.errors.whatsapp}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="support_email"
            className={labelClassName}
          >
            E-mail
          </label>

          <input
            id="support_email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            className={inputClassName}
          />

          {state.errors?.email ? (
            <p className="mt-2 text-sm text-red-300">
              {state.errors.email}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="support_city"
            className={labelClassName}
          >
            Cidade
          </label>

          <input
            id="support_city"
            name="city"
            autoComplete="address-level2"
            placeholder="Sua cidade"
            className={inputClassName}
          />
        </div>

        <div>
          <label
            htmlFor="support_neighborhood"
            className={labelClassName}
          >
            Bairro
          </label>

          <input
            id="support_neighborhood"
            name="neighborhood"
            autoComplete="address-level3"
            placeholder="Seu bairro"
            className={inputClassName}
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="support_participation_type"
            className={labelClassName}
          >
            Como deseja participar?
          </label>

          <select
            id="support_participation_type"
            name="participation_type"
            defaultValue=""
            className={inputClassName}
          >
            <option
              value=""
              className="text-slate-900"
            >
              Selecione uma opção
            </option>

            <option
              value="Apoiar a campanha"
              className="text-slate-900"
            >
              Apoiar a campanha
            </option>

            <option
              value="Ser voluntário"
              className="text-slate-900"
            >
              Ser voluntário
            </option>

            <option
              value="Participar de eventos"
              className="text-slate-900"
            >
              Participar de eventos
            </option>

            <option
              value="Compartilhar materiais"
              className="text-slate-900"
            >
              Compartilhar materiais
            </option>

            <option
              value="Receber informações"
              className="text-slate-900"
            >
              Receber informações
            </option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="support_message"
            className={labelClassName}
          >
            Mensagem
          </label>

          <textarea
            id="support_message"
            name="message"
            rows={4}
            placeholder="Conte como você gostaria de participar..."
            className="w-full resize-none rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-white/40 focus:bg-white/15 focus:ring-4 focus:ring-white/10"
          />
        </div>
      </div>

      {state.error ? (
        <p className="mt-5 rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl px-7 text-sm font-black shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          backgroundColor: secondaryColor,
          color: primaryColor,
        }}
      >
        {pending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <HeartHandshake className="h-5 w-5" />
            Enviar meu apoio
          </>
        )}
      </button>

      <p className="mt-4 text-center text-xs leading-5 text-white/45">
        Ao enviar, você autoriza o contato da equipe da campanha.
      </p>
    </form>
  );
}