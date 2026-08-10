"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const BUCKET_NAME = "campaign-materials";

const allowedCategories = [
  "instagram_post",
  "instagram_story",
  "facebook_post",
  "whatsapp",
  "santinho",
  "adesivo",
  "banner",
  "faixa",
  "cartaz",
  "flyer",
  "panfleto",
  "other",
] as const;

const allowedStatuses = [
  "pending",
  "approved",
  "archived",
] as const;

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const maximumFileSize = 15 * 1024 * 1024;

type MaterialCategory = (typeof allowedCategories)[number];
type MaterialStatus = (typeof allowedStatuses)[number];

export type MaterialActionState = {
  success: boolean;
  message: string;
};

function sanitizeFileName(fileName: string) {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getMaterialGroup(category: MaterialCategory) {
  const socialMediaCategories: MaterialCategory[] = [
    "instagram_post",
    "instagram_story",
    "facebook_post",
    "whatsapp",
  ];

  if (socialMediaCategories.includes(category)) {
    return "social_media";
  }

  const printedCategories: MaterialCategory[] = [
    "santinho",
    "adesivo",
    "banner",
    "faixa",
    "cartaz",
    "flyer",
    "panfleto",
  ];

  if (printedCategories.includes(category)) {
    return "printed";
  }

  return "other";
}

async function getAuthenticatedCampaign() {
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
      .maybeSingle();

  if (membershipError || !membership) {
    throw new Error(
      "Você não possui acesso a uma campanha ativa."
    );
  }

  return {
    supabase,
    user,
    membership,
  };
}

export async function createMaterial(
  _previousState: MaterialActionState,
  formData: FormData
): Promise<MaterialActionState> {
  try {
    const { supabase, user, membership } =
      await getAuthenticatedCampaign();

    const name = String(formData.get("name") ?? "").trim();

    const description = String(
      formData.get("description") ?? ""
    ).trim();

    const category = String(
      formData.get("category") ?? ""
    ) as MaterialCategory;

    const status = String(
      formData.get("status") ?? "approved"
    ) as MaterialStatus;

    const isOfficial =
      formData.get("is_official") === "on" ||
      formData.get("is_official") === "true";

    const file = formData.get("file");

    if (!name) {
      return {
        success: false,
        message: "Informe o nome do material.",
      };
    }

    if (!allowedCategories.includes(category)) {
      return {
        success: false,
        message: "Selecione uma categoria válida.",
      };
    }

    if (!allowedStatuses.includes(status)) {
      return {
        success: false,
        message: "Selecione um status válido.",
      };
    }

    if (!(file instanceof File) || file.size === 0) {
      return {
        success: false,
        message: "Selecione um arquivo.",
      };
    }

    if (!allowedMimeTypes.includes(file.type)) {
      return {
        success: false,
        message:
          "Formato não permitido. Envie uma imagem JPG, PNG, WEBP ou um arquivo PDF.",
      };
    }

    if (file.size > maximumFileSize) {
      return {
        success: false,
        message: "O arquivo deve possuir no máximo 15 MB.",
      };
    }

    const safeFileName =
      sanitizeFileName(file.name) || "material";

    const storagePath = [
      membership.campaign_id,
      new Date().getFullYear(),
      `${crypto.randomUUID()}-${safeFileName}`,
    ].join("/");

    const fileBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Material upload error:", uploadError);

      return {
        success: false,
        message: "Não foi possível enviar o arquivo.",
      };
    }

    const materialGroup = getMaterialGroup(category);

    const { error: insertError } = await supabase
      .from("campaign_materials")
      .insert({
        campaign_id: membership.campaign_id,
        name,
        description: description || null,
        material_group: materialGroup,
        category,
        status,
        is_official: isOfficial,

        /*
         * Como o bucket é privado, não existe uma URL pública
         * permanente. Mantemos o caminho também em file_url
         * porque essa coluna foi criada como obrigatória.
         */
        file_url: storagePath,
        storage_path: storagePath,

        thumbnail_url: null,
        mime_type: file.type,
        file_size: file.size,
        created_by: user.id,
      });

    if (insertError) {
      console.error("Material insert error:", insertError);

      await supabase.storage
        .from(BUCKET_NAME)
        .remove([storagePath]);

      return {
        success: false,
        message:
          "O arquivo foi enviado, mas não foi possível cadastrar o material.",
      };
    }

    revalidatePath("/dashboard/materiais");

    return {
      success: true,
      message: "Material cadastrado com sucesso.",
    };
  } catch (error) {
    console.error("Create material error:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar o material.",
    };
  }
}

export async function updateMaterialStatus(
  materialId: string,
  status: MaterialStatus
) {
  if (!materialId) {
    throw new Error("Material não informado.");
  }

  if (!allowedStatuses.includes(status)) {
    throw new Error("Status inválido.");
  }

  const { supabase, membership } =
    await getAuthenticatedCampaign();

  const { error } = await supabase
    .from("campaign_materials")
    .update({
      status,
    })
    .eq("id", materialId)
    .eq("campaign_id", membership.campaign_id);

  if (error) {
    console.error("Update material status error:", error);

    throw new Error(
      "Não foi possível atualizar o status do material."
    );
  }

  revalidatePath("/dashboard/materiais");
}

export async function toggleOfficialMaterial(
  materialId: string,
  isOfficial: boolean
) {
  if (!materialId) {
    throw new Error("Material não informado.");
  }

  const { supabase, membership } =
    await getAuthenticatedCampaign();

  const { error } = await supabase
    .from("campaign_materials")
    .update({
      is_official: isOfficial,
    })
    .eq("id", materialId)
    .eq("campaign_id", membership.campaign_id);

  if (error) {
    console.error("Toggle official material error:", error);

    throw new Error(
      "Não foi possível atualizar o material oficial."
    );
  }

  revalidatePath("/dashboard/materiais");
}

export async function deleteMaterial(materialId: string) {
  if (!materialId) {
    throw new Error("Material não informado.");
  }

  const { supabase, membership } =
    await getAuthenticatedCampaign();

  const { data: material, error: materialError } =
    await supabase
      .from("campaign_materials")
      .select(`
        id,
        storage_path
      `)
      .eq("id", materialId)
      .eq("campaign_id", membership.campaign_id)
      .maybeSingle();

  if (materialError || !material) {
    throw new Error("Material não encontrado.");
  }

  const { error: storageError } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([material.storage_path]);

  if (storageError) {
    console.error("Delete material file error:", storageError);

    throw new Error(
      "Não foi possível excluir o arquivo do armazenamento."
    );
  }

  const { error: deleteError } = await supabase
    .from("campaign_materials")
    .delete()
    .eq("id", material.id)
    .eq("campaign_id", membership.campaign_id);

  if (deleteError) {
    console.error("Delete material record error:", deleteError);

    throw new Error(
      "O arquivo foi removido, mas não foi possível excluir o cadastro."
    );
  }

  revalidatePath("/dashboard/materiais");
}