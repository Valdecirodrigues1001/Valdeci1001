import {
  CalendarClock,
  CircleCheck,
  CircleDashed,
} from "lucide-react";

import PublishButton from "./publish-button";

type LandingStatusCardProps = {
  isPublished: boolean;
  publishedAt: string | null;
  updatedAt: string;
};

function formatDate(date: string | null) {
  if (!date) {
    return "Ainda não publicada";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export default function LandingStatusCard({
  isPublished,
  publishedAt,
  updatedAt,
}: LandingStatusCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Status atual
          </p>

          <div className="mt-3 flex items-center gap-2">
            {isPublished ? (
              <CircleCheck className="h-5 w-5 text-emerald-600" />
            ) : (
              <CircleDashed className="h-5 w-5 text-amber-600" />
            )}

            <h2 className="text-xl font-black text-slate-950">
              {isPublished
                ? "Página publicada"
                : "Página em rascunho"}
            </h2>
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            isPublished
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {isPublished ? "No ar" : "Privada"}
        </span>
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
        <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

        <div>
          <p className="text-xs font-semibold text-slate-400">
            {isPublished
              ? "Publicada em"
              : "Última atualização"}
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-700">
            {formatDate(
              isPublished ? publishedAt : updatedAt
            )}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <PublishButton isPublished={isPublished} />
      </div>
    </div>
  );
}