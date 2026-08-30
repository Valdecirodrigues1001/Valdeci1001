"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { getString } from "@/lib/form-data";
import { checkRateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

export type PublicSupportFormState = {
  success?: string;
  error?: string;

  /*
   * Grupo regional identificado
   * automaticamente pelo DDD.
   */
  groupUrl?: string | null;
  groupName?: string | null;

  errors?: {
    full_name?: string;
    whatsapp?: string;
  };
};

function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

/*
 * Identifica o DDD tanto em:
 *
 *   51999999999
 *
 * quanto em:
 *
 *   5551999999999
 */
function getDDD(phone: string): string | null {
  const normalized = normalizePhone(phone);

  if (!normalized) {
    return null;
  }

  /* Número brasileiro com código do país 55. */
  if (
    normalized.startsWith("55") &&
    normalized.length >= 12
  ) {
    return normalized.slice(2, 4);
  }

  /* Número informado somente com DDD + telefone. */
  if (normalized.length >= 10) {
    return normalized.slice(0, 2);
  }

  return null;
}

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

/*
 * Monta a nota do apoiador com a região identificada
 * pelo DDD e a origem do anúncio (UTMs), quando houver.
 */
function buildLeadNote(
  formData: FormData,
  regionalAreaName?: string | null
): string | null {
  const parts: string[] = [];

  if (regionalAreaName) {
    parts.push(
      `Região identificada automaticamente pelo DDD: ${regionalAreaName}.`
    );
  }

  const utmParts = UTM_KEYS.map((key) => {
    const value = getString(formData, key);
    return value ? `${key}=${value}` : null;
  }).filter(Boolean);

  if (utmParts.length > 0) {
    parts.push(
      `Origem do anúncio: ${utmParts.join(", ")}.`
    );
  }

  return parts.length > 0 ? parts.join("\n\n") : null;
}

type RegionalArea = {
  id: string;
  name: string;
  ddd: string | null;
  whatsapp_group_url: string | null;
};

type ExistingSupporter = {
  id: string;
  full_name: string | null;
  city: string | null;
  area_id: string | null;
  notes: string | null;
};

const EXISTING_SUPPORTER_COLUMNS = `
  id,
  full_name,
  city,
  area_id,
  notes
`;

/*
 * A atualização a partir do formulário público é
 * NÃO destrutiva: apenas preenche campos vazios e
 * anexa a nota de região às observações. Status,
 * estágio do CRM e o flag is_active nunca são
 * alterados por aqui — isso é responsabilidade da
 * equipe no painel.
 */
function buildPublicUpdatePatch(
  existing: ExistingSupporter,
  incoming: {
    fullName: string;
    city: string;
    areaId: string | null;
    note: string | null;
  }
): Record<string, unknown> {
  const fillIfEmpty = (
    current: string | null,
    value: string
  ) =>
    current && current.trim()
      ? current
      : value || null;

  const patch: Record<string, unknown> = {
    full_name: fillIfEmpty(
      existing.full_name,
      incoming.fullName
    ),
    city: fillIfEmpty(existing.city, incoming.city),
    area_id: existing.area_id ?? incoming.areaId,
  };

  if (incoming.note) {
    patch.notes = existing.notes
      ? `${existing.notes}\n\n---\n${incoming.note}`
      : incoming.note;
  }

  return patch;
}

export async function submitPublicSupportForm(
  slug: string,
  _previousState: PublicSupportFormState,
  formData: FormData
): Promise<PublicSupportFormState> {
  try {
    /*
     * Esta é uma Server Action. Usamos o cliente
     * administrativo somente no servidor para permitir
     * o cadastro público sem abrir policies anon na
     * tabela supporters.
     */
    const supabase = createAdminClient();

    /*
     * Honeypot: bots tendem a preencher todos os campos.
     * Este campo fica oculto para humanos. Retornamos um
     * "sucesso" falso para não sinalizar a rejeição.
     */
    if (getString(formData, "website")) {
      return {
        success:
          "Cadastro recebido com sucesso! Nossa equipe entrará em contato.",
      };
    }

    /*
     * Rate limit best-effort por IP (ver lib/rate-limit.ts).
     */
    const requestHeaders = await headers();

    const forwardedFor =
      requestHeaders.get("x-forwarded-for") ?? "";

    const clientIp =
      forwardedFor.split(",")[0]?.trim() ||
      requestHeaders.get("x-real-ip") ||
      "desconhecido";

    const rateLimit = checkRateLimit(
      `support-form:${slug}:${clientIp}`,
      5,
      600
    );

    if (!rateLimit.allowed) {
      return {
        error:
          "Recebemos muitas tentativas deste dispositivo. Aguarde alguns minutos e tente novamente.",
      };
    }

    const fullName = getString(formData, "full_name");
    const whatsappInput = getString(
      formData,
      "whatsapp"
    );
    const city = getString(formData, "city");

    const whatsapp = normalizePhone(whatsappInput);

    const errors: PublicSupportFormState["errors"] = {};

    if (!fullName) {
      errors.full_name = "Informe seu nome completo.";
    }

    if (!whatsapp) {
      errors.whatsapp = "Informe seu WhatsApp.";
    } else if (
      whatsapp.length < 10 ||
      whatsapp.length > 13
    ) {
      errors.whatsapp =
        "Informe um WhatsApp válido com DDD.";
    }

    if (Object.keys(errors).length > 0) {
      return {
        error: "Revise os campos destacados.",
        errors,
      };
    }

    /*
     * Localiza a campanha pela Landing.
     */
    const { data: landing, error: landingError } =
      await supabase
        .from("campaign_landing_pages")
        .select(`
          id,
          campaign_id,
          slug,
          public_name,
          is_published
        `)
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

    if (landingError) {
      console.error(
        "Erro ao localizar Landing Page:",
        landingError
      );

      return {
        error:
          "Não foi possível identificar a campanha.",
      };
    }

    if (!landing?.campaign_id) {
      return {
        error:
          "Esta campanha não está disponível no momento.",
      };
    }

    /*
     * Proteção contra flood na campanha: limita o volume
     * de cadastros públicos recebidos numa janela curta.
     */
    const burstWindowStart = new Date(
      Date.now() - 60_000
    ).toISOString();

    const { count: recentPublicCount } = await supabase
      .from("supporters")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("campaign_id", landing.campaign_id)
      .eq("origin", "landing_page")
      .gte("created_at", burstWindowStart);

    if ((recentPublicCount ?? 0) >= 15) {
      return {
        error:
          "Estamos recebendo muitos cadastros agora. Tente novamente em instantes.",
      };
    }

    /*
     * =====================================================
     * IDENTIFICAÇÃO AUTOMÁTICA DA REGIÃO PELO DDD
     * =====================================================
     */

    const ddd = getDDD(whatsapp);

    let regionalArea: RegionalArea | null = null;

    if (ddd) {
      const { data: area, error: areaError } =
        await supabase
          .from("campaign_areas")
          .select(`
            id,
            name,
            ddd,
            whatsapp_group_url
          `)
          .eq("campaign_id", landing.campaign_id)
          .eq("ddd", ddd)
          .eq("is_active", true)
          .limit(1)
          .maybeSingle();

      if (areaError) {
        /* Falha na busca da área não impede o cadastro. */
        console.error(
          "Erro ao identificar região pelo DDD:",
          {
            ddd,
            message: areaError.message,
            code: areaError.code,
            details: areaError.details,
            hint: areaError.hint,
          }
        );
      } else if (area) {
        regionalArea = area as RegionalArea;
      }
    }

    const areaId = regionalArea?.id ?? null;
    const groupUrl =
      regionalArea?.whatsapp_group_url ?? null;
    const groupName = regionalArea?.name ?? null;

    const note = buildLeadNote(formData, groupName);

    /*
     * =====================================================
     * VERIFICA CADASTRO EXISTENTE PELO WHATSAPP
     * =====================================================
     */

    const {
      data: existingByWhatsapp,
      error: whatsappCheckError,
    } = await supabase
      .from("supporters")
      .select(EXISTING_SUPPORTER_COLUMNS)
      .eq("campaign_id", landing.campaign_id)
      .eq("whatsapp", whatsapp)
      .is("deleted_at", null)
      .limit(1)
      .maybeSingle<ExistingSupporter>();

    if (whatsappCheckError) {
      console.error(
        "Erro ao verificar WhatsApp:",
        whatsappCheckError
      );

      return {
        error:
          "Não foi possível validar seu cadastro.",
      };
    }

    /*
     * Já existe pelo WhatsApp: atualiza o cadastro.
     */
    if (existingByWhatsapp) {
      const { error: updateError } = await supabase
        .from("supporters")
        .update(
          buildPublicUpdatePatch(existingByWhatsapp, {
            fullName,
            city,
            areaId,
            note,
          })
        )
        .eq("id", existingByWhatsapp.id)
        .eq("campaign_id", landing.campaign_id)
        .is("deleted_at", null);

      if (updateError) {
        console.error(
          "Erro ao atualizar apoiador existente:",
          updateError
        );

        return {
          error:
            "Não foi possível atualizar seu cadastro.",
        };
      }

      const { error: activityError } = await supabase
        .from("supporter_activities")
        .insert({
          campaign_id: landing.campaign_id,
          supporter_id: existingByWhatsapp.id,
          activity_type: "updated",
          title:
            "Contato confirmado pela Landing Page",
          description: groupName
            ? `O contato confirmou seu apoio pelo formulário público. Região identificada: ${groupName}.`
            : "O contato confirmou seu apoio pelo formulário público.",
        });

      if (activityError) {
        console.error(
          "Erro ao registrar confirmação:",
          activityError
        );
      }

      revalidatePath("/dashboard");
      revalidatePath("/dashboard/apoiadores");
      revalidatePath("/dashboard/crm");
      revalidatePath("/dashboard/mobilizacao");

      return {
        success:
          "Cadastro confirmado com sucesso! Nossa equipe entrará em contato.",
        groupUrl,
        groupName,
      };
    }

    /*
     * =====================================================
     * NOVO APOIADOR
     * =====================================================
     */

    const { data: supporter, error: insertError } =
      await supabase
        .from("supporters")
        .insert({
          campaign_id: landing.campaign_id,
          full_name: fullName,
          whatsapp,
          city: city || null,

          /* A área já entra automaticamente no CRM. */
          area_id: areaId,

          status: "lead",
          origin: "landing_page",
          crm_stage: "new",
          notes: note,
          is_active: true,
          deleted_at: null,
        })
        .select("id")
        .single();

    if (insertError || !supporter) {
      console.error(
        "Erro ao cadastrar apoio:",
        JSON.stringify(
          {
            message: insertError?.message,
            code: insertError?.code,
            details: insertError?.details,
            hint: insertError?.hint,
          },
          null,
          2
        )
      );

      return {
        error:
          "Não foi possível concluir seu cadastro. Tente novamente.",
      };
    }

    /*
     * Atividade inicial.
     */
    const { error: activityError } = await supabase
      .from("supporter_activities")
      .insert({
        campaign_id: landing.campaign_id,
        supporter_id: supporter.id,
        activity_type: "created",
        title: "Cadastro pela Landing Page",
        description: groupName
          ? `Novo contato recebido pelo formulário público da campanha. Região identificada automaticamente: ${groupName}.`
          : "Novo contato recebido pelo formulário público da campanha.",
      });

    if (activityError) {
      console.error(
        "Erro ao registrar atividade inicial:",
        activityError
      );
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/apoiadores");
    revalidatePath("/dashboard/crm");
    revalidatePath("/dashboard/mobilizacao");
    revalidatePath(`/c/${landing.slug}`);

    return {
      success:
        "Cadastro recebido com sucesso! Nossa equipe entrará em contato.",
      groupUrl,
      groupName,
    };
  } catch (error) {
    console.error(
      "Erro em submitPublicSupportForm:",
      error
    );

    return {
      error:
        "Ocorreu um erro inesperado. Tente novamente.",
    };
  }
}
