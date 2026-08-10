"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  createSupporter,
  type SupporterActionState,
} from "./actions";

type AreaOption = {
  id: string;
  name: string;
};

type TeamOption = {
  id: string;
  name: string;
  areaId: string | null;
};

type MemberOption = {
  id: string;
  name: string;
  jobTitle: string | null;
};

type SupporterFormProps = {
  areas: AreaOption[];
  teams: TeamOption[];
  members: MemberOption[];
};

const initialState: SupporterActionState = {};

export function SupporterForm({
  areas,
  teams,
  members,
}: SupporterFormProps) {
  const [state, formAction, pending] =
    useActionState(
      createSupporter,
      initialState
    );

  const formRef =
    useRef<HTMLFormElement>(null);

  const [selectedAreaId, setSelectedAreaId] =
    useState("");

  const [selectedTeamId, setSelectedTeamId] =
    useState("");

  const filteredTeams = useMemo(() => {
    if (!selectedAreaId) {
      return teams;
    }

    return teams.filter(
      (team) =>
        team.areaId === selectedAreaId
    );
  }, [selectedAreaId, teams]);

  useEffect(() => {
    if (!selectedTeamId) {
      return;
    }

    const selectedTeam = teams.find(
      (team) => team.id === selectedTeamId
    );

    if (
      selectedAreaId &&
      selectedTeam?.areaId !== selectedAreaId
    ) {
      setSelectedTeamId("");
    }
  }, [
    selectedAreaId,
    selectedTeamId,
    teams,
  ]);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setSelectedAreaId("");
      setSelectedTeamId("");
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
          <label
            htmlFor="full_name"
            className={labelClassName}
          >
            Nome completo
          </label>

          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            placeholder="Nome do apoiador"
            className={inputClassName}
          />
        </div>

        <div>
          <label
            htmlFor="whatsapp"
            className={labelClassName}
          >
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
          <label
            htmlFor="phone"
            className={labelClassName}
          >
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
          <label
            htmlFor="email"
            className={labelClassName}
          >
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
          <label
            htmlFor="profession"
            className={labelClassName}
          >
            Profissão
          </label>

          <input
            id="profession"
            name="profession"
            type="text"
            placeholder="Profissão"
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
            type="text"
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
            type="text"
            placeholder="Bairro"
            className={inputClassName}
          />
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
            defaultValue="supporter"
            className={inputClassName}
          >
            <option value="lead">
              Contato inicial
            </option>

            <option value="supporter">
              Apoiador
            </option>

            <option value="volunteer">
              Voluntário
            </option>

            <option value="inactive">
              Inativo
            </option>
          </select>
        </div>

        <div>
          <label
            htmlFor="origin"
            className={labelClassName}
          >
            Origem
          </label>

          <select
            id="origin"
            name="origin"
            defaultValue="manual"
            className={inputClassName}
          >
            <option value="manual">
              Cadastro manual
            </option>

            <option value="landing_page">
              Landing Page
            </option>

            <option value="event">
              Evento
            </option>

            <option value="referral">
              Indicação
            </option>

            <option value="social_media">
              Rede social
            </option>

            <option value="other">
              Outro
            </option>
          </select>
        </div>

        <div>
          <label
            htmlFor="area_id"
            className={labelClassName}
          >
            Área de atuação
          </label>

          <select
            id="area_id"
            name="area_id"
            value={selectedAreaId}
            onChange={(event) =>
              setSelectedAreaId(
                event.target.value
              )
            }
            className={inputClassName}
          >
            <option value="">
              Sem área definida
            </option>

            {areas.map((area) => (
              <option
                key={area.id}
                value={area.id}
              >
                {area.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="team_id"
            className={labelClassName}
          >
            Equipe de mobilização
          </label>

          <select
            id="team_id"
            name="team_id"
            value={selectedTeamId}
            onChange={(event) =>
              setSelectedTeamId(
                event.target.value
              )
            }
            className={inputClassName}
          >
            <option value="">
              Sem equipe definida
            </option>

            {filteredTeams.map((team) => (
              <option
                key={team.id}
                value={team.id}
              >
                {team.name}
              </option>
            ))}
          </select>

          {selectedAreaId &&
          filteredTeams.length === 0 ? (
            <p className="mt-2 text-xs text-amber-600">
              Esta área ainda não possui equipes
              ativas.
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="assigned_member_id"
            className={labelClassName}
          >
            Responsável pelo acompanhamento
          </label>

          <select
            id="assigned_member_id"
            name="assigned_member_id"
            defaultValue=""
            className={inputClassName}
          >
            <option value="">
              Sem responsável definido
            </option>

            {members.map((member) => (
              <option
                key={member.id}
                value={member.id}
              >
                {member.name}
                {member.jobTitle
                  ? ` — ${member.jobTitle}`
                  : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="next_contact_at"
            className={labelClassName}
          >
            Próximo contato
          </label>

          <input
            id="next_contact_at"
            name="next_contact_at"
            type="datetime-local"
            className={inputClassName}
          />
        </div>

        <div className="md:col-span-2">
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300">
            <input
              type="checkbox"
              name="is_leader"
              className="mt-1 h-4 w-4 rounded border-slate-300 accent-[#081B33]"
            />

            <span>
              <span className="block text-sm font-semibold text-[#081B33]">
                Identificar como liderança
              </span>

              <span className="mt-1 block text-sm leading-6 text-slate-500">
                Marque quando esta pessoa tiver
                influência, capacidade de
                mobilização ou liderança comunitária.
              </span>
            </span>
          </label>
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="notes"
            className={labelClassName}
          >
            Observações
          </label>

          <textarea
            id="notes"
            name="notes"
            rows={4}
            placeholder="Informações importantes sobre o apoiador"
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
        {pending
          ? "Cadastrando..."
          : "Cadastrar apoiador"}
      </button>
    </form>
  );
}