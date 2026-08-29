"use server";

import { revalidatePath } from "next/cache";

import { authorizeAction } from "@/lib/auth/campaign-access";
import {
  getBoolean,
  getFile,
  getOptionalString,
  getString,
} from "@/lib/form-data";
import { slugify } from "@/lib/slug";
import { createClient } from "@/lib/supabase/server";

import type {
  PostActionState,
  PostStatus,
} from "./types";

type CampaignContext = {
  userId: string;
  campaignId: string;
};

type UploadedImage = {
  url: string;
  storagePath: string;
};

const MEDIA_BUCKET = "campaign-media";

const MAX_IMAGE_SIZE =
  5 * 1024 * 1024; // 5 MB

const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function getImageFile(
  formData: FormData
): File | null {
  return getFile(formData, "cover_image_file");
}

function getPostStatus(
  formData: FormData
): PostStatus {
  const status =
    getString(
      formData,
      "status"
    );

  return status ===
    "published"
    ? "published"
    : "draft";
}

function validateEditorContent(
  formData: FormData
): string | null {
  const content =
    getOptionalString(
      formData,
      "content"
    );

  if (!content) {
    return null;
  }

  try {
    const parsed =
      JSON.parse(content);

    if (
      typeof parsed !==
        "object" ||
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

function validateImageFile(
  file: File | null
): string | null {
  if (!file) {
    return null;
  }

  if (
    !allowedImageTypes.includes(
      file.type
    )
  ) {
    return "A imagem deve estar no formato JPG, PNG ou WEBP.";
  }

  if (
    file.size >
    MAX_IMAGE_SIZE
  ) {
    return "A imagem deve ter no máximo 5 MB.";
  }

  return null;
}

function validatePost(
  formData: FormData
): PostActionState | null {
  const title =
    getString(
      formData,
      "title"
    );

  const excerpt =
    getOptionalString(
      formData,
      "excerpt"
    );

  const imageFile =
    getImageFile(formData);

  const errors: Record<
    string,
    string
  > = {};

  if (title.length < 3) {
    errors.title =
      "O título deve ter pelo menos 3 caracteres.";
  }

  if (title.length > 180) {
    errors.title =
      "O título deve ter no máximo 180 caracteres.";
  }

  if (
    excerpt &&
    excerpt.length > 500
  ) {
    errors.excerpt =
      "O resumo deve ter no máximo 500 caracteres.";
  }

  const contentError =
    validateEditorContent(
      formData
    );

  if (contentError) {
    errors.content =
      contentError;
  }

  const imageError =
    validateImageFile(
      imageFile
    );

  if (imageError) {
    errors.cover_image =
      imageError;
  }

  if (
    Object.keys(errors)
      .length > 0
  ) {
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
  const { authorized, access } =
    await authorizeAction("news.manage");

  if (!authorized) {
    throw new Error(
      "Você não possui permissão para gerenciar notícias."
    );
  }

  return {
    userId: access.userId,
    campaignId: access.campaignId,
  };
}

async function createUniquePostSlug(
  title: string,
  campaignId: string
): Promise<string> {
  const supabase =
    await createClient();

  const baseSlug =
    slugify(title) ||
    `noticia-${crypto
      .randomUUID()
      .slice(0, 8)}`;

  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const {
      data,
      error,
    } = await supabase
      .from(
        "campaign_posts"
      )
      .select("id")
      .eq(
        "campaign_id",
        campaignId
      )
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

    slug =
      `${baseSlug}-${counter}`;

    counter += 1;
  }
}

function getFileExtension(
  file: File
): string {
  switch (file.type) {
    case "image/png":
      return "png";

    case "image/webp":
      return "webp";

    case "image/jpeg":
    default:
      return "jpg";
  }
}

async function uploadPostImage(
  file: File,
  campaignId: string
): Promise<UploadedImage> {
  const supabase =
    await createClient();

  const extension =
    getFileExtension(file);

  const storagePath =
    `${campaignId}/posts/${crypto.randomUUID()}.${extension}`;

  const arrayBuffer =
    await file.arrayBuffer();

  const buffer =
    new Uint8Array(
      arrayBuffer
    );

  const {
    error: uploadError,
  } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(
      storagePath,
      buffer,
      {
        contentType:
          file.type,
        upsert: false,
      }
    );

 if (uploadError) {
  console.error(
    "Erro ao enviar imagem da notícia:",
    JSON.stringify(
      {
        message: uploadError.message,
        name: uploadError.name,
      },
      null,
      2
    )
  );

  throw new Error(
    "Não foi possível enviar a imagem de capa."
  );
}

  const {
    data: publicUrlData,
  } = supabase.storage
    .from(MEDIA_BUCKET)
    .getPublicUrl(
      storagePath
    );

  return {
    url:
      publicUrlData
        .publicUrl,

    storagePath,
  };
}

async function removeStoredImage(
  storagePath:
    | string
    | null
    | undefined
) {
  if (!storagePath) {
    return;
  }

  const supabase =
    await createClient();

  const {
    error,
  } = await supabase.storage
    .from(MEDIA_BUCKET)
    .remove([
      storagePath,
    ]);

  if (error) {
    /*
     * Não bloqueamos a operação
     * principal caso apenas a
     * limpeza do arquivo antigo
     * falhe.
     */
    console.error(
      "Erro ao remover imagem antiga:",
      error
    );
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
  _previousState:
    PostActionState,
  formData: FormData
): Promise<PostActionState> {
  let uploadedImage:
    | UploadedImage
    | null = null;

  try {
    const validation =
      validatePost(
        formData
      );

    if (validation) {
      return validation;
    }

    const supabase =
      await createClient();

    const {
      userId,
      campaignId,
    } =
      await getCampaignContext();

    const title =
      getString(
        formData,
        "title"
      );

    const status =
      getPostStatus(
        formData
      );

    const imageFile =
      getImageFile(
        formData
      );

    const slug =
      await createUniquePostSlug(
        title,
        campaignId
      );

    if (imageFile) {
      uploadedImage =
        await uploadPostImage(
          imageFile,
          campaignId
        );
    }

    const publishedAt =
      status ===
      "published"
        ? new Date()
            .toISOString()
        : null;

    const {
      error,
    } = await supabase
      .from(
        "campaign_posts"
      )
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
          uploadedImage?.url ??
          null,

        cover_image_storage_path:
          uploadedImage
            ?.storagePath ??
          null,

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
      /*
       * Se o upload foi feito,
       * mas o registro no banco
       * falhou, removemos o arquivo.
       */
      if (
        uploadedImage
          ?.storagePath
      ) {
        await removeStoredImage(
          uploadedImage
            .storagePath
        );
      }

      console.error(
        "Erro ao criar notícia:",
        error
      );

      if (
        error.code === "23505"
      ) {
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
    if (
      uploadedImage
        ?.storagePath
    ) {
      await removeStoredImage(
        uploadedImage
          .storagePath
      );
    }

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
  _previousState:
    PostActionState,
  formData: FormData
): Promise<PostActionState> {
  let uploadedImage:
    | UploadedImage
    | null = null;

  try {
    if (!postId) {
      return {
        success: false,
        message:
          "Notícia inválida.",
      };
    }

    const validation =
      validatePost(
        formData
      );

    if (validation) {
      return validation;
    }

    const supabase =
      await createClient();

    const {
      campaignId,
    } =
      await getCampaignContext();

    const {
      data: existingPost,
      error: findError,
    } = await supabase
      .from(
        "campaign_posts"
      )
      .select(`
        id,
        status,
        published_at,
        cover_image_url,
        cover_image_storage_path
      `)
      .eq(
        "id",
        postId
      )
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
      getPostStatus(
        formData
      );

    const imageFile =
      getImageFile(
        formData
      );

    const removeImage =
      getBoolean(
        formData,
        "remove_cover_image"
      );

    let coverImageUrl =
      existingPost
        .cover_image_url;

    let coverImageStoragePath =
      existingPost
        .cover_image_storage_path;

    /*
     * Caso uma nova imagem
     * tenha sido escolhida,
     * fazemos upload primeiro.
     */
    if (imageFile) {
      uploadedImage =
        await uploadPostImage(
          imageFile,
          campaignId
        );

      coverImageUrl =
        uploadedImage.url;

      coverImageStoragePath =
        uploadedImage.storagePath;
    } else if (
      removeImage
    ) {
      coverImageUrl = null;
      coverImageStoragePath =
        null;
    }

    const publishedAt =
      status ===
      "published"
        ? existingPost
            .published_at ||
          new Date()
            .toISOString()
        : null;

    const {
      data: updatedPost,
      error,
    } = await supabase
      .from(
        "campaign_posts"
      )
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
          coverImageUrl,

        cover_image_storage_path:
          coverImageStoragePath,

        author_name:
          getOptionalString(
            formData,
            "author_name"
          ),

        status,

        published_at:
          publishedAt,

        updated_at:
          new Date()
            .toISOString(),
      })
      .eq(
        "id",
        postId
      )
      .eq(
        "campaign_id",
        campaignId
      )
      .select("id")
      .maybeSingle();

    if (error) {
      /*
       * O update falhou depois
       * do upload da nova imagem.
       * Portanto removemos apenas
       * a imagem nova.
       */
      if (
        uploadedImage
          ?.storagePath
      ) {
        await removeStoredImage(
          uploadedImage
            .storagePath
        );
      }

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
      if (
        uploadedImage
          ?.storagePath
      ) {
        await removeStoredImage(
          uploadedImage
            .storagePath
        );
      }

      return {
        success: false,
        message:
          "Nenhuma notícia foi atualizada.",
      };
    }

    /*
     * O banco foi atualizado
     * com sucesso.
     *
     * Agora podemos apagar a
     * imagem antiga caso tenha
     * sido substituída ou removida.
     */
    const oldStoragePath =
      existingPost
        .cover_image_storage_path;

    const imageWasReplaced =
      Boolean(
        uploadedImage
          ?.storagePath
      );

    if (
      oldStoragePath &&
      (
        imageWasReplaced ||
        removeImage
      ) &&
      oldStoragePath !==
        coverImageStoragePath
    ) {
      await removeStoredImage(
        oldStoragePath
      );
    }

    revalidatePostRoutes();

    return {
      success: true,
      message:
        "Notícia atualizada com sucesso.",
    };
  } catch (error) {
    if (
      uploadedImage
        ?.storagePath
    ) {
      await removeStoredImage(
        uploadedImage
          .storagePath
      );
    }

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

    const {
      campaignId,
    } =
      await getCampaignContext();

    const {
      data: post,
      error: findError,
    } = await supabase
      .from(
        "campaign_posts"
      )
      .select(`
        id,
        status,
        published_at
      `)
      .eq(
        "id",
        postId
      )
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

    const nextStatus:
      PostStatus =
      post.status ===
      "published"
        ? "draft"
        : "published";

    const {
      error,
    } = await supabase
      .from(
        "campaign_posts"
      )
      .update({
        status:
          nextStatus,

        published_at:
          nextStatus ===
          "published"
            ? post
                .published_at ||
              new Date()
                .toISOString()
            : null,

        updated_at:
          new Date()
            .toISOString(),
      })
      .eq(
        "id",
        postId
      )
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
        nextStatus ===
        "published"
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

    const {
      campaignId,
    } =
      await getCampaignContext();

    /*
     * Antes de excluir,
     * buscamos o caminho da
     * imagem para remover do
     * Storage depois.
     */
    const {
      data: existingPost,
      error: findError,
    } = await supabase
      .from(
        "campaign_posts"
      )
      .select(`
        id,
        cover_image_storage_path
      `)
      .eq(
        "id",
        postId
      )
      .eq(
        "campaign_id",
        campaignId
      )
      .maybeSingle();

    if (findError) {
      console.error(
        "Erro ao localizar notícia para exclusão:",
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

    const {
      data: deletedPost,
      error,
    } = await supabase
      .from(
        "campaign_posts"
      )
      .delete()
      .eq(
        "id",
        postId
      )
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

    /*
     * A notícia já foi excluída
     * com sucesso do banco.
     * Agora limpamos sua imagem.
     */
    await removeStoredImage(
      existingPost
        .cover_image_storage_path
    );

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