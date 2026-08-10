"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type PublicSupportFormState = {
  success?: string;
  error?: string;
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

function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string): boolean {
  if (!value) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function buildNotes(
  participationType: string,
  message: string
): string | null {
  const notes: string[] = [];

  if (participationType) {
    notes.push(
      `Interesse informado pela Landing Page: ${participationType}.`
    );
  }

  if (message) {
    notes.push(`Mensagem: ${message}`);
  }

  return notes.length > 0
    ? notes.join("\n\n")
    : null;
}

export async function submitPublicSupportForm(
  slug: string,
  _previousState: PublicSupportFormState,
  formData: FormData
): Promise<PublicSupportFormState> {
  try {
    const supabase = await createClient();

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

    const participationType = getString(
      formData,
      "participation_type"
    );

    const message = getString(
      formData,
      "message"
    );

    const whatsapp = normalizePhone(
      whatsappInput
    );

    const phone = normalizePhone(
      phoneInput
    );

    const email = normalizeEmail(
      emailInput
    );

    const notes = buildNotes(
      participationType,
      message
    );

    const errors: PublicSupportFormState["errors"] =
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

    if (Object.keys(errors).length > 0) {
      return {
        error: "Revise os campos destacados.",
        errors,
      };
    }

    const {
      data: landing,
      error: landingError,
    } = await supabase
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

    const {
      data: existingByWhatsapp,
      error: whatsappCheckError,
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
      .eq("whatsapp", whatsapp)
      .is("deleted_at", null)
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

    if (existingByWhatsapp) {
      const { error: updateError } = await supabase
        .from("supporters")
        .update({
          full_name: fullName,
          whatsapp,
          phone: phone || null,
          email: email || null,
          city: city || null,
          neighborhood: neighborhood || null,
          status: "lead",
          origin: "landing_page",
          crm_stage: "new",
          notes,
          is_active: true,
        })
        .eq("id", existingByWhatsapp.id)
        .eq(
          "campaign_id",
          landing.campaign_id
        )
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

      const { error: activityError } =
        await supabase
          .from("supporter_activities")
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
              participationType
                ? `Contato atualizado com interesse em: ${participationType}.`
                : "O contato confirmou seu apoio pelo formulário público.",
          });

      if (activityError) {
        console.error(
          "Erro ao registrar confirmação:",
          activityError
        );
      }

      revalidatePath("/dashboard");
      revalidatePath(
        "/dashboard/apoiadores"
      );

      return {
        success:
          "Cadastro confirmado com sucesso! Nossa equipe entrará em contato.",
      };
    }

    if (email) {
      const {
        data: existingByEmail,
        error: emailCheckError,
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
        .eq("email", email)
        .is("deleted_at", null)
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

      if (existingByEmail) {
        const { error: updateError } =
          await supabase
            .from("supporters")
            .update({
              full_name: fullName,
              whatsapp,
              phone: phone || null,
              email,
              city: city || null,
              neighborhood:
                neighborhood || null,
              status: "lead",
              origin: "landing_page",
              crm_stage: "new",
              notes,
              is_active: true,
            })
            .eq("id", existingByEmail.id)
            .eq(
              "campaign_id",
              landing.campaign_id
            )
            .is("deleted_at", null);

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

        const { error: activityError } =
          await supabase
            .from("supporter_activities")
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
                participationType
                  ? `Contato atualizado com interesse em: ${participationType}.`
                  : "O contato confirmou seu apoio pelo formulário público.",
            });

        if (activityError) {
          console.error(
            "Erro ao registrar confirmação:",
            activityError
          );
        }

        revalidatePath("/dashboard");
        revalidatePath(
          "/dashboard/apoiadores"
        );

        return {
          success:
            "Cadastro confirmado com sucesso! Nossa equipe entrará em contato.",
        };
      }
    }

    const {
      data: supporter,
      error: insertError,
    } = await supabase
      .from("supporters")
      .insert({
        campaign_id:
          landing.campaign_id,

        full_name: fullName,

        whatsapp,

        phone: phone || null,

        email: email || null,

        city: city || null,

        neighborhood:
          neighborhood || null,

        status: "lead",

        origin: "landing_page",

        crm_stage: "new",

        notes,

        is_active: true,

        deleted_at: null,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error(
        "Erro ao cadastrar apoio:",
        insertError
      );

      return {
        error:
          "Não foi possível concluir seu cadastro. Tente novamente em alguns instantes.",
      };
    }

    const { error: activityError } =
      await supabase
        .from("supporter_activities")
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
            participationType
              ? `Novo contato interessado em: ${participationType}.`
              : "Novo contato recebido pelo formulário público da campanha.",
        });

    if (activityError) {
      console.error(
        "Erro ao registrar atividade inicial:",
        activityError
      );
    }

    revalidatePath("/dashboard");
    revalidatePath(
      "/dashboard/apoiadores"
    );
    revalidatePath(
      `/c/${landing.slug}`
    );

    return {
      success:
        "Cadastro recebido com sucesso! Nossa equipe entrará em contato.",
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