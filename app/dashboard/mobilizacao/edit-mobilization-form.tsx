"use client";

import {
  MapPinned,
  Pencil,
  UsersRound,
  X,
} from "lucide-react";
import {
  useActionState,
  useEffect,
  useState,
} from "react";
import {
  updateCampaignArea,
  updateMobilizationTeam,
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

type EditableArea = {
  id: string;
  name: string;
  areaType: string;
  city: string | null;
  neighborhood: string | null;
  region: string | null;
  coordinatorMemberId: string | null;
  supportersGoal: number;
  visitsGoal: number;
  notes: string | null;
};

type EditableTeam = {
  id: string;
  name: string;
  areaId: string | null;
  coordinatorMemberId: string | null;
  description: string | null;
  supportersGoal: number;
  visitsGoal: number;
  eventsGoal: number;
};

type EditMobilizationFormProps =
  | {
      type: "area";
      item: EditableArea;
      coordinators: CoordinatorOption[];
      areas?: never;
    }
  | {
      type: "team";
      item: EditableTeam;
      coordinators: CoordinatorOption[];
      areas: AreaOption[];
    };

const initialState: MobilizationActionState = {
  success: false,
  message: "",
};

export function EditMobilizationForm(
  props: EditMobilizationFormProps
) {
  const [open, setOpen] = useState(false);

  const action =
    props.type === "area"
      ? updateCampaignArea
      : updateMobilizationTeam;

  const [state, formAction, pending] = useActionState(
    action,
    initialState
  );

  useEffect(() => {
    if (!state.success) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setOpen(false);
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [state.success]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 text-sm font-semibold text-[#081B33] transition hover:bg-slate-200"
      >
        <Pencil size={15} />
        Editar
      </button>

      {open ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fechar"
            className="absolute inset-0 bg-slate-950/60"
          />

          <section className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500"
              aria-label="Fechar"
            >
              <X size={19} />
            </button>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#081B33] text-white">
              {props.type === "area" ? (
                <MapPinned size={21} />
              ) : (
                <UsersRound size={21} />
              )}
            </div>

            <h2 className="mt-5 text-2xl font-semibold text-[#081B33]">
              {props.type === "area"
                ? "Editar área de atuação"
                : "Editar equipe de mobilização"}
            </h2>

            {props.type === "area" ? (
              <form
                action={formAction}
                className="mt-7 space-y-5"
              >
                <input
                  type="hidden"
                  name="area_id"
                  value={props.item.id}
                />

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Nome da área
                  </label>

                  <input
                    name="name"
                    required
                    defaultValue={props.item.name}
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Tipo
                    </label>

                    <select
                      name="area_type"
                      defaultValue={props.item.areaType}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm"
                    >
                      <option value="city">Cidade</option>
                      <option value="neighborhood">Bairro</option>
                      <option value="region">Região</option>
                      <option value="district">Distrito</option>
                      <option value="other">Outro</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Coordenador
                    </label>

                    <select
                      name="coordinator_member_id"
                      defaultValue={
                        props.item.coordinatorMemberId ?? ""
                      }
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm"
                    >
                      <option value="">
                        Sem coordenador
                      </option>

                      {props.coordinators.map(
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
                    defaultValue={props.item.city ?? ""}
                    placeholder="Cidade"
                    className="h-12 rounded-xl border border-slate-200 px-4 text-sm"
                  />

                  <input
                    name="neighborhood"
                    defaultValue={
                      props.item.neighborhood ?? ""
                    }
                    placeholder="Bairro"
                    className="h-12 rounded-xl border border-slate-200 px-4 text-sm"
                  />

                  <input
                    name="region"
                    defaultValue={props.item.region ?? ""}
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
                      defaultValue={
                        props.item.supportersGoal
                      }
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
                      defaultValue={props.item.visitsGoal}
                      className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm"
                    />
                  </div>
                </div>

                <textarea
                  name="notes"
                  rows={4}
                  defaultValue={props.item.notes ?? ""}
                  placeholder="Observações"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                />

                <ActionMessage
                  state={state}
                />

                <SubmitButton
                  pending={pending}
                  label="Salvar alterações"
                />
              </form>
            ) : (
              <form
                action={formAction}
                className="mt-7 space-y-5"
              >
                <input
                  type="hidden"
                  name="team_id"
                  value={props.item.id}
                />

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Nome da equipe
                  </label>

                  <input
                    name="name"
                    required
                    defaultValue={props.item.name}
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Área
                    </label>

                    <select
                      name="area_id"
                      defaultValue={props.item.areaId ?? ""}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm"
                    >
                      <option value="">
                        Sem área definida
                      </option>

                      {props.areas.map((area) => (
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
                      defaultValue={
                        props.item.coordinatorMemberId ?? ""
                      }
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm"
                    >
                      <option value="">
                        Sem coordenador
                      </option>

                      {props.coordinators.map(
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
                  defaultValue={
                    props.item.description ?? ""
                  }
                  placeholder="Descrição"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                />

                <div className="grid gap-5 sm:grid-cols-3">
                  <GoalInput
                    name="supporters_goal"
                    label="Apoiadores"
                    value={props.item.supportersGoal}
                  />

                  <GoalInput
                    name="visits_goal"
                    label="Visitas"
                    value={props.item.visitsGoal}
                  />

                  <GoalInput
                    name="events_goal"
                    label="Eventos"
                    value={props.item.eventsGoal}
                  />
                </div>

                <ActionMessage
                  state={state}
                />

                <SubmitButton
                  pending={pending}
                  label="Salvar alterações"
                />
              </form>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}

function GoalInput({
  name,
  label,
  value,
}: {
  name: string;
  label: string;
  value: number;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        name={name}
        type="number"
        min="0"
        defaultValue={value}
        className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm"
      />
    </div>
  );
}

function ActionMessage({
  state,
}: {
  state: MobilizationActionState;
}) {
  if (!state.message) {
    return null;
  }

  return (
    <div
      className={`rounded-xl px-4 py-3 text-sm ${
        state.success
          ? "bg-emerald-50 text-emerald-700"
          : "bg-red-50 text-red-700"
      }`}
    >
      {state.message}
    </div>
  );
}

function SubmitButton({
  pending,
  label,
}: {
  pending: boolean;
  label: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-12 w-full rounded-xl bg-[#081B33] text-sm font-semibold text-white disabled:opacity-60"
    >
      {pending ? "Salvando..." : label}
    </button>
  );
}