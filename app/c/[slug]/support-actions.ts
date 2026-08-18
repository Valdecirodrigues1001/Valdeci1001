"use server";

import { revalidatePath } from "next/cache";

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
    email?: string;
    city?: string;
  };
};

function getString(
  formData: FormData,
  field: string
): string {
  const value = formData.get(field);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function normalizePhone(
  value: string
): string {
  return value.replace(/\D/g, "");
}

function normalizeEmail(
  value: string
): string {
  return value.trim().toLowerCase();
}

function isValidEmail(
  value: string
): boolean {
  if (!value) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value
  );
}

/*
 * Identifica o DDD tanto em:
 *
 * 51999999999
 *
 * quanto em:
 *
 * 5551999999999
 */
function getDDD(
  phone: string
): string | null {
  const normalized =
    normalizePhone(phone);

  if (!normalized) {
    return null;
  }

  /*
   * Número brasileiro com código
   * do país 55.
   */
  if (
    normalized.startsWith("55") &&
    normalized.length >= 12
  ) {
    return normalized.slice(2, 4);
  }

  /*
   * Número informado somente
   * com DDD + telefone.
   */
  if (normalized.length >= 10) {
    return normalized.slice(0, 2);
  }

  return null;
}

function buildNotes(
  participationType: string,
  message: string,
  regionalAreaName?: string | null
): string | null {
  const notes: string[] = [];

  if (participationType) {
    notes.push(
      `Interesse informado pela Landing Page: ${participationType}.`
    );
  }

  if (regionalAreaName) {
    notes.push(
      `Região identificada automaticamente pelo DDD: ${regionalAreaName}.`
    );
  }

  if (message) {
    notes.push(
      `Mensagem: ${message}`
    );
  }

  return notes.length > 0
    ? notes.join("\n\n")
    : null;
}

type RegionalArea = {
  id: string;
  name: string;
  ddd: string | null;
  whatsapp_group_url:
    | string
    | null;
};

