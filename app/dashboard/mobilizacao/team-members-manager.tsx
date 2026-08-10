"use client";

import {
  Crown,
  Plus,
  Trash2,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import {
  useActionState,
  useEffect,
  useState,
} from "react";
import {
  addMobilizationTeamMember,
  removeMobilizationTeamMember,
  type MobilizationActionState,
} from "./actions";

type CampaignMemberOption = {
  id: string;
  name: string;
  jobTitle: string | null;
};

type TeamMemberItem = {
  id: string;
  campaignMemberId: string;
  name: string;
  jobTitle: string | null;
  teamRole: string;
};

type TeamMembersManagerProps = {
  teamId: string;
  teamName: string;
  campaignMembers: CampaignMemberOption[];
  teamMembers: TeamMemberItem[];
  canManage: boolean;
};

const initialState: MobilizationActionState = {
  success: false,
  message: "",
};

const roleLabels: Record<string, string> = {
  coordinator: "Coordenador",
  leader: "Líder",
  member: "Integrante",
};

export function TeamMembersManager({
  teamId,
  teamName,
  campaignMembers,
  teamMembers,
  canManage,
}: TeamMembersManagerProps) {
  const [open, setOpen] = useState(false);

  const [state, formAction, pending] =
    useActionState(
      addMobilizationTeamMember,
      initialState
    );

  useEffect(() => {
    if (!state.success) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setOpen(false);
    }, 900);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [state.success]);

  const activeMemberIds = new Set(
    teamMembers.map(
      (member) => member.campaignMemberId
    )
  );

  const availableMembers =
    campaignMembers.filter(
      (member) =>
        !activeMemberIds.has(member.id)
    );

  return (
    <>
      <div className="mt-5 border-t border-slate-100 pt-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#081B33]">
              Integrantes
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {teamMembers.length}{" "}
              {teamMembers.length === 1
                ? "pessoa vinculada"
                : "pessoas vinculadas"}
            </p>
          </div>

          {canManage ? (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 text-xs font-semibold text-[#081B33] transition hover:bg-slate-200"
            >
              <Plus size={15} />
              Adicionar
            </button>
          ) : null}
        </div>

        {teamMembers.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center">
            <UsersRound
              size={25}
              className="mx-auto text-slate-300"
            />

            <p className="mt-2 text-xs text-slate-400">
              Nenhum integrante adicionado.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                    {member.teamRole ===
                    "coordinator" ? (
                      <Crown size={16} />
                    ) : (
                      <UserRound size={16} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#081B33]">
                      {member.name}
                    </p>

                    <p className="truncate text-xs text-slate-400">
                      {roleLabels[
                        member.teamRole
                      ] ?? member.teamRole}

                      {member.jobTitle
                        ? ` • ${member.jobTitle}`
                        : ""}
                    </p>
                  </div>
                </div>

                {canManage ? (
                  <form
                    action={
                      removeMobilizationTeamMember
                    }
                  >
                    <input
                      type="hidden"
                      name="team_member_id"
                      value={member.id}
                    />

                    <button
                      type="submit"
                      title="Remover integrante"
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </form>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      {open ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Fechar"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-950/60"
          />

          <section className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500"
            >
              <X size={19} />
            </button>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#081B33] text-white">
              <UsersRound size={21} />
            </div>

            <h2 className="mt-5 pr-10 text-xl font-semibold text-[#081B33]">
              Adicionar integrante
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Equipe: {teamName}
            </p>

            <form
              action={formAction}
              className="mt-7 space-y-5"
            >
              <input
                type="hidden"
                name="team_id"
                value={teamId}
              />

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Integrante
                </label>

                <select
                  name="campaign_member_id"
                  required
                  defaultValue=""
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[#081B33]"
                >
                  <option value="" disabled>
                    Selecione uma pessoa
                  </option>

                  {availableMembers.map(
                    (member) => (
                      <option
                        key={member.id}
                        value={member.id}
                      >
                        {member.name}
                        {member.jobTitle
                          ? ` — ${member.jobTitle}`
                          : ""}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Função na equipe
                </label>

                <select
                  name="team_role"
                  defaultValue="member"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[#081B33]"
                >
                  <option value="member">
                    Integrante
                  </option>

                  <option value="leader">
                    Líder
                  </option>

                  <option value="coordinator">
                    Coordenador
                  </option>
                </select>
              </div>

              {availableMembers.length === 0 ? (
                <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  Todos os integrantes ativos da
                  campanha já estão nesta equipe.
                </div>
              ) : null}

              {state.message ? (
                <div
                  className={`rounded-xl px-4 py-3 text-sm ${
                    state.success
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {state.message}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={
                  pending ||
                  availableMembers.length === 0
                }
                className="h-12 w-full rounded-xl bg-[#081B33] text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending
                  ? "Adicionando..."
                  : "Adicionar integrante"}
              </button>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}