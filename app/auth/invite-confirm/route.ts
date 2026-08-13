import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  const tokenHash =
    requestUrl.searchParams.get("token_hash");

  const type =
    requestUrl.searchParams.get("type");

  const origin =
    requestUrl.origin;

  if (
    !tokenHash ||
    type !== "invite"
  ) {
    return NextResponse.redirect(
      `${origin}/login?error=convite-invalido`
    );
  }

  const supabase =
    await createClient();

  const { error } =
    await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "invite",
    });

  if (error) {
    console.error(
      "Erro ao confirmar convite:",
      {
        message: error.message,
        status: error.status,
        code: error.code,
      }
    );

    return NextResponse.redirect(
      `${origin}/login?error=convite-invalido`
    );
  }

  return NextResponse.redirect(
    `${origin}/auth/definir-senha`
  );
}