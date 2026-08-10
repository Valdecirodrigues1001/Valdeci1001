"use client";

import Link from "next/link";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  Accessibility,
  Award,
  Bike,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  Bus,
  Cpu,
  FileText,
  Flag,
  GraduationCap,
  HandHeart,
  HardHat,
  Hash,
  HeartPulse,
  Landmark,
  Leaf,
  Loader2,
  Map,
  Palette,
  Save,
  ShieldCheck,
  Sparkles,
  Sprout,
  Tag,
  TreePine,
  Trophy,
  Users,
  Venus,
  Wheat,
  X,
} from "lucide-react";

import {
  RichTextEditor,
  type RichTextValue,
} from "@/components/editor";

import {
  createProposal,
  updateProposal,
  type ProposalActionState,
} from "../actions";

export type ProposalFormData = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  summary: string | null;
  content: string | null;
  icon: string | null;
  display_order: number;
  is_featured: boolean;
  is_published: boolean;
};

type ProposalFormProps = {
  proposal?: ProposalFormData | null;
};

const initialState: ProposalActionState = {
  success: false,
  message: "",
};

function createEmptyDocument(): RichTextValue {
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
      },
    ],
  };
}

const categories = [
  "Saúde",
  "Educação",
  "Segurança",
  "Agricultura",
  "Infraestrutura",
  "Economia",
  "Empreendedorismo",
  "Turismo",
  "Esporte",
  "Cultura",
  "Assistência Social",
  "Meio Ambiente",
  "Mobilidade",
  "Tecnologia",
  "Juventude",
  "Mulher",
  "Idoso",
];

const iconOptions = [
  {
    value: "heart-pulse",
    label: "Saúde",
    icon: HeartPulse,
  },
  {
    value: "graduation-cap",
    label: "Educação",
    icon: GraduationCap,
  },
  {
    value: "shield-check",
    label: "Segurança",
    icon: ShieldCheck,
  },
  {
    value: "wheat",
    label: "Agricultura",
    icon: Wheat,
  },
  {
    value: "hard-hat",
    label: "Infraestrutura",
    icon: HardHat,
  },
  {
    value: "landmark",
    label: "Economia",
    icon: Landmark,
  },
  {
    value: "briefcase-business",
    label: "Empreendedorismo",
    icon: BriefcaseBusiness,
  },
  {
    value: "map",
    label: "Turismo",
    icon: Map,
  },
  {
    value: "trophy",
    label: "Esporte",
    icon: Trophy,
  },
  {
    value: "palette",
    label: "Cultura",
    icon: Palette,
  },
  {
    value: "hand-heart",
    label: "Assistência",
    icon: HandHeart,
  },
  {
    value: "leaf",
    label: "Meio ambiente",
    icon: Leaf,
  },
  {
    value: "bus",
    label: "Mobilidade",
    icon: Bus,
  },
  {
    value: "cpu",
    label: "Tecnologia",
    icon: Cpu,
  },
  {
    value: "users",
    label: "Juventude",
    icon: Users,
  },
  {
    value: "venus",
    label: "Mulher",
    icon: Venus,
  },
  {
    value: "accessibility",
    label: "Idoso",
    icon: Accessibility,
  },
  {
    value: "tree-pine",
    label: "Sustentabilidade",
    icon: TreePine,
  },
  {
    value: "building-2",
    label: "Desenvolvimento",
    icon: Building2,
  },
  {
    value: "sprout",
    label: "Campo",
    icon: Sprout,
  },
  {
    value: "bike",
    label: "Lazer",
    icon: Bike,
  },
  {
    value: "book-open",
    label: "Conhecimento",
    icon: BookOpen,
  },
];

function parseProposalContent(
  content: string | null | undefined
): RichTextValue {
  if (!content?.trim()) {
    return createEmptyDocument();
  }

  try {
    const parsedContent: unknown =
      JSON.parse(content);

    if (
      typeof parsedContent === "object" &&
      parsedContent !== null &&
      "type" in parsedContent &&
      parsedContent.type === "doc"
    ) {
      return parsedContent as RichTextValue;
    }
  } catch {
    /*
     * Conteúdo antigo salvo como texto simples.
     * Converte para o formato utilizado pelo TipTap.
     */
  }

  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: content,
          },
        ],
      },
    ],
  };
}

