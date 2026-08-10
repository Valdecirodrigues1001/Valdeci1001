import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock3,
  ExternalLink,
  MapPin,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  completeEventFollowUp,
  reopenEventFollowUp,
} from "../actions";

type FollowUpPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

function formatDate(value: string | null) {
  if (!value) {
    return "Sem prazo definido";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function isOverdue(value: string | null) {
  if (!value) {
    return false;
  }

  const dueDate = new Date(`${value}T23:59:59`);
  return dueDate.getTime() < Date.now();
}

export default async function FollowUpsPage({
  searchParams,
}: FollowUpPageProps) {
  const filters = await searchParams;
  const selectedStatus =
    filters.status === "completed"
      ? "completed"
      : "pending";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership } = await supabase
    .from("campaign_members")
    .select("campaign_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    redirect("/login");
  }

  let query = supabase
    .from("campaign_events")
    .select(`
      id,
      title,
      city,
      neighborhood,
      location_name,
      start_at,
      follow_up_notes,
      follow_up_due_date,
      follow_up_completed_at
    `)
    .eq("campaign_id", membership.campaign_id)
    .eq("follow_up_required", true);

  if (selectedStatus === "completed") {
    query = query.not(
      "follow_up_completed_at",
      "is",
      null
    );
  } else {
    query = query.is(
      "follow_up_completed_at",
      null
    );
  }

  const { data: followUpsData, error } = await query
    .order("follow_up_due_date", {
      ascending: true,
      nullsFirst: false,
    })
    .order("start_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Erro ao carregar acompanhamentos:",
      error
    );
  }

  const followUps = followUpsData ?? [];

  const overdueCount = followUps.filter(
    (item) =>
      !item.follow_up_completed_at &&
      isOverdue(item.follow_up_due_date)
  ).length;

  return (
    <main className="px-5 pb-12 pt-20 sm:px-8 lg:px-10 lg:pt-10">
      <div className="mx-auto max-w-[1200px]">
        <Link
          href="/dashboard/agenda"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#081B33]"
        >
          <ArrowLeft size={18} />
          Voltar para agenda
        </Link>

        <header className="mt-6 rounded-3xl bg-[#081B33] p-6 text-white sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#D4AF37]">
                Organização da campanha
              </p>

              <h1 className="mt-3 text-3xl font-semibold">
                Acompanhamentos
              </h1>

              <p className="mt-3 max-w-2xl leading-7 text-white/60">
                Controle os retornos, providências e contatos
                que precisam ser realizados após os
                compromissos.
              </p>
            </div>

            {selectedStatus === "pending" ? (
              <div className="rounded-2xl bg-white/10 px-5 py-4">
                <p className="text-sm text-white/60">
                  Pendências atrasadas
                </p>

                <p className="mt-1 text-3xl font-semibold text-[#D4AF37]">
                  {overdueCount}
                </p>
              </div>
            ) : null}
          </div>
        </header>

        <nav className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/dashboard/agenda/acompanhamentos?status=pending"
            className={`inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold transition ${
              selectedStatus === "pending"
                ? "bg-[#081B33] text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Pendentes
          </Link>

          <Link
            href="/dashboard/agenda/acompanhamentos?status=completed"
            className={`inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold transition ${
              selectedStatus === "completed"
                ? "bg-[#081B33] text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Concluídos
          </Link>
        </nav>

        {followUps.length === 0 ? (
          <section className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <CheckCircle2
              size={38}
              className="mx-auto text-emerald-500"
            />

            <h2 className="mt-4 text-xl font-semibold text-[#081B33]">
              {selectedStatus === "pending"
                ? "Nenhum acompanhamento pendente"
                : "Nenhum acompanhamento concluído"}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {selectedStatus === "pending"
                ? "Todas as providências estão em dia."
                : "Os acompanhamentos concluídos aparecerão aqui."}
            </p>
          </section>
        ) : (
          <section className="mt-6 space-y-4">
            {followUps.map((followUp) => {
              const overdue =
                !followUp.follow_up_completed_at &&
                isOverdue(followUp.follow_up_due_date);

              const location = [
                followUp.location_name,
                followUp.neighborhood,
                followUp.city,
              ]
                .filter(Boolean)
                .join(" — ");

              const followUpAction =
                selectedStatus === "completed"
                  ? reopenEventFollowUp.bind(
                      null,
                      followUp.id
                    )
                  : completeEventFollowUp.bind(
                      null,
                      followUp.id
                    );

              return (
                <article
                  key={followUp.id}
                  className={`rounded-3xl border bg-white p-6 shadow-sm ${
                    overdue
                      ? "border-red-200"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            followUp.follow_up_completed_at
                              ? "bg-emerald-50 text-emerald-700"
                              : overdue
                                ? "bg-red-50 text-red-700"
                                : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {followUp.follow_up_completed_at
                            ? "Concluído"
                            : overdue
                              ? "Atrasado"
                              : "Pendente"}
                        </span>

                        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                          <CalendarClock size={14} />
                          {formatDate(
                            followUp.follow_up_due_date
                          )}
                        </span>
                      </div>

                      <h2 className="mt-4 text-xl font-semibold text-[#081B33]">
                        {followUp.title}
                      </h2>

                      {followUp.follow_up_notes ? (
                        <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                          {followUp.follow_up_notes}
                        </p>
                      ) : null}

                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-400">
                        {location ? (
                          <span className="inline-flex items-center gap-2">
                            <MapPin size={16} />
                            {location}
                          </span>
                        ) : null}

                        <span className="inline-flex items-center gap-2">
                          <Clock3 size={16} />
                          Compromisso realizado em{" "}
                          {new Intl.DateTimeFormat("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          }).format(
                            new Date(followUp.start_at)
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
                      <Link
                        href={`/dashboard/agenda/${followUp.id}`}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-[#081B33] transition hover:bg-slate-50"
                      >
                        <ExternalLink size={17} />
                        Ver compromisso
                      </Link>

                      <form action={followUpAction}>
                        <button
                          type="submit"
                          className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white transition ${
                            selectedStatus === "completed"
                              ? "bg-slate-500 hover:bg-slate-600"
                              : "bg-emerald-600 hover:bg-emerald-700"
                          }`}
                        >
                          {selectedStatus ===
                          "completed" ? (
                            <>
                              <RotateCcw size={17} />
                              Reabrir
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={17} />
                              Marcar como concluído
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}