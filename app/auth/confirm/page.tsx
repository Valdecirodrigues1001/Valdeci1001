import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ConfirmPageProps = {
  searchParams: Promise<{
    code?: string;
    next?: string;
  }>;
};

export default async function ConfirmPage({
  searchParams,
}: ConfirmPageProps) {
  const params = await searchParams;

  if (params.code) {
    const supabase = await createClient();

    const { error } =
      await supabase.auth.exchangeCodeForSession(
        params.code
      );

    if (!error) {
      redirect(params.next ?? "/dashboard");
    }
  }

  redirect("/login?error=convite-invalido");
}