"use client";

import {
  useActionState,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Loader2,
  Save,
  UserRound,
} from "lucide-react";

import {
  updateLandingMainInfo,
  type LandingPageActionState,
} from "../actions";

const initialState: LandingPageActionState = {
  success: false,
  message: "",
};

type LandingPageData = {
  public_name: string;
  slug: string;

  political_position: string | null;
  campaign_number: string | null;
  political_party: string | null;
  city: string | null;
  state: string | null;

  slogan: string | null;
  short_biography: string | null;
  biography: string | null;

  hero_title: string | null;
  hero_subtitle: string | null;

  support_cta_title: string | null;
  support_cta_description: string | null;
};

type GeneralFormProps = {
  landingPage: LandingPageData;
};

const inputClass =
  "mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100";

const textareaClass =
  "mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100";

export default function GeneralForm({
  landingPage,
}: GeneralFormProps) {
  const router = useRouter();

  const [state, formAction, pending] = useActionState(
    updateLandingMainInfo,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  return (
    <form
      action={formAction}
      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
            <UserRound className="h-5 w-5 text-slate-700" />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Informações principais
            </p>

            <h2 className="mt-1 text-xl font-black text-slate-950">
              Dados do candidato
            </h2>
          </div>
        </div>
      </div>

      <div className="space-y-8 p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="public_name"
              className="text-sm font-bold text-slate-700"
            >
              Nome público
            </label>

            <input
              id="public_name"
              name="public_name"
              defaultValue={landingPage.public_name}
              required
              className={inputClass}
            />

            {state.errors?.public_name && (
              <p className="mt-2 text-sm font-medium text-red-600">
                {state.errors.public_name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="slug"
              className="text-sm font-bold text-slate-700"
            >
              Endereço da página
            </label>

            <div className="mt-2 flex overflow-hidden rounded-2xl border border-slate-200 focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-100">
              <span className="flex items-center border-r border-slate-200 bg-slate-50 px-4 text-sm text-slate-500">
                /c/
              </span>

              <input
                id="slug"
                name="slug"
                defaultValue={landingPage.slug}
                className="h-12 min-w-0 flex-1 px-4 text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="political_position"
              className="text-sm font-bold text-slate-700"
            >
              Cargo disputado
            </label>

            <input
              id="political_position"
              name="political_position"
              defaultValue={
                landingPage.political_position || ""
              }
              placeholder="Ex.: Deputado Federal"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="campaign_number"
              className="text-sm font-bold text-slate-700"
            >
              Número da candidatura
            </label>

            <input
              id="campaign_number"
              name="campaign_number"
              defaultValue={
                landingPage.campaign_number || ""
              }
              inputMode="numeric"
              placeholder="Ex.: 1010"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="political_party"
              className="text-sm font-bold text-slate-700"
            >
              Partido
            </label>

            <input
              id="political_party"
              name="political_party"
              defaultValue={
                landingPage.political_party || ""
              }
              placeholder="Ex.: Republicanos"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-[1fr_100px] gap-3">
            <div>
              <label
                htmlFor="city"
                className="text-sm font-bold text-slate-700"
              >
                Cidade
              </label>

              <input
                id="city"
                name="city"
                defaultValue={landingPage.city || ""}
                placeholder="Cidade"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="state"
                className="text-sm font-bold text-slate-700"
              >
                Estado
              </label>

              <input
                id="state"
                name="state"
                defaultValue={landingPage.state || "RS"}
                maxLength={2}
                className={`${inputClass} uppercase`}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-8">
          <div className="mb-5 flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-400" />

            <h3 className="text-sm font-black uppercase tracking-[0.12em] text-slate-500">
              Apresentação da campanha
            </h3>
          </div>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="slogan"
                className="text-sm font-bold text-slate-700"
              >
                Slogan
              </label>

              <input
                id="slogan"
                name="slogan"
                defaultValue={landingPage.slogan || ""}
                placeholder="Ex.: Juntos por uma cidade melhor"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="hero_title"
                className="text-sm font-bold text-slate-700"
              >
                Título principal
              </label>

              <input
                id="hero_title"
                name="hero_title"
                defaultValue={
                  landingPage.hero_title || ""
                }
                placeholder="Título exibido na primeira seção"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="hero_subtitle"
                className="text-sm font-bold text-slate-700"
              >
                Subtítulo principal
              </label>

              <textarea
                id="hero_subtitle"
                name="hero_subtitle"
                defaultValue={
                  landingPage.hero_subtitle || ""
                }
                rows={3}
                placeholder="Uma breve mensagem apresentada ao eleitor."
                className={textareaClass}
              />
            </div>

            <div>
              <label
                htmlFor="short_biography"
                className="text-sm font-bold text-slate-700"
              >
                Biografia resumida
              </label>

              <textarea
                id="short_biography"
                name="short_biography"
                defaultValue={
                  landingPage.short_biography || ""
                }
                rows={4}
                placeholder="Resumo da trajetória do candidato."
                className={textareaClass}
              />
            </div>

            <div>
              <label
                htmlFor="biography"
                className="text-sm font-bold text-slate-700"
              >
                Biografia completa
              </label>

              <textarea
                id="biography"
                name="biography"
                defaultValue={landingPage.biography || ""}
                rows={9}
                placeholder="Conte a história, trajetória, experiências e motivações do candidato."
                className={textareaClass}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-8">
          <h3 className="text-sm font-black uppercase tracking-[0.12em] text-slate-500">
            Chamada para apoio
          </h3>

          <div className="mt-5 space-y-5">
            <div>
              <label
                htmlFor="support_cta_title"
                className="text-sm font-bold text-slate-700"
              >
                Título
              </label>

              <input
                id="support_cta_title"
                name="support_cta_title"
                defaultValue={
                  landingPage.support_cta_title || ""
                }
                placeholder="Ex.: Faça parte desta caminhada"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="support_cta_description"
                className="text-sm font-bold text-slate-700"
              >
                Descrição
              </label>

              <textarea
                id="support_cta_description"
                name="support_cta_description"
                defaultValue={
                  landingPage.support_cta_description || ""
                }
                rows={3}
                placeholder="Convide os visitantes a apoiar ou participar da campanha."
                className={textareaClass}
              />
            </div>
          </div>
        </div>

        {state.message && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
              state.success
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {state.message}
          </div>
        )}
      </div>

      <div className="flex justify-end border-t border-slate-100 bg-slate-50 px-6 py-5 sm:px-8">
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
              Salvar informações
            </>
          )}
        </button>
      </div>
    </form>
  );
}