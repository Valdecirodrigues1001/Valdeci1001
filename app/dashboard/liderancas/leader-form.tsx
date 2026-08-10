"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createLeader,
  type LeaderActionState,
} from "./actions";

type ParentLeader = {
  id: string;
  full_name: string;
};

type LeaderFormProps = {
  parentLeaders: ParentLeader[];
};

const initialState: LeaderActionState = {};

export function LeaderForm({
  parentLeaders,
}: LeaderFormProps) {
  const [state, formAction, pending] = useActionState(
    createLeader,
    initialState
  );

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  const inputClassName =
    "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#081B33] focus:ring-4 focus:ring-[#081B33]/10";

  const labelClassName =
    "mb-2 block text-sm font-medium text-slate-700";

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-6"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="full_name" className={labelClassName}>
            Nome completo
          </label>

          <input
            id="full_name"
            name="full_name"
            required
            placeholder="Nome da liderança"
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="whatsapp" className={labelClassName}>
            WhatsApp
          </label>

          <input
            id="whatsapp"
            name="whatsapp"
            type="tel"
            placeholder="(54) 99999-9999"
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
            type="tel"
            placeholder="Telefone alternativo"
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="email" className={labelClassName}>
            E-mail
          </label>

          <input
            id="email"
            name="email"
            type="email"
            placeholder="email@exemplo.com"
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
            placeholder="Profissão"
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
            placeholder="Cidade"
            className={inputClassName}
          />
        </div>

        <div>
          <label
            htmlFor="neighborhood"
            className={labelClassName}
          >
            Bairro
          </label>

          <input
            id="neighborhood"
            name="neighborhood"
            placeholder="Bairro"
            className={inputClassName}
          />
        </div>

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
            placeholder="Ex.: Bairro Centro, comércio, agricultura, juventude"
            className={inputClassName}
          />
        </div>

        <div>
          <label
            htmlFor="estimated_supporters"
            className={labelClassName}
          >
            Potencial estimado de apoiadores
          </label>

          <input
            id="estimated_supporters"
            name="estimated_supporters"
            type="number"
            min="0"
            defaultValue="0"
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
            defaultValue="active"
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
            defaultValue=""
            className={inputClassName}
          >
            <option value="">Nenhuma liderança superior</option>

            {parentLeaders.map((leader) => (
              <option key={leader.id} value={leader.id}>
                {leader.full_name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="notes" className={labelClassName}>
            Observações
          </label>

          <textarea
            id="notes"
            name="notes"
            rows={4}
            placeholder="Informações importantes sobre a liderança"
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#081B33] focus:ring-4 focus:ring-[#081B33]/10"
          />
        </div>
      </div>

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
        className="h-12 w-full rounded-xl bg-[#081B33] px-6 font-semibold text-white transition hover:bg-[#102A4C] disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
      >
        {pending ? "Cadastrando..." : "Cadastrar liderança"}
      </button>
    </form>
  );
}