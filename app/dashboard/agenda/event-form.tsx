"use client";

import {
  useActionState,
  useEffect,
  useRef,
} from "react";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Plus,
  Users,
} from "lucide-react";
import {
  createCampaignEvent,
  type AgendaActionState,
} from "./actions";

type LeaderOption = {
  id: string;
  full_name: string;
};

type EventFormProps = {
  leaders: LeaderOption[];
};

const initialState: AgendaActionState = {};

export function EventForm({
  leaders,
}: EventFormProps) {
  const [state, formAction, pending] = useActionState(
    createCampaignEvent,
    initialState
  );

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  const inputClassName =
    "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#081B33] focus:ring-4 focus:ring-[#081B33]/10";

  const labelClassName =
    "mb-2 block text-sm font-medium text-slate-700";

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-6"
    >
      <div>
        <label
          htmlFor="title"
          className={labelClassName}
        >
          Título do compromisso
        </label>

        <input
          id="title"
          name="title"
          required
          placeholder="Ex.: Reunião com lideranças locais"
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
            defaultValue="meeting"
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
          <label
            htmlFor="status"
            className={labelClassName}
          >
            Situação
          </label>

          <select
            id="status"
            name="status"
            defaultValue="scheduled"
            className={inputClassName}
          >
            <option value="scheduled">Agendado</option>
            <option value="confirmed">Confirmado</option>
            <option value="completed">Concluído</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
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
              className={inputClassName}
            />
          </div>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <MapPin
            size={18}
            className="text-[#081B33]"
          />

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
              placeholder="Ex.: Salão comunitário"
              className={inputClassName}
            />
          </div>

          <div>
            <label
              htmlFor="city"
              className={labelClassName}
            >
              Cidade
            </label>

            <input
              id="city"
              name="city"
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
              placeholder="Rua, número e complemento"
              className={inputClassName}
            />
          </div>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <Users
            size={18}
            className="text-[#081B33]"
          />

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
              defaultValue=""
              className={inputClassName}
            >
              <option value="">
                Nenhuma liderança
              </option>

              {leaders.map((leader) => (
                <option
                  key={leader.id}
                  value={leader.id}
                >
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
              defaultValue="0"
              className={inputClassName}
            />
          </div>
        </div>
      </div>

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
          rows={4}
          placeholder="Descreva o objetivo do compromisso"
          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#081B33] focus:ring-4 focus:ring-[#081B33]/10"
        />
      </div>

      <div>
        <label
          htmlFor="notes"
          className={labelClassName}
        >
          Observações internas
        </label>

        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Informações importantes para a equipe"
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
            Cadastrando...
          </>
        ) : (
          <>
            <Plus size={18} />
            Cadastrar compromisso
          </>
        )}
      </button>
    </form>
  );
}