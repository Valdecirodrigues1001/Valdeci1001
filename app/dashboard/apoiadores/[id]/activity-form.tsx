"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  addSupporterActivity,
  type SupporterDetailState,
} from "./actions";

type ActivityFormProps = {
  supporterId: string;
};

const initialState: SupporterDetailState = {};

export function ActivityForm({
  supporterId,
}: ActivityFormProps) {
  const action = addSupporterActivity.bind(null, supporterId);

  const [state, formAction, pending] = useActionState(
    action,
    initialState
  );

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  const inputClassName =
    "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#081B33] focus:ring-4 focus:ring-[#081B33]/10";

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <select
        name="activity_type"
        defaultValue="contact"
        className={inputClassName}
      >
        <option value="contact">Contato realizado</option>
        <option value="event_participation">
          Participação em evento
        </option>
        <option value="material_request">
          Solicitação de material
        </option>
        <option value="became_volunteer">
          Tornou-se voluntário
        </option>
        <option value="note">Observação</option>
      </select>

      <input
        name="title"
        required
        placeholder="Título da atividade"
        className={inputClassName}
      />

      <textarea
        name="description"
        rows={4}
        placeholder="Descreva o que aconteceu"
        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#081B33] focus:ring-4 focus:ring-[#081B33]/10"
      />

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
        className="h-12 w-full rounded-xl bg-[#081B33] px-6 font-semibold text-white transition hover:bg-[#102A4C] disabled:opacity-60"
      >
        {pending ? "Registrando..." : "Registrar atividade"}
      </button>
    </form>
  );
}