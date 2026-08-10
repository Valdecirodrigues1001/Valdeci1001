"use client";

import { useActionState } from "react";
import {
  type LeaderDetailState,
  updateLeader,
} from "./actions";

type ParentLeader = {
  id: string;
  full_name: string;
};

type LeaderData = {
  id: string;
  parent_leader_id: string | null;
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
  instagram: string | null;
  facebook: string | null;
  area_of_influence: string | null;
  estimated_supporters: number;
  status: string;
  notes: string | null;
};

type LeaderEditFormProps = {
  leader: LeaderData;
  parentLeaders: ParentLeader[];
};

const initialState: LeaderDetailState = {};

export function LeaderEditForm({
  leader,
  parentLeaders,
}: LeaderEditFormProps) {
  const updateAction = updateLeader.bind(null, leader.id);

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
              defaultValue={leader.full_name}
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
              defaultValue={leader.birth_date ?? ""}
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
              defaultValue={leader.profession ?? ""}
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
              defaultValue={leader.whatsapp ?? ""}
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
              defaultValue={leader.phone ?? ""}
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
              defaultValue={leader.email ?? ""}
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
              defaultValue={leader.postal_code ?? ""}
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
              defaultValue={leader.city ?? ""}
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
              defaultValue={leader.neighborhood ?? ""}
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
              defaultValue={leader.street ?? ""}
              className={inputClassName}
            />
          </div>

          <div>
            <label
              htmlFor="street_number"
              className={labelClassName}
            >
              Número
            </label>

            <input
              id="street_number"
              name="street_number"
              defaultValue={leader.street_number ?? ""}
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
              defaultValue={leader.complement ?? ""}
              className={inputClassName}
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#081B33]">
          Atuação política
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label
              htmlFor="area_of_influence"
              className={labelClassName}
            >
              Área de influência
            </label>

            <input
              id="area_of_influence"
              name="area_of_influence"
              defaultValue={leader.area_of_influence ?? ""}
              className={inputClassName}
            />
          </div>

          <div>
            <label
              htmlFor="estimated_supporters"
              className={labelClassName}
            >
              Potencial estimado
            </label>

            <input
              id="estimated_supporters"
              name="estimated_supporters"
              type="number"
              min="0"
              defaultValue={leader.estimated_supporters}
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="status" className={labelClassName}>
              Situação
            </label>

            <select
              id="status"
              name="status"
              defaultValue={leader.status}
              className={inputClassName}
            >
              <option value="prospect">Em prospecção</option>
              <option value="active">Ativa</option>
              <option value="inactive">Inativa</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="parent_leader_id"
              className={labelClassName}
            >
              Liderança responsável
            </label>

            <select
              id="parent_leader_id"
              name="parent_leader_id"
              defaultValue={leader.parent_leader_id ?? ""}
              className={inputClassName}
            >
              <option value="">
                Nenhuma liderança superior
              </option>

              {parentLeaders.map((parentLeader) => (
                <option
                  key={parentLeader.id}
                  value={parentLeader.id}
                >
                  {parentLeader.full_name}
                </option>
              ))}
            </select>
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
              defaultValue={leader.instagram ?? ""}
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
              defaultValue={leader.facebook ?? ""}
              className={inputClassName}
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="notes" className={labelClassName}>
              Observações
            </label>

            <textarea
              id="notes"
              name="notes"
              rows={5}
              defaultValue={leader.notes ?? ""}
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

      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-xl bg-[#081B33] px-7 font-semibold text-white transition hover:bg-[#102A4C] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Salvar alterações"}
      </button>
    </form>
  );
}