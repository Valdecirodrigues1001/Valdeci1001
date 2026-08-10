"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import type {
  PostActionState,
  PostStatus,
} from "./types";

type CampaignContext = {
  userId: string;
  campaignId: string;
};

function getString(
  formData: FormData,
  field: string
): string {
  const value = formData.get(field);

  return typeof value === "string"
    ? value.trim()
    : "";
}

function getOptionalString(
  formData: FormData,
  field: string
): string | null {
  const value = getString(formData, field);

  return value || null;
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getPostStatus(
  formData: FormData
): PostStatus {
  const status = getString(formData, "status");

  return status === "published"
    ? "published"
    : "draft";
}

function validateEditorContent(
  formData: FormData
): string | null {
  const content = getOptionalString(
    formData,
    "content"
  );

  if (!content) {
    return null;
  }

  try {
    const parsed = JSON.parse(content);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      parsed.type !== "doc"
    ) {
      return "Conteúdo inválido.";
    }
  } catch {
    return "Conteúdo inválido.";
  }

  return null;
}

function validatePost(
  formData: FormData
): PostActionState | null {
  const title = getString(
    formData,
    "title"
  );

  const excerpt = getOptionalString(
    formData,
    "excerpt"
  );

  const errors: Record<string, string> = {};

  if (title.length < 3) {
    errors.title =
      "O título deve ter pelo menos 3 caracteres.";
  }

  if (title.length > 180) {
    errors.title =
      "O título deve ter no máximo 180 caracteres.";
  }

  if (excerpt && excerpt.length > 500) {
    errors.excerpt =
      "O resumo deve ter no máximo 500 caracteres.";
  }

  const contentError =
    validateEditorContent(formData);

  if (contentError) {
    errors.content = contentError;
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message:
        "Revise os campos da notícia.",
      errors,
    };
  }

  return null;
}

async function getCampaignContext(): Promise<CampaignContext> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(
      "Usuário não autenticado."
    );
  }

  const {
    data: membership,
    error,
  } = await supabase
    .from("campaign_members")
    .select("campaign_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", {
      ascending: true,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(
      "Erro ao identificar campanha:",
      error
    );

    throw new Error(
      "Não foi possível identificar a campanha."
    );
  }

  if (!membership?.campaign_id) {
    throw new Error(
      "Seu usuário não está vinculado a uma campanha ativa."
    );
  }

  return {
    userId: user.id,
    campaignId:
      membership.campaign_id,
  };
}

async function createUniquePostSlug(
  title: string,
  campaignId: string
): Promise<string> {
  const supabase = await createClient();

  const baseSlug =
    slugify(title) ||
    `noticia-${crypto.randomUUID().slice(0, 8)}`;

  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const {
      data,
      error,
    } = await supabase
      .from("campaign_posts")
      .select("id")
      .eq("campaign_id", campaignId)
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error(
        "Erro ao verificar slug da notícia:",
        error
      );

      throw new Error(
        "Não foi possível gerar o endereço da notícia."
      );
    }

    if (!data) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

function revalidatePostRoutes() {
  revalidatePath(
    "/dashboard/noticias"
  );

  revalidatePath(
    "/dashboard/landing-page"
  );

  revalidatePath(
    "/c/[slug]",
    "page"
  );

  revalidatePath(
    "/c/[slug]/noticias/[postSlug]",
    "page"
  );
}

export async function createPost(
  _previousState: PostActionState,
  formData: FormData
): Promise<PostActionState> {
  try {
    const validation =
      validatePost(formData);

    if (validation) {
      return validation;
    }

    const supabase =
      await createClient();

    const {
      userId,
      campaignId,
    } = await getCampaignContext();

    const title = getString(
      formData,
      "title"
    );

    const status =
      getPostStatus(formData);

    const slug =
      await createUniquePostSlug(
        title,
        campaignId
      );

    const publishedAt =
      status === "published"
        ? new Date().toISOString()
        : null;

    const { error } = await supabase
      .from("campaign_posts")
      .insert({
        campaign_id:
          campaignId,

        title,

        slug,

        excerpt:
          getOptionalString(
            formData,
            "excerpt"
          ),

        content:
          getOptionalString(
            formData,
            "content"
          ),

        cover_image_url:
          getOptionalString(
            formData,
            "cover_image_url"
          ),

        author_name:
          getOptionalString(
            formData,
            "author_name"
          ),

        status,

        published_at:
          publishedAt,

        created_by:
          userId,
      });

    if (error) {
      console.error(
        "Erro ao criar notícia:",
        error
      );

      if (error.code === "23505") {
        return {
          success: false,
          message:
            "Já existe uma notícia com esse endereço.",
        };
      }

      return {
        success: false,
        message:
          "Não foi possível cadastrar a notícia.",
      };
    }

    revalidatePostRoutes();

    return {
      success: true,
      message:
        "Notícia cadastrada com sucesso.",
    };
  } catch (error) {
    console.error(
      "Erro em createPost:",
      error
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Ocorreu um erro inesperado.",
    };
  }
}

