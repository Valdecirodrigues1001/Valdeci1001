"use client";

import { useActionState } from "react";
import { DeleteSupporterButton } from "./delete-supporter-button";
import {
  type SupporterDetailState,
  updateSupporter,
} from "./actions";

type SupporterData = {
  id: string;
  full_name: string;
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
  birth_date: string | null;
  profession: string | null;
  city: string | null;
  neighborhood: string | null;
  street: string | null;
  street_number: string | null;
  complement: string | null;
  postal_code: string | null;
  electoral_zone: string | null;
  electoral_section: string | null;
  polling_place: string | null;
  instagram: string | null;
  facebook: string | null;
  status: string;
  origin: string;
  notes: string | null;
};

type SupporterEditFormProps = {
  supporter: SupporterData;
};

const initialState: SupporterDetailState = {};

export function SupporterEditForm({
  supporter,
}: SupporterEditFormProps) {
  const updateAction = updateSupporter.bind(null, supporter.id);

  const [state, formAction, pending] = useActionState(
    updateAction,
    initialState
  );

  const inputClassName =
    "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#081B33] focus:ring-4 focus:ring-[#081B33]/10";

  const labelClassName =
    "mb-2 block text-sm font-medium text-slate-700";

  return (
    <form action={formAction} className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold text-[#081B33]">
          Informações pessoais
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="full_name" className={labelClassName}>
              Nome completo
            </label>

            <input
              id="full_name"
              name="full_name"
              required
              defaultValue={supporter.full_name}
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="birth_date" className={labelClassName}>
              Data de nascimento
            </label>

            <input
              id="birth_date"
              name="birth_date"
              type="date"
              defaultValue={supporter.birth_date ?? ""}
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="profession" className={labelClassName}>
              Profissão
            </label>

            <input
              id="profession"
              name="profession"
              defaultValue={supporter.profession ?? ""}
              className={inputClassName}
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#081B33]">
          Contato
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="whatsapp" className={labelClassName}>
              WhatsApp
            </label>

            <input
              id="whatsapp"
              name="whatsapp"
              defaultValue={supporter.whatsapp ?? ""}
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="phone" className={labelClassName}>
              Telefone
            </label>

            <input
              id="phone"
              name="phone"
              defaultValue={supporter.phone ?? ""}
              className={inputClassName}
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="email" className={labelClassName}>
              E-mail
            </label>

            <input
              id="email"
              name="email"
              type="email"
              defaultValue={supporter.email ?? ""}
              className={inputClassName}
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#081B33]">
          Endereço
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="postal_code" className={labelClassName}>
              CEP
            </label>

            <input
              id="postal_code"
              name="postal_code"
              defaultValue={supporter.postal_code ?? ""}
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="city" className={labelClassName}>
              Cidade
            </label>

            <input
              id="city"
              name="city"
              defaultValue={supporter.city ?? ""}
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="neighborhood" className={labelClassName}>
              Bairro
            </label>

            <input
              id="neighborhood"
              name="neighborhood"
              defaultValue={supporter.neighborhood ?? ""}
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="street" className={labelClassName}>
              Rua
            </label>

            <input
              id="street"
              name="street"
              defaultValue={supporter.street ?? ""}
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="street_number" className={labelClassName}>
              Número
            </label>

            <input
              id="street_number"
              name="street_number"
              defaultValue={supporter.street_number ?? ""}
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="complement" className={labelClassName}>
              Complemento
            </label>

            <input
              id="complement"
              name="complement"
              defaultValue={supporter.complement ?? ""}
              className={inputClassName}
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#081B33]">
          Informações eleitorais
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <div>
            <label htmlFor="electoral_zone" className={labelClassName}>
              Zona eleitoral
            </label>

            <input
              id="electoral_zone"
              name="electoral_zone"
              defaultValue={supporter.electoral_zone ?? ""}
              className={inputClassName}
            />
          </div>

          <div>
            <label
              htmlFor="electoral_section"
              className={labelClassName}
            >
              Seção eleitoral
            </label>

            <input
              id="electoral_section"
              name="electoral_section"
              defaultValue={supporter.electoral_section ?? ""}
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="polling_place" className={labelClassName}>
              Local de votação
            </label>

            <input
              id="polling_place"
              name="polling_place"
              defaultValue={supporter.polling_place ?? ""}
              className={inputClassName}
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#081B33]">
          Redes sociais
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="instagram" className={labelClassName}>
              Instagram
            </label>

            <input
              id="instagram"
              name="instagram"
              defaultValue={supporter.instagram ?? ""}
              placeholder="@usuario"
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="facebook" className={labelClassName}>
              Facebook
            </label>

            <input
              id="facebook"
              name="facebook"
              defaultValue={supporter.facebook ?? ""}
              className={inputClassName}
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#081B33]">
          Classificação
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="status" className={labelClassName}>
              Situação
            </label>

            <select
              id="status"
              name="status"
              defaultValue={supporter.status}
              className={inputClassName}
            >
              <option value="lead">Contato inicial</option>
              <option value="supporter">Apoiador</option>
              <option value="volunteer">Voluntário</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>

          <div>
            <label htmlFor="origin" className={labelClassName}>
              Origem
            </label>

            <select
              id="origin"
              name="origin"
              defaultValue={supporter.origin}
              className={inputClassName}
            >
              <option value="manual">Cadastro manual</option>
              <option value="landing_page">Landing Page</option>
              <option value="event">Evento</option>
              <option value="referral">Indicação</option>
              <option value="social_media">Rede social</option>
              <option value="other">Outro</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="notes" className={labelClassName}>
              Observações
            </label>

            <textarea
              id="notes"
              name="notes"
              rows={5}
              defaultValue={supporter.notes ?? ""}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#081B33] focus:ring-4 focus:ring-[#081B33]/10"
            />
          </div>
        </div>
      </section>

      {state.error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {state.success}
        </p>
      ) : null}

     <div className="flex flex-col-reverse gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
  <DeleteSupporterButton
    supporterId={supporter.id}
    supporterName={supporter.full_name}
  />

  <button
    type="submit"
    disabled={pending}
    className="h-12 rounded-xl bg-[#081B33] px-7 font-semibold text-white transition hover:bg-[#102A4C] disabled:opacity-60"
  >
    {pending ? "Salvando..." : "Salvar alterações"}
  </button>
</div>
    </form>
  );
}