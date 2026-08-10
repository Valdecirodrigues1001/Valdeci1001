"use client";

import {
  useActionState,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Eye,
  LayoutTemplate,
  Loader2,
  Palette,
  Save,
} from "lucide-react";

import {
  updateLandingAppearance,
  type LandingPageActionState,
} from "../actions";

const initialState: LandingPageActionState = {
  success: false,
  message: "",
};

type AppearanceFormProps = {
  landingPage: {
    public_name: string;
    political_position: string | null;
    campaign_number: string | null;
    slogan: string | null;
    hero_title: string | null;
    hero_subtitle: string | null;

    primary_color: string;
    secondary_color: string;
    accent_color: string;
    background_color: string;
    text_color: string;

    show_about: boolean;
    show_proposals: boolean;
    show_news: boolean;
    show_agenda: boolean;
    show_gallery: boolean;
    show_support_form: boolean;
    show_social_links: boolean;
  };
};

type SectionField =
  | "show_about"
  | "show_proposals"
  | "show_news"
  | "show_agenda"
  | "show_gallery"
  | "show_support_form"
  | "show_social_links";

type VisibilityState = Record<SectionField, boolean>;

type ColorState = {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
};

const colorFields: Array<{
  name: keyof ColorState;
  label: string;
  description: string;
}> = [
  {
    name: "primary_color",
    label: "Cor principal",
    description: "Cabeçalho, botões e áreas de destaque.",
  },
  {
    name: "secondary_color",
    label: "Cor secundária",
    description: "Detalhes, ícones e elementos complementares.",
  },
  {
    name: "accent_color",
    label: "Cor de contraste",
    description: "Textos e elementos sobre fundos escuros.",
  },
  {
    name: "background_color",
    label: "Fundo da página",
    description: "Cor geral de fundo do site.",
  },
  {
    name: "text_color",
    label: "Cor dos textos",
    description: "Textos principais da página.",
  },
];

const sectionFields: Array<{
  name: SectionField;
  label: string;
  description: string;
}> = [
  {
    name: "show_about",
    label: "Sobre o candidato",
    description: "Exibe a trajetória e a biografia.",
  },
  {
    name: "show_proposals",
    label: "Propostas e bandeiras",
    description: "Exibe as principais propostas da campanha.",
  },
  {
    name: "show_news",
    label: "Notícias e visitas",
    description: "Exibe conteúdos publicados no site.",
  },
  {
    name: "show_agenda",
    label: "Agenda pública",
    description: "Exibe compromissos e eventos públicos.",
  },
  {
    name: "show_gallery",
    label: "Galeria de fotos",
    description: "Exibe fotos de ações e eventos.",
  },
  {
    name: "show_support_form",
    label: "Formulário de apoio",
    description: "Permite captar novos apoiadores.",
  },
  {
    name: "show_social_links",
    label: "Redes sociais",
    description: "Exibe os links sociais do candidato.",
  },
];

function normalizeColor(value: string) {
  const trimmedValue = value.trim();

  if (/^#[0-9A-Fa-f]{6}$/.test(trimmedValue)) {
    return trimmedValue.toUpperCase();
  }

  return trimmedValue;
}

