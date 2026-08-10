"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  linkSupporter,
  type LeaderDetailState,
} from "./actions";

type AvailableSupporter = {
  id: string;
  full_name: string;
  neighborhood: string | null;
  city: string | null;
  leader_id: string | null;
};

type LinkSupporterFormProps = {
  leaderId: string;
  supporters: AvailableSupporter[];
};

const initialState: LeaderDetailState = {};

export function LinkSupporterForm({
  leaderId,
  supporters,
}: LinkSupporterFormProps) {
  const action = linkSupporter.bind(null, leaderId);

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

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <select
        name="supporter_id"
        required
        defaultValue=""
        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#081B33] focus:ring-4 focus:ring-[#081B33]/10"
      >
        <option value="" disabled>
          Selecione um apoiador
        </option>

        {supporters.map((supporter) => {
          const location = [
            supporter.neighborhood,
            supporter.city,
          ]
            .filter(Boolean)
            .join(", ");

          return (
            <option key={supporter.id} value={supporter.id}>
              {supporter.full_name}
              {location ? ` — ${location}` : ""}
              {supporter.leader_id
                ? " — vinculado a outra liderança"
                : ""}
            </option>
          );
        })}
      </select>

      {supporters.length === 0 ? (
        <p className="text-sm leading-6 text-slate-400">
          Não existem apoiadores disponíveis para vinculação.
        </p>
      ) : null}

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
        disabled={pending || supporters.length === 0}
        className="h-12 w-full rounded-xl bg-[#081B33] px-6 font-semibold text-white transition hover:bg-[#102A4C] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Vinculando..." : "Vincular apoiador"}
      </button>
    </form>
  );
}