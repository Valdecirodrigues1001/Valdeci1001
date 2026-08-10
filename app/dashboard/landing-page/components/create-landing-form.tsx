"use client";

import {
  useActionState,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Globe2,
  Loader2,
  Sparkles,
} from "lucide-react";

import {
  createLandingPage,
  type LandingPageActionState,
} from "../actions";

const initialState: LandingPageActionState = {
  success: false,
  message: "",
};

function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

type CreateLandingFormProps = {
  campaignName: string;
};

export default function CreateLandingForm({
  campaignName,
}: CreateLandingFormProps) {
  const router = useRouter();

  const [state, formAction, pending] = useActionState(
    createLandingPage,
    initialState
  );

  const [publicName, setPublicName] = useState(
    campaignName
  );

  const [slug, setSlug] = useState(
    createSlug(campaignName)
  );

  const [slugWasEdited, setSlugWasEdited] =
    useState(false);

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  function handlePublicNameChange(value: string) {
    setPublicName(value);

    if (!slugWasEdited) {
      setSlug(createSlug(value));
    }
  }

  return (
    <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-slate-950 p-8 text-white sm:p-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            <Sparkles className="h-6 w-6 text-amber-400" />
          </div>

          <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
            Configuração inicial
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight">
            Crie o site oficial da campanha
          </h2>

          <p className="mt-4 text-sm leading-7 text-slate-300">
            O Atlas 360 criará a estrutura inicial da página.
            Depois você poderá adicionar fotos, biografia,
            propostas, notícias, agenda e formulário de apoio.
          </p>

          <div className="mt-8 space-y-4">
            {[
              "Página pública exclusiva",
              "Painel autogerenciável",
              "Notícias e visitas",
              "Propostas e bandeiras",
              "Captação de apoiadores",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 text-sm text-slate-200"
              >
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <form
          action={formAction}
          className="p-8 sm:p-10"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Dados básicos
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Comece sua Landing Page
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Essas informações poderão ser alteradas depois.
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <div>
              <label
                htmlFor="public_name"
                className="text-sm font-bold text-slate-700"
              >
                Nome público do candidato
              </label>

              <input
                id="public_name"
                name="public_name"
                value={publicName}
                onChange={(event) =>
                  handlePublicNameChange(event.target.value)
                }
                placeholder="Ex.: Valdeci Rodrigues"
                required
                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
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

              <div className="mt-2 flex overflow-hidden rounded-2xl border border-slate-200 bg-white focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-100">
                <div className="flex items-center border-r border-slate-200 bg-slate-50 px-4 text-sm text-slate-500">
                  /c/
                </div>

                <input
                  id="slug"
                  name="slug"
                  value={slug}
                  onChange={(event) => {
                    setSlugWasEdited(true);
                    setSlug(
                      createSlug(event.target.value)
                    );
                  }}
                  placeholder="nome-do-candidato"
                  className="h-12 min-w-0 flex-1 px-4 text-sm text-slate-950 outline-none"
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
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
                  placeholder="Ex.: Deputado Federal"
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />
              </div>

              <div>
                <label
                  htmlFor="campaign_number"
                  className="text-sm font-bold text-slate-700"
                >
                  Número
                </label>

                <input
                  id="campaign_number"
                  name="campaign_number"
                  placeholder="Ex.: 1010"
                  inputMode="numeric"
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
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
                  placeholder="Ex.: Republicanos"
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />
              </div>

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
                  placeholder="Ex.: Cachoeirinha"
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />
              </div>
            </div>

            <input
              type="hidden"
              name="state"
              value="RS"
            />

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

            <button
              type="submit"
              disabled={pending}
              className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando Landing Page...
                </>
              ) : (
                <>
                  <Globe2 className="h-4 w-4" />
                  Criar Landing Page
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}