export default function AppearanceForm({
  landingPage,
}: AppearanceFormProps) {
  const router = useRouter();

  const [state, formAction, pending] = useActionState(
    updateLandingAppearance,
    initialState
  );

  const [colors, setColors] = useState<ColorState>({
    primary_color: landingPage.primary_color,
    secondary_color: landingPage.secondary_color,
    accent_color: landingPage.accent_color,
    background_color: landingPage.background_color,
    text_color: landingPage.text_color,
  });

  const [visibility, setVisibility] =
    useState<VisibilityState>({
      show_about: landingPage.show_about,
      show_proposals: landingPage.show_proposals,
      show_news: landingPage.show_news,
      show_agenda: landingPage.show_agenda,
      show_gallery: landingPage.show_gallery,
      show_support_form: landingPage.show_support_form,
      show_social_links: landingPage.show_social_links,
    });

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  function updateColor(
    field: keyof ColorState,
    value: string
  ) {
    setColors((current) => ({
      ...current,
      [field]: normalizeColor(value),
    }));
  }

  function toggleVisibility(field: SectionField) {
    setVisibility((current) => ({
      ...current,
      [field]: !current[field],
    }));
  }

  return (
    <form action={formAction} className="space-y-8">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
              <Palette className="h-5 w-5 text-slate-700" />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Identidade visual
              </p>

              <h2 className="mt-1 text-xl font-black text-slate-950">
                Cores da Landing Page
              </h2>
            </div>
          </div>
        </div>

        <div className="grid gap-8 p-6 sm:p-8 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-5">
            {colorFields.map((field) => (
              <div
                key={field.name}
                className="rounded-2xl border border-slate-200 p-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <input
                    type="color"
                    value={colors[field.name]}
                    onChange={(event) =>
                      updateColor(
                        field.name,
                        event.target.value
                      )
                    }
                    className="h-14 w-16 cursor-pointer rounded-xl border border-slate-200 bg-white p-1"
                    aria-label={field.label}
                  />

                  <div className="min-w-0 flex-1">
                    <label
                      htmlFor={field.name}
                      className="text-sm font-bold text-slate-800"
                    >
                      {field.label}
                    </label>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {field.description}
                    </p>
                  </div>

                  <input
                    id={field.name}
                    name={field.name}
                    value={colors[field.name]}
                    onChange={(event) =>
                      updateColor(
                        field.name,
                        event.target.value
                      )
                    }
                    maxLength={7}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold uppercase outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 sm:w-28"
                  />
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="sticky top-6 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 p-4">
              <div className="mb-4 flex items-center gap-2">
                <Eye className="h-4 w-4 text-slate-500" />

                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  Prévia visual
                </p>
              </div>

              <div
                className="overflow-hidden rounded-2xl shadow-lg"
                style={{
                  backgroundColor:
                    colors.background_color,
                }}
              >
                <header
                  className="flex items-center justify-between px-5 py-4"
                  style={{
                    backgroundColor:
                      colors.primary_color,
                    color: colors.accent_color,
                  }}
                >
                  <div>
                    <p className="text-sm font-black">
                      {landingPage.public_name}
                    </p>

                    <p className="mt-0.5 text-[10px] opacity-75">
                      {landingPage.political_position ||
                        "Candidato"}
                    </p>
                  </div>

                  {landingPage.campaign_number && (
                    <span
                      className="rounded-lg px-3 py-1 text-sm font-black"
                      style={{
                        backgroundColor:
                          colors.secondary_color,
                        color: colors.primary_color,
                      }}
                    >
                      {landingPage.campaign_number}
                    </span>
                  )}
                </header>

                <section className="px-5 py-10">
                  <span
                    className="inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase"
                    style={{
                      backgroundColor:
                        colors.secondary_color,
                      color: colors.primary_color,
                    }}
                  >
                    {landingPage.slogan ||
                      "Uma nova história"}
                  </span>

                  <h3
                    className="mt-4 text-2xl font-black leading-tight"
                    style={{
                      color: colors.text_color,
                    }}
                  >
                    {landingPage.hero_title ||
                      landingPage.public_name}
                  </h3>

                  <p
                    className="mt-3 text-xs leading-5 opacity-70"
                    style={{
                      color: colors.text_color,
                    }}
                  >
                    {landingPage.hero_subtitle ||
                      "Mensagem principal da campanha apresentada ao eleitor."}
                  </p>

                  <button
                    type="button"
                    className="mt-5 rounded-xl px-4 py-2 text-xs font-bold"
                    style={{
                      backgroundColor:
                        colors.primary_color,
                      color: colors.accent_color,
                    }}
                  >
                    Conheça nossas propostas
                  </button>
                </section>

                <div className="grid grid-cols-3 gap-2 px-5 pb-5">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="h-14 rounded-xl"
                      style={{
                        backgroundColor:
                          colors.primary_color,
                        opacity: 0.08 + item * 0.03,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
              <LayoutTemplate className="h-5 w-5 text-slate-700" />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Estrutura
              </p>

              <h2 className="mt-1 text-xl font-black text-slate-950">
                Seções visíveis
              </h2>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
          {sectionFields.map((section) => {
            const enabled = visibility[section.name];

            return (
              <label
                key={section.name}
                className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition ${
                  enabled
                    ? "border-slate-300 bg-slate-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <input
                  type="checkbox"
                  name={section.name}
                  checked={enabled}
                  onChange={() =>
                    toggleVisibility(section.name)
                  }
                  className="sr-only"
                />

                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition ${
                    enabled
                      ? "bg-slate-950 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {enabled ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <LayoutTemplate className="h-5 w-5" />
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-slate-800">
                    {section.label}
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    {section.description}
                  </span>
                </span>

                <span
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                    enabled
                      ? "bg-slate-950"
                      : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                      enabled
                        ? "left-6"
                        : "left-1"
                    }`}
                  />
                </span>
              </label>
            );
          })}
        </div>

        <div className="border-t border-slate-100 bg-slate-50 px-6 py-5 sm:px-8">
          {state.message && (
            <div
              className={`mb-4 rounded-2xl border px-4 py-3 text-sm font-medium ${
                state.success
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {state.message}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pending}
              className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar aparência
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}