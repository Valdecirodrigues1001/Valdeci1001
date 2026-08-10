import {
  Globe2,
  LayoutTemplate,
} from "lucide-react";

type LandingHeaderProps = {
  campaignName: string;
  hasLandingPage: boolean;
};

export default function LandingHeader({
  campaignName,
  hasLandingPage,
}: LandingHeaderProps) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold text-amber-600">
          <Globe2 className="h-4 w-4" />

          Site oficial da campanha
        </div>

        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Landing Page
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Gerencie o site público de{" "}
          <span className="font-semibold text-slate-700">
            {campaignName}
          </span>
          , publique conteúdos e mantenha os eleitores atualizados.
        </p>
      </div>

      <div className="inline-flex w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
        <LayoutTemplate className="h-4 w-4 text-slate-400" />

        {hasLandingPage
          ? "Página configurada"
          : "Configuração inicial"}
      </div>
    </header>
  );
}