export async function submitPublicSupportForm(
  slug: string,
  _previousState: PublicSupportFormState,
  formData: FormData
): Promise<PublicSupportFormState> {
  try {
    /*
     * Esta é uma Server Action.
     *
     * Usamos o cliente administrativo
     * somente no servidor para permitir
     * o cadastro público sem abrir
     * policies anon na tabela supporters.
     */
    const supabase =
      createAdminClient();

    const fullName = getString(
      formData,
      "full_name"
    );

    const whatsappInput = getString(
      formData,
      "whatsapp"
    );

    const phoneInput = getString(
      formData,
      "phone"
    );

    const emailInput = getString(
      formData,
      "email"
    );

    const city = getString(
      formData,
      "city"
    );

    const neighborhood = getString(
      formData,
      "neighborhood"
    );

    const participationType =
      getString(
        formData,
        "participation_type"
      );

    const message = getString(
      formData,
      "message"
    );

    const whatsapp =
      normalizePhone(
        whatsappInput
      );

    const phone =
      normalizePhone(
        phoneInput
      );

    const email =
      normalizeEmail(
        emailInput
      );

    const errors:
      PublicSupportFormState["errors"] =
      {};

    if (!fullName) {
      errors.full_name =
        "Informe seu nome completo.";
    }

    if (!whatsapp) {
      errors.whatsapp =
        "Informe seu WhatsApp.";
    } else if (
      whatsapp.length < 10 ||
      whatsapp.length > 13
    ) {
      errors.whatsapp =
        "Informe um WhatsApp válido com DDD.";
    }

    if (!isValidEmail(email)) {
      errors.email =
        "Informe um e-mail válido.";
    }

    if (
      Object.keys(errors).length >
      0
    ) {
      return {
        error:
          "Revise os campos destacados.",
        errors,
      };
    }

    /*
     * Localiza a campanha pela Landing.
     */
    const {
      data: landing,
      error: landingError,
    } = await supabase
      .from(
        "campaign_landing_pages"
      )
      .select(`
        id,
        campaign_id,
        slug,
        public_name,
        is_published
      `)
      .eq("slug", slug)
      .eq(
        "is_published",
        true
      )
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
     * =====================================================
     * IDENTIFICAÇÃO AUTOMÁTICA DA REGIÃO PELO DDD
     * =====================================================
     */

    const ddd =
      getDDD(whatsapp);

    let regionalArea:
      | RegionalArea
      | null = null;

    if (ddd) {
      const {
        data: area,
        error: areaError,
      } = await supabase
        .from("campaign_areas")
        .select(`
          id,
          name,
          ddd,
          whatsapp_group_url
        `)
        .eq(
          "campaign_id",
          landing.campaign_id
        )
        .eq("ddd", ddd)
        .eq(
          "is_active",
          true
        )
        .limit(1)
        .maybeSingle();

      if (areaError) {
        /*
         * Falha na busca da área não
         * impede o cadastro.
         */
        console.error(
          "Erro ao identificar região pelo DDD:",
          {
            ddd,
            message:
              areaError.message,
            code:
              areaError.code,
            details:
              areaError.details,
            hint:
              areaError.hint,
          }
        );
      } else if (area) {
        regionalArea =
          area as RegionalArea;
      }
    }

    const areaId =
      regionalArea?.id ?? null;

    const groupUrl =
      regionalArea
        ?.whatsapp_group_url ??
      null;

    const groupName =
      regionalArea?.name ??
      null;

    const notes =
      buildNotes(
        participationType,
        message,
        groupName
      );

    /*
     * =====================================================
     * VERIFICA CADASTRO EXISTENTE PELO WHATSAPP
     * =====================================================
     */

    const {
      data:
        existingByWhatsapp,
      error:
        whatsappCheckError,
    } = await supabase
      .from("supporters")
      .select(`
        id,
        is_active,
        status
      `)
      .eq(
        "campaign_id",
        landing.campaign_id
      )
      .eq(
        "whatsapp",
        whatsapp
      )
      .is(
        "deleted_at",
        null
      )
      .limit(1)
      .maybeSingle();

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
     * Já existe pelo WhatsApp:
     * atualiza o cadastro.
     */
    if (existingByWhatsapp) {
      const {
        error: updateError,
      } = await supabase
        .from("supporters")
        .update({
          full_name:
            fullName,

          whatsapp,

          phone:
            phone || null,

          email:
            email || null,

          city:
            city || null,

          neighborhood:
            neighborhood ||
            null,

          area_id:
            areaId,

          status:
            "lead",

          origin:
            "landing_page",

          crm_stage:
            "new",

          notes,

          is_active:
            true,
        })
        .eq(
          "id",
          existingByWhatsapp.id
        )
        .eq(
          "campaign_id",
          landing.campaign_id
        )
        .is(
          "deleted_at",
          null
        );

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

      const {
        error: activityError,
      } = await supabase
        .from(
          "supporter_activities"
        )
        .insert({
          campaign_id:
            landing.campaign_id,

          supporter_id:
            existingByWhatsapp.id,

          activity_type:
            "updated",

          title:
            "Contato confirmado pela Landing Page",

          description:
            groupName
              ? participationType
                ? `Contato atualizado com interesse em: ${participationType}. Região identificada: ${groupName}.`
                : `O contato confirmou seu apoio pelo formulário público. Região identificada: ${groupName}.`
              : participationType
                ? `Contato atualizado com interesse em: ${participationType}.`
                : "O contato confirmou seu apoio pelo formulário público.",
        });

      if (activityError) {
        console.error(
          "Erro ao registrar confirmação:",
          activityError
        );
      }

      revalidatePath(
        "/dashboard"
      );

      revalidatePath(
        "/dashboard/apoiadores"
      );

      revalidatePath(
        "/dashboard/crm"
      );

      revalidatePath(
        "/dashboard/mobilizacao"
      );

      return {
        success:
          "Cadastro confirmado com sucesso! Nossa equipe entrará em contato.",

        groupUrl,
        groupName,
      };
    }

    /*
     * =====================================================
     * VERIFICA CADASTRO EXISTENTE PELO E-MAIL
     * =====================================================
     */

    if (email) {
      const {
        data:
          existingByEmail,
        error:
          emailCheckError,
      } = await supabase
        .from("supporters")
        .select(`
          id,
          is_active,
          status
        `)
        .eq(
          "campaign_id",
          landing.campaign_id
        )
        .eq(
          "email",
          email
        )
        .is(
          "deleted_at",
          null
        )
        .limit(1)
        .maybeSingle();

      if (emailCheckError) {
        console.error(
          "Erro ao verificar e-mail:",
          emailCheckError
        );

        return {
          error:
            "Não foi possível validar seu cadastro.",
        };
      }

      /*
       * Já existe pelo e-mail:
       * atualiza o cadastro.
       */
      if (existingByEmail) {
        const {
          error: updateError,
        } = await supabase
          .from("supporters")
          .update({
            full_name:
              fullName,

            whatsapp,

            phone:
              phone || null,

            email,

            city:
              city || null,

            neighborhood:
              neighborhood ||
              null,

            area_id:
              areaId,

            status:
              "lead",

            origin:
              "landing_page",

            crm_stage:
              "new",

            notes,

            is_active:
              true,
          })
          .eq(
            "id",
            existingByEmail.id
          )
          .eq(
            "campaign_id",
            landing.campaign_id
          )
          .is(
            "deleted_at",
            null
          );

        if (updateError) {
          console.error(
            "Erro ao atualizar apoiador pelo e-mail:",
            updateError
          );

          return {
            error:
              "Não foi possível atualizar seu cadastro.",
          };
        }

        const {
          error: activityError,
        } = await supabase
          .from(
            "supporter_activities"
          )
          .insert({
            campaign_id:
              landing.campaign_id,

            supporter_id:
              existingByEmail.id,

            activity_type:
              "updated",

            title:
              "Contato confirmado pela Landing Page",

            description:
              groupName
                ? participationType
                  ? `Contato atualizado com interesse em: ${participationType}. Região identificada: ${groupName}.`
                  : `O contato confirmou seu apoio pelo formulário público. Região identificada: ${groupName}.`
                : participationType
                  ? `Contato atualizado com interesse em: ${participationType}.`
                  : "O contato confirmou seu apoio pelo formulário público.",
          });

        if (activityError) {
          console.error(
            "Erro ao registrar confirmação:",
            activityError
          );
        }

        revalidatePath(
          "/dashboard"
        );

        revalidatePath(
          "/dashboard/apoiadores"
        );

        revalidatePath(
          "/dashboard/crm"
        );

        revalidatePath(
          "/dashboard/mobilizacao"
        );

        return {
          success:
            "Cadastro confirmado com sucesso! Nossa equipe entrará em contato.",

          groupUrl,
          groupName,
        };
      }
    }

    /*
     * =====================================================
     * NOVO APOIADOR
     * =====================================================
     */

    const {
      data: supporter,
      error: insertError,
    } = await supabase
      .from("supporters")
      .insert({
        campaign_id:
          landing.campaign_id,

        full_name:
          fullName,

        whatsapp,

        phone:
          phone || null,

        email:
          email || null,

        city:
          city || null,

        neighborhood:
          neighborhood ||
          null,

        /*
         * A área já entra
         * automaticamente no CRM.
         */
        area_id:
          areaId,

        status:
          "lead",

        origin:
          "landing_page",

        crm_stage:
          "new",

        notes,

        is_active:
          true,

        deleted_at:
          null,
      })
      .select("id")
      .single();

    if (
      insertError ||
      !supporter
    ) {
      console.error(
        "Erro ao cadastrar apoio:",
        JSON.stringify(
          {
            message:
              insertError?.message,
            code:
              insertError?.code,
            details:
              insertError?.details,
            hint:
              insertError?.hint,
          },
          null,
          2
        )
      );

      return {
        error:
          insertError?.message
            ? `Erro ao cadastrar: ${insertError.message}`
            : "Não foi possível concluir seu cadastro.",
      };
    }

    /*
     * Atividade inicial.
     */
    const {
      error: activityError,
    } = await supabase
      .from(
        "supporter_activities"
      )
      .insert({
        campaign_id:
          landing.campaign_id,

        supporter_id:
          supporter.id,

        activity_type:
          "created",

        title:
          "Cadastro pela Landing Page",

        description:
          groupName
            ? participationType
              ? `Novo contato interessado em: ${participationType}. Região identificada automaticamente: ${groupName}.`
              : `Novo contato recebido pelo formulário público da campanha. Região identificada automaticamente: ${groupName}.`
            : participationType
              ? `Novo contato interessado em: ${participationType}.`
              : "Novo contato recebido pelo formulário público da campanha.",
      });

    if (activityError) {
      console.error(
        "Erro ao registrar atividade inicial:",
        activityError
      );
    }

    revalidatePath(
      "/dashboard"
    );

    revalidatePath(
      "/dashboard/apoiadores"
    );

    revalidatePath(
      "/dashboard/crm"
    );

    revalidatePath(
      "/dashboard/mobilizacao"
    );

    revalidatePath(
      `/c/${landing.slug}`
    );

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