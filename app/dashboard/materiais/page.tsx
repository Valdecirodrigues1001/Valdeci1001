import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Archive,
  CheckCircle2,
  Clock3,
  Download,
  FileImage,
  FileText,
  FolderOpen,
  ImageIcon,
  Search,
  ShieldCheck,
  Star,
  Trash2,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import DeleteMaterialButton from "./delete-material-button";
import MaterialForm from "./material-form";
import {
  deleteMaterial,
  toggleOfficialMaterial,
  updateMaterialStatus,
} from "./actions";

const BUCKET_NAME = "campaign-materials";

const categoryLabels: Record<string, string> = {
  instagram_post: "Post para Instagram",
  instagram_story: "Story",
  facebook_post: "Post para Facebook",
  whatsapp: "Material para WhatsApp",
  santinho: "Santinho",
  adesivo: "Adesivo",
  banner: "Banner",
  faixa: "Faixa",
  cartaz: "Cartaz",
  flyer: "Flyer",
  panfleto: "Panfleto",
  logo: "Logo",
  manual_identidade: "Manual de identidade",
  documento: "Documento",
  other: "Outro",
};

const statusLabels: Record<string, string> = {
  pending: "Em aprovação",
  approved: "Aprovado",
  archived: "Arquivado",
};

const statusStyles: Record<string, string> = {
  pending:
    "border-amber-200 bg-amber-50 text-amber-700",
  approved:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  archived:
    "border-slate-200 bg-slate-100 text-slate-600",
};

const filterOptions = [
  {
    value: "all",
    label: "Todos",
  },
  {
    value: "social_media",
    label: "Posts",
  },
  {
    value: "printed",
    label: "Materiais físicos",
  },
];

type MaterialsPageProps = {
  searchParams?: Promise<{
    search?: string;
    group?: string;
    status?: string;
  }>;
};

