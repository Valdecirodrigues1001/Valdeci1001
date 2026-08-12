"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import type { CampaignModuleSettings } from "../types";
import { updateModuleSettings } from "../actions";

type ModulesSettingsFormProps = {
  modules: CampaignModuleSettings;
};

const moduleOptions: Array<{
  key: keyof CampaignModuleSettings;
  title: string;
  description: string;
}> = [
  {
    key: "supporters",
    title: "Apoiadores",
    description:
      "Permite cadastrar, organizar e acompanhar apoiadores da campanha.",
  },
  {
    key: "volunteers",
    title: "Voluntários",
    description:
      "Permite identificar e gerenciar pessoas interessadas em ajudar na campanha.",
  },
  {
    key: "leaders",
    title: "Lideranças",
    description:
      "Permite cadastrar lideranças e organizar sua atuação por cidade e região.",
  },
  {
    key: "events",
    title: "Agenda e eventos",
    description:
      "Ativa o gerenciamento de eventos, compromissos e agenda da campanha.",
  },
  {
    key: "news",
    title: "Notícias",
    description:
      "Permite publicar notícias e atualizações na Landing Page.",
  },
  {
    key: "proposals",
    title: "Propostas",
    description:
      "Ativa o cadastro e a publicação das propostas do candidato.",
  },
  {
    key: "gallery",
    title: "Galeria",
    description:
      "Permite publicar fotos e registros da campanha na Landing Page.",
  },
  {
    key: "materials",
    title: "Materiais",
    description:
      "Ativa a área de materiais digitais e arquivos da campanha.",
  },
  {
    key: "whatsapp_groups",
    title: "Grupos de WhatsApp",
    description:
      "Permite organizar grupos oficiais por cidade, região, categoria ou liderança.",
  },

];

export default function ModulesSettingsForm({
  modules,
}: ModulesSettingsFormProps) {
  const [isPending, startTransition] = useTransition();

  const [form, setForm] =
    useState<CampaignModuleSettings>(modules);

  function toggleModule(
    key: keyof CampaignModuleSettings
  ) {
    setForm((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    startTransition(async () => {
      const result =
        await updateModuleSettings(form);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-base font-semibold text-slate-950">
          Módulos da plataforma
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Defina quais recursos estarão disponíveis
          para a equipe da campanha.
        </p>
      </div>

      <div className="grid gap-4 p-6 md:grid-cols-2">
        {moduleOptions.map((module) => {
          const enabled = form[module.key];

          return (
            <div
              key={module.key}
              className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {module.title}
                  </h3>

                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      enabled
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {enabled
                      ? "Ativo"
                      : "Inativo"}
                  </span>
                </div>

                <p className="mt-1 max-w-md text-sm leading-5 text-slate-500">
                  {module.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  toggleModule(module.key)
                }
                aria-pressed={enabled}
                className={`relative mt-1 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
                  enabled
                    ? "bg-slate-950"
                    : "bg-slate-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    enabled
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-slate-200 px-6 py-4">
        <p className="text-xs text-slate-500">
          Os módulos desativados não devem ser
          exibidos para a equipe.
        </p>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending
            ? "Salvando..."
            : "Salvar módulos"}
        </button>
      </div>
    </form>
  );
}