export async function updatePost(
  postId: string,
  _previousState: PostActionState,
  formData: FormData
): Promise<PostActionState> {
  try {
    if (!postId) {
      return {
        success: false,
        message:
          "Notícia inválida.",
      };
    }

    const validation =
      validatePost(formData);

    if (validation) {
      return validation;
    }

    const supabase =
      await createClient();

    const { campaignId } =
      await getCampaignContext();

    const {
      data: existingPost,
      error: findError,
    } = await supabase
      .from("campaign_posts")
      .select(`
        id,
        status,
        published_at
      `)
      .eq("id", postId)
      .eq(
        "campaign_id",
        campaignId
      )
      .maybeSingle();

    if (findError) {
      console.error(
        "Erro ao localizar notícia:",
        findError
      );

      return {
        success: false,
        message:
          "Não foi possível localizar a notícia.",
      };
    }

    if (!existingPost) {
      return {
        success: false,
        message:
          "A notícia não foi encontrada ou você não possui acesso.",
      };
    }

    const status =
      getPostStatus(formData);

    const publishedAt =
      status === "published"
        ? existingPost.published_at ||
          new Date().toISOString()
        : null;

    const {
      data: updatedPost,
      error,
    } = await supabase
      .from("campaign_posts")
      .update({
        title:
          getString(
            formData,
            "title"
          ),

        excerpt:
          getOptionalString(
            formData,
            "excerpt"
          ),

        content:
          getOptionalString(
            formData,
            "content"
          ),

        cover_image_url:
          getOptionalString(
            formData,
            "cover_image_url"
          ),

        author_name:
          getOptionalString(
            formData,
            "author_name"
          ),

        status,

        published_at:
          publishedAt,

        updated_at:
          new Date().toISOString(),
      })
      .eq("id", postId)
      .eq(
        "campaign_id",
        campaignId
      )
      .select("id")
      .maybeSingle();

    if (error) {
      console.error(
        "Erro ao atualizar notícia:",
        error
      );

      return {
        success: false,
        message:
          "Não foi possível salvar as alterações.",
      };
    }

    if (!updatedPost) {
      return {
        success: false,
        message:
          "Nenhuma notícia foi atualizada.",
      };
    }

    revalidatePostRoutes();

    return {
      success: true,
      message:
        "Notícia atualizada com sucesso.",
    };
  } catch (error) {
    console.error(
      "Erro em updatePost:",
      error
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Ocorreu um erro inesperado.",
    };
  }
}

export async function togglePostPublication(
  postId: string
): Promise<PostActionState> {
  try {
    if (!postId) {
      return {
        success: false,
        message:
          "Notícia inválida.",
      };
    }

    const supabase =
      await createClient();

    const { campaignId } =
      await getCampaignContext();

    const {
      data: post,
      error: findError,
    } = await supabase
      .from("campaign_posts")
      .select(`
        id,
        status,
        published_at
      `)
      .eq("id", postId)
      .eq(
        "campaign_id",
        campaignId
      )
      .maybeSingle();

    if (findError) {
      console.error(
        "Erro ao buscar publicação da notícia:",
        findError
      );

      return {
        success: false,
        message:
          "Não foi possível localizar a notícia.",
      };
    }

    if (!post) {
      return {
        success: false,
        message:
          "Notícia não encontrada.",
      };
    }

    const nextStatus: PostStatus =
      post.status === "published"
        ? "draft"
        : "published";

    const {
      error,
    } = await supabase
      .from("campaign_posts")
      .update({
        status:
          nextStatus,

        published_at:
          nextStatus === "published"
            ? post.published_at ||
              new Date().toISOString()
            : null,

        updated_at:
          new Date().toISOString(),
      })
      .eq("id", postId)
      .eq(
        "campaign_id",
        campaignId
      );

    if (error) {
      console.error(
        "Erro ao alterar publicação:",
        error
      );

      return {
        success: false,
        message:
          "Não foi possível alterar a publicação.",
      };
    }

    revalidatePostRoutes();

    return {
      success: true,
      message:
        nextStatus === "published"
          ? "Notícia publicada com sucesso."
          : "Notícia movida para rascunho.",
    };
  } catch (error) {
    console.error(
      "Erro em togglePostPublication:",
      error
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Ocorreu um erro inesperado.",
    };
  }
}

export async function deletePost(
  postId: string
): Promise<PostActionState> {
  try {
    if (!postId) {
      return {
        success: false,
        message:
          "Notícia inválida.",
      };
    }

    const supabase =
      await createClient();

    const { campaignId } =
      await getCampaignContext();

    const {
      data: deletedPost,
      error,
    } = await supabase
      .from("campaign_posts")
      .delete()
      .eq("id", postId)
      .eq(
        "campaign_id",
        campaignId
      )
      .select("id")
      .maybeSingle();

    if (error) {
      console.error(
        "Erro ao excluir notícia:",
        error
      );

      return {
        success: false,
        message:
          "Não foi possível excluir a notícia.",
      };
    }

    if (!deletedPost) {
      return {
        success: false,
        message:
          "A notícia não foi encontrada ou você não possui acesso.",
      };
    }

    revalidatePostRoutes();

    return {
      success: true,
      message:
        "Notícia excluída com sucesso.",
    };
  } catch (error) {
    console.error(
      "Erro em deletePost:",
      error
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Ocorreu um erro inesperado.",
    };
  }
}