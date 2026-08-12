import { Settings } from "lucide-react";

export default function SettingsHeader() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-white shadow-sm">
          <Settings className="h-5 w-5 text-slate-700" />
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            Configurações
          </h1>

          <p className="text-sm text-slate-500">
            Gerencie as configurações gerais da campanha e da plataforma.
          </p>
        </div>
      </div>
    </div>
  );
}