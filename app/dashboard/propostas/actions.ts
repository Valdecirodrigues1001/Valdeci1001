"use server";

import { revalidatePath } from "next/cache";

import { authorizeAction } from "@/lib/auth/campaign-access";
import {
  getBoolean,
  getNonNegativeInteger,
  getOptionalString,
  getString,
} from "@/lib/form-data";
import { slugify } from "@/lib/slug";
import { createClient } from "@/lib/supabase/server";

export type ProposalActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
};

type CampaignContext = {
  userId: string;
  campaignId: string;
};

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

function validateProposal(
  formData: FormData
): ProposalActionState | null {
  const title = getString(formData, "title");
  const summary = getOptionalString(
    formData,
    "summary"
  );

  const errors: Record<string, string> = {};

  if (title.length < 3) {
    errors.title =
      "O título deve ter pelo menos 3 caracteres.";
  }

  if (title.length > 150) {
    errors.title =
      "O título deve ter no máximo 150 caracteres.";
  }

  if (summary && summary.length > 500) {
    errors.summary =
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
      message: "Revise os campos da proposta.",
      errors,
    };
  }

  return null;
}

async function getCampaignContext(): Promise<CampaignContext> {
  const { authorized, access } = await authorizeAction(
    "proposals.manage"
  );

  if (!authorized) {
    throw new Error(
      "Você não possui permissão para gerenciar propostas."
    );
  }

  return {
    userId: access.userId,
    campaignId: access.campaignId,
  };
}

async function createUniqueProposalSlug(
  title: string,
  campaignId: string
): Promise<string> {
  const supabase = await createClient();

  const baseSlug =
    slugify(title) ||
    `proposta-${crypto.randomUUID().slice(0, 8)}`;

  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const { data, error } = await supabase
      .from("campaign_proposals")
      .select("id")
      .eq("campaign_id", campaignId)
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error(
        "Erro ao verificar slug da proposta:",
        error
      );

      throw new Error(
        "Não foi possível gerar o endereço da proposta."
      );
    }

    if (!data) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

function revalidateProposalRoutes() {
  revalidatePath("/dashboard/propostas");
  revalidatePath("/dashboard/landing-page");
  revalidatePath("/c/[slug]", "page");
}

export async function createProposal(
  _previousState: ProposalActionState,
  formData: FormData
): Promise<ProposalActionState> {
  try {
    const validation = validateProposal(formData);

    if (validation) {
      return validation;
    }

    const supabase = await createClient();
    const { userId, campaignId } =
      await getCampaignContext();

    const title = getString(formData, "title");

    const slug = await createUniqueProposalSlug(
      title,
      campaignId
    );

  const { error } = await supabase
  .from("campaign_proposals")
  .insert({
    campaign_id: campaignId,
    title,
    slug,

    category: getOptionalString(
      formData,
      "category"
    ),

    summary: getOptionalString(
      formData,
      "summary"
    ),

    description:
      getOptionalString(
        formData,
        "summary"
      ) || "",

    content: getOptionalString(
      formData,
      "content"
    ),

    icon: getOptionalString(
      formData,
      "icon"
    ),

    display_order:
      getNonNegativeInteger(
        formData,
        "display_order"
      ),

    is_featured:
      getBoolean(
        formData,
        "is_featured"
      ),

    is_published:
      getBoolean(
        formData,
        "is_published"
      ),

   created_by: userId,
});

   if (error) {
  console.error("Erro ao criar proposta:", {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });

  if (error.code === "23505") {
    return {
      success: false,
      message:
        "Já existe uma proposta com esse endereço.",
    };
  }

  return {
    success: false,
    message:
      "Não foi possível cadastrar a proposta.",
  };
}

    revalidateProposalRoutes();

    return {
      success: true,
      message: "Proposta cadastrada com sucesso.",
    };
  } catch (error) {
    console.error("Erro em createProposal:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Ocorreu um erro inesperado.",
    };
  }
}

