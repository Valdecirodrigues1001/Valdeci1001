"use client";

import { useActionState } from "react";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Save,
  Users,
} from "lucide-react";
import {
  toDateInputValue,
  toTimeInputValue,
} from "@/lib/datetime";

import {
  updateCampaignEvent,
  type AgendaActionState,
} from "../actions";

type CampaignEvent = {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  status: string;
  start_at: string;
  end_at: string | null;
  city: string | null;
  neighborhood: string | null;
  address: string | null;
  location_name: string | null;
  estimated_audience: number;
  leader_id: string | null;
  notes: string | null;
};

type LeaderOption = {
  id: string;
  full_name: string;
};

type EventEditFormProps = {
  event: CampaignEvent;
  leaders: LeaderOption[];
};

const initialState: AgendaActionState = {};

function getDateValue(value: string | null) {
  return value ? toDateInputValue(value) : "";
}

function getTimeValue(value: string | null) {
  return value ? toTimeInputValue(value) : "";
}

export function EventEditForm({
  event,
  leaders,
}: EventEditFormProps) {
  const updateAction = updateCampaignEvent.bind(
    null,
    event.id
  );

  const [state, formAction, pending] = useActionState(
    updateAction,
    initialState
  );

  const inputClassName =
    "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#081B33] focus:ring-4 focus:ring-[#081B33]/10";

  const labelClassName =
    "mb-2 block text-sm font-medium text-slate-700";

  return (
    <form action={formAction} className="space-y-7">
      <div>
        <label htmlFor="title" className={labelClassName}>
          Título do compromisso
        </label>

        <input
          id="title"
          name="title"
          required
          defaultValue={event.title}
          className={inputClassName}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="event_type"
            className={labelClassName}
          >
            Tipo
          </label>

          <select
            id="event_type"
            name="event_type"
            defaultValue={event.event_type}
            className={inputClassName}
          >
            <option value="meeting">Reunião</option>
            <option value="visit">Visita</option>
            <option value="event">Evento</option>
            <option value="interview">Entrevista</option>
            <option value="mobilization">
              Mobilização
            </option>
            <option value="internal">
              Compromisso interno
            </option>
            <option value="other">Outro</option>
          </select>
        </div>

        <div>
          <label htmlFor="status" className={labelClassName}>
            Situação
          </label>

          <select
            id="status"
            name="status"
            defaultValue={event.status}
            className={inputClassName}
          >
            <option value="scheduled">Agendado</option>
            <option value="confirmed">Confirmado</option>
            <option value="completed">Concluído</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays
            size={18}
            className="text-[#081B33]"
          />

          <h3 className="font-semibold text-[#081B33]">
            Data e horário
          </h3>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="start_date"
              className={labelClassName}
            >
              Data de início
            </label>

            <input
              id="start_date"
              name="start_date"
              type="date"
              required
              defaultValue={getDateValue(event.start_at)}
              className={inputClassName}
            />
          </div>

          <div>
            <label
              htmlFor="start_time"
              className={labelClassName}
            >
              Horário de início
            </label>

            <input
              id="start_time"
              name="start_time"
              type="time"
              required
              defaultValue={getTimeValue(event.start_at)}
              className={inputClassName}
            />
          </div>

          <div>
            <label
              htmlFor="end_date"
              className={labelClassName}
            >
              Data de término
            </label>

            <input
              id="end_date"
              name="end_date"
              type="date"
              defaultValue={getDateValue(event.end_at)}
              className={inputClassName}
            />
          </div>

          <div>
            <label
              htmlFor="end_time"
              className={labelClassName}
            >
              Horário de término
            </label>

            <input
              id="end_time"
              name="end_time"
              type="time"
              defaultValue={getTimeValue(event.end_at)}
              className={inputClassName}
            />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <MapPin size={18} className="text-[#081B33]" />

          <h3 className="font-semibold text-[#081B33]">
            Local
          </h3>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="location_name"
              className={labelClassName}
            >
              Nome do local
            </label>

            <input
              id="location_name"
              name="location_name"
              defaultValue={event.location_name ?? ""}
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
              defaultValue={event.city ?? ""}
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
              defaultValue={event.neighborhood ?? ""}
              className={inputClassName}
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="address"
              className={labelClassName}
            >
              Endereço
            </label>

            <input
              id="address"
              name="address"
              defaultValue={event.address ?? ""}
              className={inputClassName}
            />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <Users size={18} className="text-[#081B33]" />

          <h3 className="font-semibold text-[#081B33]">
            Organização
          </h3>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="leader_id"
              className={labelClassName}
            >
              Liderança vinculada
            </label>

            <select
              id="leader_id"
              name="leader_id"
              defaultValue={event.leader_id ?? ""}
              className={inputClassName}
            >
              <option value="">Nenhuma liderança</option>

              {leaders.map((leader) => (
                <option key={leader.id} value={leader.id}>
                  {leader.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="estimated_audience"
              className={labelClassName}
            >
              Público estimado
            </label>

            <input
              id="estimated_audience"
              name="estimated_audience"
              type="number"
              min="0"
              defaultValue={event.estimated_audience}
              className={inputClassName}
            />
          </div>
        </div>
      </section>

      <div>
        <label
          htmlFor="description"
          className={labelClassName}
        >
          Descrição
        </label>

        <textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={event.description ?? ""}
          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#081B33] focus:ring-4 focus:ring-[#081B33]/10"
        />
      </div>

      <div>
        <label htmlFor="notes" className={labelClassName}>
          Observações internas
        </label>

        <textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={event.notes ?? ""}
          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#081B33] focus:ring-4 focus:ring-[#081B33]/10"
        />
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
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#081B33] px-6 font-semibold text-white transition hover:bg-[#102A4C] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? (
          <>
            <Clock3 size={18} />
            Salvando...
          </>
        ) : (
          <>
            <Save size={18} />
            Salvar alterações
          </>
        )}
      </button>
    </form>
  );
}