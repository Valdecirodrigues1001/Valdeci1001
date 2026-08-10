"use client";

import {
  useActionState,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import {
  Globe2,
  KeyRound,
  Loader2,
  Save,
  Search,
  Share2,
} from "lucide-react";

import {
  updateLandingSeo,
  type LandingPageActionState,
} from "../actions";

const initialState: LandingPageActionState = {
  success: false,
  message: "",
};

type SeoFormProps = {
  landingPage: {
    public_name: string;
    slug: string;
    seo_title: string | null;
    seo_description: string | null;
    seo_keywords: string | null;
    custom_domain: string | null;
  };
};

type SeoInputProps = {
  id: string;
  name: string;
  label: string;
  description: string;
  placeholder: string;
  defaultValue?: string | null;
  maxLength?: number;
  type?: "text" | "url";
};

function SeoInput({
  id,
  name,
  label,
  description,
  placeholder,
  defaultValue,
  maxLength,
  type = "text",
}: SeoInputProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-sm font-bold text-slate-800"
      >
        {label}
      </label>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>

      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue || ""}
        placeholder={placeholder}
        maxLength={maxLength}
        className="mt-3 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
      />
    </div>
  );
}

export default function SeoForm({
  landingPage,
}: SeoFormProps) {
  const router = useRouter();

  const [state, formAction, pending] = useActionState(
    updateLandingSeo,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  const defaultSeoTitle =
    landingPage.seo_title ||
    `${landingPage.public_name} | Site oficial`;

  const defaultSeoDescription =
    landingPage.seo_description ||
    `Conheça a trajetória, as propostas e as notícias de ${landingPage.public_name}.`;

  return (
    <form
      action={formAction}
      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
            <Search className="h-5 w-5 text-slate-700" />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Busca e compartilhamento
            </p>

            <h2 className="mt-1 text-xl font-black text-slate-950">
              SEO e domínio
            </h2>
          </div>
        </div>

        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-500">
          Configure como a página será apresentada no Google,
          WhatsApp, Facebook e outras plataformas.
        </p>
      </div>

      <div className="space-y-8 p-6 sm:p-8">
        <section>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
              <Share2 className="h-4 w-4 text-slate-600" />
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                Informações para busca
              </h3>

              <p className="text-xs text-slate-500">
                Título, descrição e palavras-chave da página.
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            <SeoInput
              id="seo_title"
              name="seo_title"
              label="Título SEO"
              description="Título apresentado nos resultados de busca. Recomendação: até 60 caracteres."
              placeholder={`${landingPage.public_name} | Site oficial`}
              defaultValue={landingPage.seo_title}
              maxLength={70}
            />

            <div>
              <label
                htmlFor="seo_description"
                className="text-sm font-bold text-slate-800"
              >
                Descrição SEO
              </label>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Resumo apresentado pelo Google e nas redes sociais.
                Recomendação: até 160 caracteres.
              </p>

              <textarea
                id="seo_description"
                name="seo_description"
                defaultValue={
                  landingPage.seo_description || ""
                }
                placeholder={defaultSeoDescription}
                maxLength={180}
                rows={4}
                className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              />
            </div>

            <SeoInput
              id="seo_keywords"
              name="seo_keywords"
              label="Palavras-chave"
              description="Separe as expressões por vírgulas."
              placeholder={`candidato, política, propostas, ${landingPage.public_name}`}
              defaultValue={landingPage.seo_keywords}
            />
          </div>
        </section>

        <section className="border-t border-slate-100 pt-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
              <Globe2 className="h-4 w-4 text-slate-600" />
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                Domínio personalizado
              </h3>

              <p className="text-xs text-slate-500">
                Endereço próprio para a Landing Page.
              </p>
            </div>
          </div>

          <SeoInput
            id="custom_domain"
            name="custom_domain"
            label="Domínio"
            description="Informe somente o domínio, sem https:// e sem barras."
            placeholder="nomedocandidato.com.br"
            defaultValue={landingPage.custom_domain}
            type="text"
          />

          <div className="mt-4 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />

            <p className="text-xs leading-5 text-amber-800">
              Salvar o domínio não configura automaticamente o DNS.
              Depois será necessário apontá-lo para a estrutura do
              Atlas 360.
            </p>
          </div>
        </section>

        <section className="border-t border-slate-100 pt-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Pré-visualização no Google
          </p>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
            <p className="truncate text-sm text-emerald-700">
              atlas360.com.br/c/{landingPage.slug}
            </p>

            <p className="mt-1 text-xl font-medium text-blue-700">
              {defaultSeoTitle}
            </p>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {defaultSeoDescription}
            </p>
          </div>
        </section>
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
                Salvar configurações
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}