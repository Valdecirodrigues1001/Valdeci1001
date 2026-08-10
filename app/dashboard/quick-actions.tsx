import {
  ArrowRight,
  CalendarPlus,
  CheckCircle2,
  Handshake,
  UserPlus,
} from "lucide-react";
import Link from "next/link";

type QuickActionsProps = {
  pendingFollowUps: number;
  overdueFollowUps: number;
};

const actions = [
  {
    title: "Cadastrar apoiador",
    description: "Adicione uma nova pessoa à base da campanha.",
    href: "/dashboard/apoiadores",
    icon: UserPlus,
  },
  {
    title: "Organizar lideranças",
    description: "Cadastre e acompanhe as lideranças da campanha.",
    href: "/dashboard/liderancas",
    icon: Handshake,
  },
  {
    title: "Criar compromisso",
    description: "Adicione uma reunião, visita ou evento à agenda.",
    href: "/dashboard/agenda",
    icon: CalendarPlus,
  },
];

export function QuickActions({
  pendingFollowUps,
  overdueFollowUps,
}: QuickActionsProps) {
  return (
    <article className="rounded-3xl bg-[#081B33] p-6 text-white shadow-sm sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#D4AF37]">
        Ações rápidas
      </p>

      <h2 className="mt-3 text-2xl font-semibold">
        Continue estruturando a campanha.
      </h2>

      <p className="mt-3 leading-7 text-white/65">
        Acesse rapidamente as principais áreas de gestão.
      </p>

      <div className="mt-7 space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className="group flex items-center gap-4 rounded-2xl bg-white/10 p-4 transition hover:bg-white/15"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#D4AF37]">
                <Icon size={21} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {action.title}
                </p>

                <p className="mt-1 text-sm leading-5 text-white/55">
                  {action.description}
                </p>
              </div>

              <ArrowRight
                size={18}
                className="shrink-0 text-white/35 transition group-hover:translate-x-1 group-hover:text-white"
              />
            </Link>
          );
        })}
      </div>

      <Link
        href="/dashboard/agenda/acompanhamentos"
        className={`mt-4 flex items-center gap-4 rounded-2xl border p-4 transition ${
          overdueFollowUps > 0
            ? "border-red-400/40 bg-red-500/15 hover:bg-red-500/20"
            : "border-white/10 bg-white/5 hover:bg-white/10"
        }`}
      >
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            overdueFollowUps > 0
              ? "bg-red-500/20 text-red-200"
              : "bg-white/10 text-[#D4AF37]"
          }`}
        >
          <CheckCircle2 size={21} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">
              Acompanhamentos
            </p>

            {pendingFollowUps > 0 ? (
              <span className="rounded-full bg-[#D4AF37] px-2.5 py-1 text-xs font-bold text-[#081B33]">
                {pendingFollowUps}
              </span>
            ) : null}
          </div>

          <p className="mt-1 text-sm text-white/55">
            {overdueFollowUps > 0
              ? `${overdueFollowUps} retorno${
                  overdueFollowUps === 1 ? "" : "s"
                } com prazo vencido.`
              : pendingFollowUps > 0
                ? `${pendingFollowUps} acompanhamento${
                    pendingFollowUps === 1 ? "" : "s"
                  } aguardando conclusão.`
                : "Nenhum acompanhamento pendente."}
          </p>
        </div>

        <ArrowRight
          size={18}
          className="shrink-0 text-white/35"
        />
      </Link>
    </article>
  );
}