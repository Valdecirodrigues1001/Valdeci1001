"use client";

import {
  MapPinned,
  Plus,
  Target,
  UsersRound,
  X,
} from "lucide-react";
import {
  useActionState,
  useEffect,
  useState,
} from "react";
import {
  createCampaignArea,
  createMobilizationTeam,
  type MobilizationActionState,
} from "./actions";

type CoordinatorOption = {
  id: string;
  name: string;
  jobTitle: string | null;
};

type AreaOption = {
  id: string;
  name: string;
};

type MobilizationFormsProps = {
  coordinators: CoordinatorOption[];
  areas: AreaOption[];
};

const initialState: MobilizationActionState = {
  success: false,
  message: "",
};

export function MobilizationForms({
  coordinators,
  areas,
}: MobilizationFormsProps) {
  const [modal, setModal] = useState<
    "area" | "team" | null
  >(null);

  const [areaState, areaAction, areaPending] =
    useActionState(
      createCampaignArea,
      initialState
    );

  const [teamState, teamAction, teamPending] =
    useActionState(
      createMobilizationTeam,
      initialState
    );

  useEffect(() => {
    if (!areaState.success) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setModal(null);
    }, 1200);

    return () => window.clearTimeout(timeout);
  }, [areaState.success]);

  useEffect(() => {
    if (!teamState.success) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setModal(null);
    }, 1200);

    return () => window.clearTimeout(timeout);
  }, [teamState.success]);

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => setModal("area")}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#081B33] bg-white px-5 text-sm font-semibold text-[#081B33] transition hover:bg-slate-50"
        >
          <MapPinned size={18} />
          Nova área
        </button>

        <button
          type="button"
          onClick={() => setModal("team")}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#081B33] px-5 text-sm font-semibold text-white transition hover:bg-[#102A4C]"
        >
          <Plus size={18} />
          Nova equipe
        </button>
      </div>

      {modal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setModal(null)}
            aria-label="Fechar formulário"
            className="absolute inset-0 bg-slate-950/60"
          />

          <section className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={() => setModal(null)}
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              aria-label="Fechar"
            >
              <X size={20} />
            </button>

            {modal === "area" ? (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#081B33] text-white">
                  <MapPinned size={22} />
                </div>

                <h2 className="mt-5 text-2xl font-semibold text-[#081B33]">
                  Nova área de atuação
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Cadastre cidades, bairros, regiões ou
                  distritos estratégicos da campanha.
                </p>

                <form
                  action={areaAction}
                  className="mt-7 space-y-5"
                >
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Nome da área
                    </label>

                    <input
                      name="name"
                      required
                      placeholder="Ex.: Região Norte"
                      className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#081B33]"
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Tipo
                      </label>

                      <select
                        name="area_type"
                        defaultValue="neighborhood"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm"
                      >
                        <option value="city">
                          Cidade
                        </option>
                        <option value="neighborhood">
                          Bairro
                        </option>
                        <option value="region">
                          Região
                        </option>
                        <option value="district">
                          Distrito
                        </option>
                        <option value="other">
                          Outro
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Coordenador
                      </label>

                      <select
                        name="coordinator_member_id"
                        defaultValue=""
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm"
                      >
                        <option value="">
                          Sem coordenador
                        </option>

                        {coordinators.map(
                          (coordinator) => (
                            <option
                              key={coordinator.id}
                              value={coordinator.id}
                            >
                              {coordinator.name}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-3">
                    <input
                      name="city"
                      placeholder="Cidade"
                      className="h-12 rounded-xl border border-slate-200 px-4 text-sm"
                    />

                    <input
                      name="neighborhood"
                      placeholder="Bairro"
                      className="h-12 rounded-xl border border-slate-200 px-4 text-sm"
                    />

                    <input
                      name="region"
                      placeholder="Região"
                      className="h-12 rounded-xl border border-slate-200 px-4 text-sm"
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Meta de apoiadores
                      </label>

                      <input
                        name="supporters_goal"
                        type="number"
                        min="0"
                        defaultValue="0"
                        className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Meta de visitas
                      </label>

                      <input
                        name="visits_goal"
                        type="number"
                        min="0"
                        defaultValue="0"
                        className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm"
                      />
                    </div>
                  </div>

                  <textarea
                    name="notes"
                    rows={4}
                    placeholder="Observações sobre a área"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                  />

                  {areaState.message ? (
                    <div
                      className={`rounded-xl px-4 py-3 text-sm ${
                        areaState.success
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {areaState.message}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={areaPending}
                    className="h-12 w-full rounded-xl bg-[#081B33] text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {areaPending
                      ? "Cadastrando..."
                      : "Cadastrar área"}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#081B33] text-white">
                  <UsersRound size={22} />
                </div>

                <h2 className="mt-5 text-2xl font-semibold text-[#081B33]">
                  Nova equipe de mobilização
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Organize os responsáveis e as metas de
                  atuação territorial.
                </p>

                <form
                  action={teamAction}
                  className="mt-7 space-y-5"
                >
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Nome da equipe
                    </label>

                    <input
                      name="name"
                      required
                      placeholder="Ex.: Equipe Região Norte"
                      className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm"
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Área de atuação
                      </label>

                      <select
                        name="area_id"
                        defaultValue=""
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm"
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
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Coordenador
                      </label>

                      <select
                        name="coordinator_member_id"
                        defaultValue=""
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm"
                      >
                        <option value="">
                          Sem coordenador
                        </option>

                        {coordinators.map(
                          (coordinator) => (
                            <option
                              key={coordinator.id}
                              value={coordinator.id}
                            >
                              {coordinator.name}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>

                  <textarea
                    name="description"
                    rows={4}
                    placeholder="Descrição da equipe"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                  />

                  <div className="grid gap-5 sm:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Apoiadores
                      </label>

                      <input
                        name="supporters_goal"
                        type="number"
                        min="0"
                        defaultValue="0"
                        className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Visitas
                      </label>

                      <input
                        name="visits_goal"
                        type="number"
                        min="0"
                        defaultValue="0"
                        className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Eventos
                      </label>

                      <input
                        name="events_goal"
                        type="number"
                        min="0"
                        defaultValue="0"
                        className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm"
                      />
                    </div>
                  </div>

                  {teamState.message ? (
                    <div
                      className={`rounded-xl px-4 py-3 text-sm ${
                        teamState.success
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {teamState.message}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={teamPending}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#081B33] text-sm font-semibold text-white disabled:opacity-60"
                  >
                    <Target size={18} />

                    {teamPending
                      ? "Cadastrando..."
                      : "Cadastrar equipe"}
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}