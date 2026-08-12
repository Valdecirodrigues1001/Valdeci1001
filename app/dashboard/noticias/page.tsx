import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import PostForm from "./components/post-form";
import PostsList from "./components/posts-list";

import type {
  PostFormData,
  PostListItem,
} from "./types";

type PageProps = {
  searchParams: Promise<{
    edit?: string;
  }>;
};

type CampaignRelation = {
  id: string;
  name: string | null;
  candidate_name: string | null;
};

type CampaignContext = {
  campaignId: string;
  campaignName: string;
};

type CampaignMembershipRow = {
  campaign_id: string;
  campaigns:
    | CampaignRelation
    | CampaignRelation[]
    | null;
};

async function getCampaignContext(): Promise<
  CampaignContext | null
> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("campaign_members")
    .select(`
      campaign_id,
      campaigns (
        id,
        name,
        candidate_name
      )
    `)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", {
      ascending: true,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(
      "Erro ao buscar contexto da campanha:",
      error
    );

    return null;
  }

  if (!data?.campaign_id) {
    return null;
  }

  const membership =
    data as CampaignMembershipRow;

  const campaignData = Array.isArray(
    membership.campaigns
  )
    ? membership.campaigns[0]
    : membership.campaigns;

  return {
    campaignId: membership.campaign_id,
    campaignName:
      campaignData?.candidate_name ||
      campaignData?.name ||
      "Campanha eleitoral",
  };
}

async function getPosts(
  campaignId: string
): Promise<PostListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("campaign_posts")
    .select(`
      id,
      campaign_id,
      title,
      slug,
      excerpt,
      content,
      cover_image_url,
      cover_image_storage_path,
      author_name,
      status,
      published_at,
      created_at,
      updated_at
    `)
    .eq("campaign_id", campaignId)
    .order("created_at", {
      ascending: false,
    });

 if (error) {
  console.error(
    "Erro ao buscar notícias:",
    JSON.stringify(
      {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      },
      null,
      2
    )
  );

  return [];
}

  return (data ?? []) as PostListItem[];
}

async function getPostForEditing(
  postId: string,
  campaignId: string
): Promise<PostFormData | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("campaign_posts")
    .select(`
      id,
      title,
      slug,
      excerpt,
      content,
      cover_image_url,
      author_name,
      status,
      published_at
    `)
    .eq("id", postId)
    .eq("campaign_id", campaignId)
    .maybeSingle();

  if (error) {
    console.error(
      "Erro ao buscar notícia para edição:",
      error
    );

    return null;
  }

  return data as PostFormData | null;
}

export default async function NewsPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  const context =
    await getCampaignContext();

  if (!context) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8">
            <h1 className="text-xl font-bold text-amber-950">
              Campanha não encontrada
            </h1>

            <p className="mt-2 text-sm leading-6 text-amber-800">
              Seu usuário ainda não está vinculado a uma campanha ativa.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const posts = await getPosts(
    context.campaignId
  );

  let editingPost: PostFormData | null =
    null;

  if (params.edit) {
    editingPost =
      await getPostForEditing(
        params.edit,
        context.campaignId
      );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Conteúdo da campanha
          </p>

          <h1 className="mt-2 text-3xl font-black text-slate-950">
            Notícias e comunicados
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Cadastre e gerencie as notícias de{" "}
            <strong className="font-bold text-slate-700">
              {context.campaignName}
            </strong>{" "}
            para publicação na Landing Page da campanha.
          </p>
        </header>

        {params.edit && !editingPost ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <p className="text-sm font-bold text-amber-900">
              Notícia não encontrada
            </p>

            <p className="mt-1 text-sm leading-6 text-amber-700">
              A notícia selecionada não existe ou não pertence à campanha atual.
            </p>
          </div>
        ) : null}

        <div className="mt-8 grid items-start gap-8 xl:grid-cols-[420px_minmax(0,1fr)]">
          <PostForm
  key={
    editingPost?.id
      ? `edit-${editingPost.id}`
      : "new-post"
  }
  post={editingPost}
/>

          <PostsList
            posts={posts}
            editingPostId={
              editingPost?.id ?? null
            }
          />
        </div>
      </div>
    </main>
  );
}