export default function ProposalForm({
  proposal = null,
}: ProposalFormProps) {
  const router = useRouter();

  const formRef =
    useRef<HTMLFormElement>(null);

  const [formVersion, setFormVersion] =
    useState(0);

  const [content, setContent] =
    useState<RichTextValue>(() =>
      parseProposalContent(
        proposal?.content
      )
    );

  const [
    selectedIcon,
    setSelectedIcon,
  ] = useState(
    proposal?.icon ?? ""
  );

  const isEditing =
    Boolean(proposal?.id);

  /*
   * Mantém o modo atual em uma referência.
   * Isso evita colocar isEditing nas dependências
   * do efeito de sucesso e impedir que o ?edit=
   * seja removido imediatamente ao abrir uma proposta.
   */
  const isEditingRef =
    useRef(isEditing);

  useEffect(() => {
    isEditingRef.current =
      isEditing;
  }, [isEditing]);

  const action =
    isEditing && proposal
      ? updateProposal.bind(
          null,
          proposal.id
        )
      : createProposal;

  const [
    state,
    formAction,
    pending,
  ] = useActionState(
    action,
    initialState
  );

  /*
   * Atualiza o conteúdo controlado quando
   * uma proposta é aberta para edição ou
   * quando o formulário volta ao modo de criação.
   */
  useEffect(() => {
    setContent(
      parseProposalContent(
        proposal?.content
      )
    );

    setSelectedIcon(
      proposal?.icon ?? ""
    );
  }, [
    proposal?.id,
    proposal?.content,
    proposal?.icon,
  ]);

  /*
   * Executa somente quando uma nova resposta
   * da Server Action é recebida.
   *
   * Não depende de isEditing, evitando que
   * o efeito seja disparado apenas ao clicar
   * no botão de editar.
   */
  useEffect(() => {
    if (!state.success) {
      return;
    }

    const wasEditing =
      isEditingRef.current;

    if (wasEditing) {
      router.replace(
        "/dashboard/propostas"
      );

      router.refresh();

      return;
    }

    /*
     * Limpa os campos HTML comuns.
     */
    formRef.current?.reset();

    /*
     * Limpa os estados controlados.
     */
    setContent(
      createEmptyDocument()
    );

    setSelectedIcon("");

    /*
     * Recria o formulário e restaura
     * todos os valores padrão.
     */
    setFormVersion(
      (currentVersion) =>
        currentVersion + 1
    );

    router.refresh();
  }, [router, state]);

  const serializedContent =
    JSON.stringify(
      content ??
        createEmptyDocument()
    );

  return (
    <form
      key={
        proposal?.id
          ? `edit-${proposal.id}`
          : `new-proposal-${formVersion}`
      }
      ref={formRef}
      action={formAction}
      className="h-fit overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-100 px-6 py-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
              <Flag className="h-5 w-5 text-slate-700" />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                {isEditing
                  ? "Gerenciar conteúdo"
                  : "Novo conteúdo"}
              </p>

              <h2 className="mt-1 text-xl font-black text-slate-950">
                {isEditing
                  ? "Editar proposta"
                  : "Nova proposta"}
              </h2>
            </div>
          </div>

          {isEditing ? (
            <Link
              href="/dashboard/propostas"
              aria-label="Cancelar edição"
              title="Cancelar edição"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
            >
              <X className="h-4 w-4" />
            </Link>
          ) : null}
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-500">
          {isEditing
            ? "Atualize as informações da proposta selecionada."
            : "Cadastre uma proposta ou bandeira para exibição na página pública da campanha."}
        </p>

        {isEditing &&
        proposal?.slug ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Endereço da proposta
            </p>

            <p className="mt-1 break-all font-mono text-xs text-slate-600">
              /{proposal.slug}
            </p>
          </div>
        ) : null}
      </div>

      <div className="space-y-6 p-6">
        <div>
          <label
            htmlFor="title"
            className="text-sm font-bold text-slate-800"
          >
            Título da proposta
          </label>

          <div className="relative mt-2">
            <FileText className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              id="title"
              name="title"
              type="text"
              required
              minLength={3}
              maxLength={150}
              defaultValue={
                proposal?.title ?? ""
              }
              placeholder="Ex.: Ampliação do atendimento básico"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />
          </div>

          {state.errors?.title ? (
            <p className="mt-2 text-xs font-medium text-red-600">
              {state.errors.title}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="category"
            className="text-sm font-bold text-slate-800"
          >
            Categoria
          </label>

          <div className="relative mt-2">
            <Tag className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <select
              id="category"
              name="category"
              defaultValue={
                proposal?.category ?? ""
              }
              className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-white pl-11 pr-10 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            >
              <option value="">
                Selecione uma categoria
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="summary"
            className="text-sm font-bold text-slate-800"
          >
            Resumo
          </label>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Texto curto apresentado nos
            cards da Landing Page.
          </p>

          <textarea
            id="summary"
            name="summary"
            rows={3}
            maxLength={500}
            defaultValue={
              proposal?.summary ?? ""
            }
            placeholder="Explique brevemente o objetivo da proposta."
            className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
          />

          {state.errors?.summary ? (
            <p className="mt-2 text-xs font-medium text-red-600">
              {state.errors.summary}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="proposal-content"
            className="text-sm font-bold text-slate-800"
          >
            Conteúdo completo
          </label>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Detalhe o problema, a solução
            e os resultados esperados.
          </p>

          <input
            id="proposal-content"
            type="hidden"
            name="content"
            value={serializedContent}
            readOnly
          />

          <div className="mt-2">
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Descreva a proposta completa..."
              editable={!pending}
            />
          </div>

          {state.errors?.content ? (
            <p className="mt-2 text-xs font-medium text-red-600">
              {state.errors.content}
            </p>
          ) : null}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-slate-500" />

            <p className="text-sm font-bold text-slate-800">
              Ícone da proposta
            </p>
          </div>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Selecione o ícone que melhor
            representa esta proposta.
          </p>

          <input
            type="hidden"
            name="icon"
            value={selectedIcon}
            readOnly
          />

          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {iconOptions.map(
              (option) => {
                const Icon =
                  option.icon;

                const active =
                  selectedIcon ===
                  option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setSelectedIcon(
                        option.value
                      )
                    }
                    aria-pressed={
                      active
                    }
                    title={
                      option.label
                    }
                    className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border px-2 py-3 text-center transition ${
                      active
                        ? "border-slate-950 bg-slate-950 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
                    }`}
                  >
                    <Icon className="h-6 w-6" />

                    <span className="text-[11px] font-bold leading-4">
                      {option.label}
                    </span>
                  </button>
                );
              }
            )}
          </div>

          {selectedIcon ? (
            <button
              type="button"
              onClick={() =>
                setSelectedIcon("")
              }
              className="mt-3 text-xs font-bold text-red-600 transition hover:text-red-700"
            >
              Remover ícone selecionado
            </button>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="display_order"
            className="text-sm font-bold text-slate-800"
          >
            Ordem de exibição
          </label>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Números menores aparecem
            primeiro na Landing Page.
          </p>

          <div className="relative mt-2">
            <Hash className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              id="display_order"
              name="display_order"
              type="number"
              min={0}
              step={1}
              defaultValue={
                proposal?.display_order ??
                0
              }
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="is_featured"
              defaultChecked={
                proposal?.is_featured ??
                false
              }
              className="mt-1 h-4 w-4 rounded border-slate-300 accent-slate-950"
            />

            <span>
              <span className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Award className="h-4 w-4" />
                Destacar proposta
              </span>

              <span className="mt-1 block text-xs leading-5 text-slate-500">
                Propostas em destaque poderão
                receber maior evidência na
                Landing Page.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 border-t border-slate-200 pt-3">
            <input
              type="checkbox"
              name="is_published"
              defaultChecked={
                proposal?.is_published ??
                true
              }
              className="mt-1 h-4 w-4 rounded border-slate-300 accent-slate-950"
            />

            <span>
              <span className="text-sm font-bold text-slate-800">
                Publicar proposta
              </span>

              <span className="mt-1 block text-xs leading-5 text-slate-500">
                Deixe desmarcado para salvar
                como rascunho.
              </span>
            </span>
          </label>
        </div>

        {state.message ? (
          <div
            role="status"
            className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
              state.success
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {state.message}
          </div>
        ) : null}
      </div>

      <div className="border-t border-slate-100 bg-slate-50 px-6 py-5">
        <div
          className={`grid gap-3 ${
            isEditing
              ? "sm:grid-cols-[1fr_1.5fr]"
              : ""
          }`}
        >
          {isEditing ? (
            <Link
              href="/dashboard/propostas"
              className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
              Cancelar
            </Link>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />

                {isEditing
                  ? "Salvando..."
                  : "Cadastrando..."}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />

                {isEditing
                  ? "Salvar alterações"
                  : "Cadastrar proposta"}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}