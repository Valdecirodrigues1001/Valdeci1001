"use client";

import {
  useActionState,
  useEffect,
  useState,
} from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  Users,
} from "lucide-react";
import {
  completeCampaignEvent,
  type AgendaActionState,
} from "../actions";

type EventCompletionFormProps = {
  eventId: string;
  estimatedAudience: number;
  actualAudience: number | null;
  outcome: string | null;
  followUpRequired: boolean;
  followUpNotes: string | null;
  status: string;
  followUpDueDate: string | null;
};

const initialState: AgendaActionState = {};

export function EventCompletionForm({
  eventId,
  estimatedAudience,
  actualAudience,
  outcome,
  followUpRequired,
  followUpNotes,
  status,
  followUpDueDate,
}: EventCompletionFormProps) {
  const completionAction =
    completeCampaignEvent.bind(null, eventId);

  const [state, formAction, pending] = useActionState(
    completionAction,
    initialState
  );

  const [requiresFollowUp, setRequiresFollowUp] =
    useState(followUpRequired);

  useEffect(() => {
    if (state.success) {
      setRequiresFollowUp(
        Boolean(followUpRequired)
      );
    }
  }, [state.success, followUpRequired]);

  const inputClassName =
    "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#081B33] focus:ring-4 focus:ring-[#081B33]/10";

  const labelClassName =
    "mb-2 block text-sm font-medium text-slate-700";

  const isCompleted = status === "completed";

  return (
    <form action={formAction} className="space-y-6">
      {isCompleted ? (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-700">
          <CheckCircle2 size={21} />

          <div>
            <p className="font-semibold">
              Compromisso concluído
            </p>

            <p className="text-sm text-emerald-600">
              Você pode atualizar os resultados abaixo.
            </p>
          </div>
        </div>
      ) : null}

      <div>
        <div className="mb-3 flex items-center gap-2">
          <Users size={18} className="text-[#081B33]" />

          <h3 className="font-semibold text-[#081B33]">
            Participação
          </h3>
        </div>

        <label
          htmlFor="actual_audience"
          className={labelClassName}
        >
          Público presente
        </label>

        <input
          id="actual_audience"
          name="actual_audience"
          type="number"
          min="0"
          defaultValue={
            actualAudience ?? estimatedAudience
          }
          className={inputClassName}
        />

        <p className="mt-2 text-xs text-slate-400">
          Público estimado anteriormente:{" "}
          {estimatedAudience} pessoas.
        </p>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <ClipboardCheck
            size={18}
            className="text-[#081B33]"
          />

          <h3 className="font-semibold text-[#081B33]">
            Resultado
          </h3>
        </div>

        <label
          htmlFor="outcome"
          className={labelClassName}
        >
          Como foi o compromisso?
        </label>

        <textarea
          id="outcome"
          name="outcome"
          rows={5}
          required
          defaultValue={outcome ?? ""}
          placeholder="Registre os principais resultados, decisões e percepções da equipe."
          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#081B33] focus:ring-4 focus:ring-[#081B33]/10"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 p-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            name="follow_up_required"
            type="checkbox"
            checked={requiresFollowUp}
            onChange={(event) =>
              setRequiresFollowUp(event.target.checked)
            }
            className="mt-1 h-4 w-4 rounded border-slate-300 accent-[#081B33]"
          />

          <span>
            <span className="block font-semibold text-slate-700">
              Este compromisso precisa de acompanhamento
            </span>

            <span className="mt-1 block text-sm leading-6 text-slate-500">
              Marque quando houver retorno, nova reunião ou
              alguma providência pendente.
            </span>
          </span>
        </label>

        {requiresFollowUp ? (
  <div className="mt-4 space-y-4">
    <div>
      <label
        htmlFor="follow_up_due_date"
        className={labelClassName}
      >
        Data prevista para o retorno
      </label>

      <input
        id="follow_up_due_date"
        name="follow_up_due_date"
        type="date"
        defaultValue={followUpDueDate ?? ""}
        className={inputClassName}
      />
    </div>

    <div>
      <label
        htmlFor="follow_up_notes"
        className={labelClassName}
      >
        Próximas providências
      </label>

      <textarea
        id="follow_up_notes"
        name="follow_up_notes"
        rows={4}
        required
        defaultValue={followUpNotes ?? ""}
        placeholder="Ex.: Retornar contato até sexta-feira e enviar os materiais solicitados."
        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#081B33] focus:ring-4 focus:ring-[#081B33]/10"
      />
    </div>
  </div>
) : null}
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
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <CheckCircle2 size={18} />

        {pending
          ? "Salvando resultado..."
          : isCompleted
            ? "Atualizar resultado"
            : "Concluir compromisso"}
      </button>
    </form>
  );
}