export async function updateProposal(
  proposalId: string,
  _previousState: ProposalActionState,
  formData: FormData
): Promise<ProposalActionState> {
  try {
    if (!proposalId) {
      return {
        success: false,
        message: "Proposta inválida.",
      };
    }

    const validation = validateProposal(formData);

    if (validation) {
      return validation;
    }

    const supabase = await createClient();
    const { campaignId } =
      await getCampaignContext();

    const { data: existingProposal, error: findError } =
      await supabase
        .from("campaign_proposals")
        .select("id")
        .eq("id", proposalId)
        .eq("campaign_id", campaignId)
        .maybeSingle();

    if (findError) {
      console.error(
        "Erro ao localizar proposta:",
        findError
      );

      return {
        success: false,
        message:
          "Não foi possível localizar a proposta.",
      };
    }

    if (!existingProposal) {
      return {
        success: false,
        message:
          "A proposta não foi encontrada ou você não possui acesso.",
      };
    }

    const { data: updatedProposal, error } =
      await supabase
        .from("campaign_proposals")
        .update({
          title: getString(formData, "title"),
          category: getOptionalString(
            formData,
            "category"
          ),
          summary: getOptionalString(
            formData,
            "summary"
          ),
          content: getOptionalString(
            formData,
            "content"
          ),
          icon: getOptionalString(
            formData,
            "icon"
          ),
          display_order:
            getNonNegativeInteger(
              formData,
              "display_order"
            ),
          is_featured: getBoolean(
            formData,
            "is_featured"
          ),
          is_published: getBoolean(
            formData,
            "is_published"
          ),
          updated_at: new Date().toISOString(),
        })
        .eq("id", proposalId)
        .eq("campaign_id", campaignId)
        .select("id")
        .maybeSingle();

    if (error) {
      console.error(
        "Erro ao atualizar proposta:",
        error
      );

      return {
        success: false,
        message:
          "Não foi possível salvar as alterações.",
      };
    }

    if (!updatedProposal) {
      return {
        success: false,
        message:
          "Nenhuma proposta foi atualizada.",
      };
    }

    revalidateProposalRoutes();

    return {
      success: true,
      message: "Proposta atualizada com sucesso.",
    };
  } catch (error) {
    console.error("Erro em updateProposal:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Ocorreu um erro inesperado.",
    };
  }
}

export async function toggleProposalPublication(
  proposalId: string
): Promise<ProposalActionState> {
  try {
    if (!proposalId) {
      return {
        success: false,
        message: "Proposta inválida.",
      };
    }

    const supabase = await createClient();
    const { campaignId } =
      await getCampaignContext();

    const { data: proposal, error: findError } =
      await supabase
        .from("campaign_proposals")
        .select("id, is_published")
        .eq("id", proposalId)
        .eq("campaign_id", campaignId)
        .maybeSingle();

    if (findError) {
      console.error(
        "Erro ao buscar publicação da proposta:",
        findError
      );

      return {
        success: false,
        message:
          "Não foi possível localizar a proposta.",
      };
    }

    if (!proposal) {
      return {
        success: false,
        message: "Proposta não encontrada.",
      };
    }

    const nextStatus = !proposal.is_published;

    const { error } = await supabase
      .from("campaign_proposals")
      .update({
        is_published: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", proposalId)
      .eq("campaign_id", campaignId);

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

    revalidateProposalRoutes();

    return {
      success: true,
      message: nextStatus
        ? "Proposta publicada com sucesso."
        : "Proposta movida para rascunho.",
    };
  } catch (error) {
    console.error(
      "Erro em toggleProposalPublication:",
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

export async function toggleProposalFeatured(
  proposalId: string
): Promise<ProposalActionState> {
  try {
    if (!proposalId) {
      return {
        success: false,
        message: "Proposta inválida.",
      };
    }

    const supabase = await createClient();
    const { campaignId } =
      await getCampaignContext();

    const { data: proposal, error: findError } =
      await supabase
        .from("campaign_proposals")
        .select("id, is_featured")
        .eq("id", proposalId)
        .eq("campaign_id", campaignId)
        .maybeSingle();

    if (findError) {
      console.error(
        "Erro ao buscar destaque da proposta:",
        findError
      );

      return {
        success: false,
        message:
          "Não foi possível localizar a proposta.",
      };
    }

    if (!proposal) {
      return {
        success: false,
        message: "Proposta não encontrada.",
      };
    }

    const nextStatus = !proposal.is_featured;

    const { error } = await supabase
      .from("campaign_proposals")
      .update({
        is_featured: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", proposalId)
      .eq("campaign_id", campaignId);

    if (error) {
      console.error(
        "Erro ao alterar destaque:",
        error
      );

      return {
        success: false,
        message:
          "Não foi possível alterar o destaque.",
      };
    }

    revalidateProposalRoutes();

    return {
      success: true,
      message: nextStatus
        ? "Proposta adicionada aos destaques."
        : "Proposta removida dos destaques.",
    };
  } catch (error) {
    console.error(
      "Erro em toggleProposalFeatured:",
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

export async function deleteProposal(
  proposalId: string
): Promise<ProposalActionState> {
  try {
    if (!proposalId) {
      return {
        success: false,
        message: "Proposta inválida.",
      };
    }

    const supabase = await createClient();
    const { campaignId } =
      await getCampaignContext();

    const { data: deletedProposal, error } =
      await supabase
        .from("campaign_proposals")
        .delete()
        .eq("id", proposalId)
        .eq("campaign_id", campaignId)
        .select("id")
        .maybeSingle();

    if (error) {
      console.error(
        "Erro ao excluir proposta:",
        error
      );

      return {
        success: false,
        message:
          "Não foi possível excluir a proposta.",
      };
    }

    if (!deletedProposal) {
      return {
        success: false,
        message:
          "A proposta não foi encontrada ou você não possui acesso.",
      };
    }

    revalidateProposalRoutes();

    return {
      success: true,
      message: "Proposta excluída com sucesso.",
    };
  } catch (error) {
    console.error("Erro em deleteProposal:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Ocorreu um erro inesperado.",
    };
  }
}