type MaterialRow = {
  id: string;
  campaign_id: string;
  name: string;
  description: string | null;
  material_group: string;
  category: string;
  status: string;
  is_official: boolean;
  file_url: string;
  storage_path: string;
  thumbnail_url: string | null;
  mime_type: string | null;
  file_size: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

function formatFileSize(size: number | null) {
  if (!size) {
    return "Tamanho não informado";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function getFileExtension(material: MaterialRow) {
  const fileName =
    material.storage_path.split("/").pop() ?? "";

  const extension = fileName.split(".").pop();

  return extension?.toUpperCase() ?? "ARQUIVO";
}

function isImageMaterial(material: MaterialRow) {
  return material.mime_type?.startsWith("image/");
}

export default async function MaterialsPage({
  searchParams,
}: MaterialsPageProps) {
  const resolvedSearchParams =
    (await searchParams) ?? {};

  const search =
    resolvedSearchParams.search?.trim() ?? "";

  const selectedGroup =
    resolvedSearchParams.group ?? "all";

  const selectedStatus =
    resolvedSearchParams.status ?? "all";

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: membership, error: membershipError } =
    await supabase
      .from("campaign_members")
      .select(`
        id,
        campaign_id,
        is_active
      `)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

  if (membershipError || !membership) {
    redirect("/login");
  }

  let materialsQuery = supabase
    .from("campaign_materials")
    .select(`
      id,
      campaign_id,
      name,
      description,
      material_group,
      category,
      status,
      is_official,
      file_url,
      storage_path,
      thumbnail_url,
      mime_type,
      file_size,
      created_by,
      created_at,
      updated_at
    `)
    .eq("campaign_id", membership.campaign_id)
    .order("is_official", {
      ascending: false,
    })
    .order("created_at", {
      ascending: false,
    });

  if (
    selectedGroup !== "all" &&
    ["social_media", "printed"].includes(selectedGroup)
  ) {
    materialsQuery = materialsQuery.eq(
      "material_group",
      selectedGroup
    );
  }

  if (
    selectedStatus !== "all" &&
    ["pending", "approved", "archived"].includes(
      selectedStatus
    )
  ) {
    materialsQuery = materialsQuery.eq(
      "status",
      selectedStatus
    );
  }

  if (search) {
    materialsQuery = materialsQuery.or(
      `name.ilike.%${search}%,description.ilike.%${search}%`
    );
  }

  const { data, error: materialsError } =
    await materialsQuery;

  if (materialsError) {
    console.error(
      "Materials page query error:",
      materialsError
    );
  }

  const materials = (data ?? []) as MaterialRow[];

  const { data: allMaterialsData } = await supabase
    .from("campaign_materials")
    .select(`
      id,
      material_group,
      category,
      status,
      is_official,
      updated_at
    `)
    .eq("campaign_id", membership.campaign_id);

  const allMaterials = allMaterialsData ?? [];

  const totalMaterials = allMaterials.length;

  const approvedMaterials = allMaterials.filter(
    (material) => material.status === "approved"
  ).length;

  const pendingMaterials = allMaterials.filter(
    (material) => material.status === "pending"
  ).length;

  const physicalMaterials = allMaterials.filter(
    (material) => material.material_group === "printed"
  ).length;

  const storagePaths = materials
    .map((material) => material.storage_path)
    .filter(Boolean);

  const signedUrlMap = new Map<string, string>();

  if (storagePaths.length > 0) {
    const { data: signedFiles, error: signedFilesError } =
      await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrls(storagePaths, 60 * 60);

    if (signedFilesError) {
      console.error(
        "Create signed material URLs error:",
        signedFilesError
      );
    }

    signedFiles?.forEach((signedFile, index) => {
      const storagePath = storagePaths[index];

      if (signedFile.signedUrl) {
        signedUrlMap.set(
          storagePath,
          signedFile.signedUrl
        );
      }
    });
  }

  const hasActiveFilters =
    Boolean(search) ||
    selectedGroup !== "all" ||
    selectedStatus !== "all";

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <FolderOpen className="h-4 w-4" />
              Central da campanha
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Materiais
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Organize artes para redes sociais e materiais
              físicos oficiais da campanha.
            </p>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                <ImageIcon className="h-5 w-5 text-slate-700" />
              </span>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                Total
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-slate-950">
              {totalMaterials}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Materiais cadastrados
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50">
                <CheckCircle2 className="h-5 w-5 text-emerald-700" />
              </span>

              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                Disponíveis
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-slate-950">
              {approvedMaterials}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Materiais aprovados
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50">
                <Clock3 className="h-5 w-5 text-amber-700" />
              </span>

              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                Revisão
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-slate-950">
              {pendingMaterials}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Em aprovação
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
                <FileImage className="h-5 w-5 text-blue-700" />
              </span>

              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                Impressos
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-slate-950">
              {physicalMaterials}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Materiais físicos
            </p>
          </article>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
          <section className="min-w-0 space-y-5">
            <form
              method="get"
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_210px_190px_auto]">
                <label className="relative block">
                  <span className="sr-only">
                    Pesquisar materiais
                  </span>

                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="search"
                    name="search"
                    defaultValue={search}
                    placeholder="Pesquisar materiais..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  />
                </label>

                <select
                  name="group"
                  defaultValue={selectedGroup}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                >
                  {filterOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>

                <select
                  name="status"
                  defaultValue={selectedStatus}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                >
                  <option value="all">
                    Todos os status
                  </option>

                  <option value="approved">
                    Aprovados
                  </option>

                  <option value="pending">
                    Em aprovação
                  </option>

                  <option value="archived">
                    Arquivados
                  </option>
                </select>

                <button
                  type="submit"
                  className="flex h-11 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Filtrar
                </button>
              </div>

              {hasActiveFilters ? (
                <div className="mt-3 flex justify-end">
                  <Link
                    href="/dashboard/materiais"
                    className="text-sm font-medium text-slate-500 transition hover:text-slate-950"
                  >
                    Limpar filtros
                  </Link>
                </div>
              ) : null}
            </form>

            {materials.length === 0 ? (
              <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                  <FolderOpen className="h-7 w-7 text-slate-500" />
                </span>

                <h2 className="mt-5 text-lg font-semibold text-slate-900">
                  {hasActiveFilters
                    ? "Nenhum material encontrado"
                    : "Nenhum material cadastrado"}
                </h2>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {hasActiveFilters
                    ? "Tente alterar os termos da pesquisa ou remover os filtros aplicados."
                    : "Cadastre a primeira arte ou material físico da campanha usando o formulário ao lado."}
                </p>

                {hasActiveFilters ? (
                  <Link
                    href="/dashboard/materiais"
                    className="mt-5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Ver todos os materiais
                  </Link>
                ) : null}
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
                {materials.map((material) => {
                  const signedUrl = signedUrlMap.get(
                    material.storage_path
                  );

                  const materialIsImage =
                    isImageMaterial(material);

                  return (
                    <article
                      key={material.id}
                      className={[
                        "group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
                        material.is_official
                          ? "border-amber-300"
                          : "border-slate-200",
                      ].join(" ")}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                        {materialIsImage && signedUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={signedUrl}
                            alt={material.name}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                          />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center gap-3">
                            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                              <FileText className="h-7 w-7 text-slate-500" />
                            </span>

                            <span className="text-xs font-bold tracking-wider text-slate-400">
                              {getFileExtension(material)}
                            </span>
                          </div>
                        )}

                        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2">
                          {material.is_official ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50/95 px-2.5 py-1 text-xs font-semibold text-amber-700 shadow-sm backdrop-blur">
                              <Star className="h-3.5 w-3.5 fill-current" />
                              Oficial
                            </span>
                          ) : null}

                          <span
                            className={[
                              "rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur",
                              statusStyles[material.status] ??
                                statusStyles.archived,
                            ].join(" ")}
                          >
                            {statusLabels[material.status] ??
                              "Não informado"}
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              {categoryLabels[
                                material.category
                              ] ?? "Outro"}
                            </span>

                            <h2 className="mt-1 line-clamp-2 text-base font-semibold text-slate-950">
                              {material.name}
                            </h2>
                          </div>
                        </div>

                        {material.description ? (
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                            {material.description}
                          </p>
                        ) : (
                          <p className="mt-2 text-sm italic text-slate-400">
                            Sem descrição.
                          </p>
                        )}

                        <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500">
                          <span>
                            {formatFileSize(
                              material.file_size
                            )}
                          </span>

                          <span>
                            {formatDate(
                              material.updated_at
                            )}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          {signedUrl ? (
                            <a
                              href={signedUrl}
                              target="_blank"
                              rel="noreferrer"
                              download
                              className="flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                              <Download className="h-4 w-4" />
                              Baixar
                            </a>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="flex h-10 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-200 px-3 text-sm font-semibold text-slate-500"
                            >
                              <Download className="h-4 w-4" />
                              Indisponível
                            </button>
                          )}

                          <form
                            action={toggleOfficialMaterial.bind(
                              null,
                              material.id,
                              !material.is_official
                            )}
                          >
                            <button
                              type="submit"
                              className={[
                                "flex h-10 w-full items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold transition",
                                material.is_official
                                  ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                              ].join(" ")}
                            >
                              <Star
                                className={[
                                  "h-4 w-4",
                                  material.is_official
                                    ? "fill-current"
                                    : "",
                                ].join(" ")}
                              />

                              {material.is_official
                                ? "Oficial"
                                : "Destacar"}
                            </button>
                          </form>
                        </div>

                        <div className="mt-2 grid grid-cols-3 gap-2">
                          {material.status !== "approved" ? (
                            <form
                              action={updateMaterialStatus.bind(
                                null,
                                material.id,
                                "approved"
                              )}
                            >
                              <button
                                type="submit"
                                title="Aprovar material"
                                className="flex h-9 w-full items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100"
                              >
                                <ShieldCheck className="h-4 w-4" />
                              </button>
                            </form>
                          ) : (
                            <div className="flex h-9 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50/50 text-emerald-600">
                              <CheckCircle2 className="h-4 w-4" />
                            </div>
                          )}

                          {material.status !== "archived" ? (
                            <form
                              action={updateMaterialStatus.bind(
                                null,
                                material.id,
                                "archived"
                              )}
                            >
                              <button
                                type="submit"
                                title="Arquivar material"
                                className="flex h-9 w-full items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                              >
                                <Archive className="h-4 w-4" />
                              </button>
                            </form>
                          ) : (
                            <form
                              action={updateMaterialStatus.bind(
                                null,
                                material.id,
                                "pending"
                              )}
                            >
                              <button
                                type="submit"
                                title="Enviar para aprovação"
                                className="flex h-9 w-full items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700 transition hover:bg-amber-100"
                              >
                                <Clock3 className="h-4 w-4" />
                              </button>
                            </form>
                          )}

                          <form
                            action={deleteMaterial.bind(
                              null,
                              material.id
                            )}
                          >
                            <DeleteMaterialButton
  materialId={material.id}
/>
                          </form>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="xl:sticky xl:top-6 xl:self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <MaterialForm />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}