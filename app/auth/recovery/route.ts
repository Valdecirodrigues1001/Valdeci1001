import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  const code =
    requestUrl.searchParams.get("code");

  const origin =
    requestUrl.origin;

  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=recuperacao-invalida`
    );
  }

  const supabase =
    await createClient();

  const { error } =
    await supabase.auth.exchangeCodeForSession(
      code
    );

  if (error) {
    console.error(
      "Erro ao confirmar recuperação:",
      {
        message: error.message,
        status: error.status,
        code: error.code,
      }
    );

    return NextResponse.redirect(
      `${origin}/login?error=recuperacao-invalida`
    );
  }

  return NextResponse.redirect(
    `${origin}/auth/redefinir-senha`
  );
}