import {
  CalendarDays,
  Handshake,
  UserPlus,
} from "lucide-react";
import Link from "next/link";

export type RecentActivity = {
  id: string;
  type: "supporter" | "leader" | "event";
  title: string;
  description: string;
  createdAt: string;
  href: string;
};

type RecentActivitiesProps = {
  activities: RecentActivity[];
};

const activitySettings = {
  supporter: {
    icon: UserPlus,
    label: "Novo apoiador",
    iconClass: "bg-blue-50 text-blue-700",
  },
  leader: {
    icon: Handshake,
    label: "Nova liderança",
    iconClass: "bg-amber-50 text-amber-700",
  },
  event: {
    icon: CalendarDays,
    label: "Novo compromisso",
    iconClass: "bg-emerald-50 text-emerald-700",
  },
};

function formatActivityDate(value: string) {
  const date = new Date(value);
  const now = new Date();

  const differenceInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / 60000
  );

  if (differenceInMinutes < 1) {
    return "Agora";
  }

  if (differenceInMinutes < 60) {
    return `Há ${differenceInMinutes} min`;
  }

  const differenceInHours = Math.floor(
    differenceInMinutes / 60
  );

  if (differenceInHours < 24) {
    return differenceInHours === 1
      ? "Há 1 hora"
      : `Há ${differenceInHours} horas`;
  }

  const differenceInDays = Math.floor(
    differenceInHours / 24
  );

  if (differenceInDays < 7) {
    return differenceInDays === 1
      ? "Há 1 dia"
      : `Há ${differenceInDays} dias`;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function RecentActivities({
  activities,
}: RecentActivitiesProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div>
        <p className="text-sm font-medium text-slate-500">
          Atividades recentes
        </p>

        <h2 className="mt-1 text-xl font-semibold text-[#081B33]">
          Movimentação da campanha
        </h2>
      </div>

      {activities.length === 0 ? (
        <div className="mt-10 flex min-h-52 flex-col items-center justify-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <UserPlus size={25} />
          </div>

          <p className="mt-4 font-medium text-slate-700">
            Nenhuma atividade registrada
          </p>

          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
            Novos apoiadores, lideranças e compromissos
            aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="mt-7 divide-y divide-slate-100">
          {activities.map((activity) => {
            const settings =
              activitySettings[activity.type];

            const Icon = settings.icon;

            return (
              <Link
                key={`${activity.type}-${activity.id}`}
                href={activity.href}
                className="group flex items-start gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${settings.iconClass}`}
                >
                  <Icon size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {settings.label}
                    </p>

                    <span className="text-xs text-slate-400">
                      {formatActivityDate(
                        activity.createdAt
                      )}
                    </span>
                  </div>

                  <p className="mt-1 truncate font-semibold text-[#081B33] transition group-hover:text-[#D4AF37]">
                    {activity.title}
                  </p>

                  <p className="mt-1 truncate text-sm text-slate-500">
                    {activity.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </article>
  );
}