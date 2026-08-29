import {
  NextResponse,
  type NextRequest,
} from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

function normalizeHostname(
  hostname: string
): string {
  return hostname
    .split(":")[0]
    .toLowerCase()
    .replace(/^www\./, "");
}

function isAtlasSystemDomain(
  hostname: string
): boolean {
  return (
    hostname === "localhost" ||
    hostname.endsWith(".vercel.app")
  );
}

/*
 * Cache em memória para a resolução domínio -> slug.
 *
 * A cada request em domínio próprio o proxy fazia uma
 * chamada à REST do Supabase. Aqui guardamos o resultado
 * (inclusive o negativo) por um curto período. Em serverless
 * cada isolate tem seu próprio cache, o que já elimina a
 * maior parte das chamadas repetidas.
 */
type DomainCacheEntry = {
  slug: string | null;
  expiresAt: number;
};

const DOMAIN_CACHE_TTL_MS = 60_000;
const DOMAIN_CACHE_MAX_ENTRIES = 500;

const domainSlugCache = new Map<
  string,
  DomainCacheEntry
>();

function readDomainCache(
  hostname: string
): DomainCacheEntry | null {
  const entry = domainSlugCache.get(hostname);

  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    domainSlugCache.delete(hostname);

    return null;
  }

  return entry;
}

function writeDomainCache(
  hostname: string,
  slug: string | null
) {
  if (
    domainSlugCache.size >=
    DOMAIN_CACHE_MAX_ENTRIES
  ) {
    const now = Date.now();

    for (const [key, entry] of domainSlugCache) {
      if (entry.expiresAt <= now) {
        domainSlugCache.delete(key);
      }
    }

    if (
      domainSlugCache.size >=
      DOMAIN_CACHE_MAX_ENTRIES
    ) {
      domainSlugCache.clear();
    }
  }

  domainSlugCache.set(hostname, {
    slug,
    expiresAt: Date.now() + DOMAIN_CACHE_TTL_MS,
  });
}

async function getLandingSlugByDomain(
  hostname: string
): Promise<string | null> {
  const cached = readDomainCache(hostname);

  if (cached) {
    return cached.slug;
  }

  const slug =
    await fetchLandingSlugByDomain(hostname);

  writeDomainCache(hostname, slug);

  return slug;
}

async function fetchLandingSlugByDomain(
  hostname: string
): Promise<string | null> {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "Variáveis públicas do Supabase não configuradas."
    );

    return null;
  }

  try {
    const url = new URL(
      "/rest/v1/campaign_landing_pages",
      supabaseUrl
    );

    url.searchParams.set(
      "select",
      "slug"
    );

    url.searchParams.set(
      "custom_domain",
      `eq.${hostname}`
    );

    url.searchParams.set(
      "is_published",
      "eq.true"
    );

    url.searchParams.set(
      "limit",
      "1"
    );

    const response = await fetch(
      url.toString(),
      {
        headers: {
          apikey: supabaseKey,
          Authorization:
            `Bearer ${supabaseKey}`,
        },

        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error(
        "Erro ao buscar domínio da Landing:",
        response.status,
        await response.text()
      );

      return null;
    }

    const data = (await response.json()) as {
      slug: string;
    }[];

    return data[0]?.slug ?? null;
  } catch (error) {
    console.error(
      "Erro ao resolver domínio personalizado:",
      error
    );

    return null;
  }
}

function copySessionCookies(
  source: NextResponse,
  destination: NextResponse
) {
  for (const cookie of source.cookies.getAll()) {
    destination.cookies.set(cookie);
  }
}

export async function proxy(
  request: NextRequest
) {
  /*
   * Mantemos exatamente a atualização
   * da sessão que o Atlas já utilizava.
   */
  const sessionResponse =
    await updateSession(request);

  const hostname =
    normalizeHostname(
      request.headers.get("host") ?? ""
    );

  const pathname =
    request.nextUrl.pathname;

  /*
   * localhost e domínio padrão da Vercel
   * continuam funcionando normalmente.
   */
  if (
    !hostname ||
    isAtlasSystemDomain(hostname)
  ) {
    return sessionResponse;
  }

  /*
   * Não fazemos rewrite de rotas internas
   * necessárias ao próprio Next.js.
   */
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api")
  ) {
    return sessionResponse;
  }

  const slug =
    await getLandingSlugByDomain(
      hostname
    );

  /*
   * Se o domínio não estiver associado
   * a nenhuma campanha, segue normalmente.
   */
  if (!slug) {
    return sessionResponse;
  }

  /*
   * Evita rewrite duplicado.
   */
  if (
    pathname.startsWith(
      `/c/${slug}`
    )
  ) {
    return sessionResponse;
  }

  const rewriteUrl =
    request.nextUrl.clone();

  /*
   * Na raiz:
   *
   * candidato.com.br
   *
   * vira internamente:
   *
   * /c/slug
   */
  if (pathname === "/") {
    rewriteUrl.pathname =
      `/c/${slug}`;
  } else {
    /*
     * Prepara também URLs públicas futuras:
     *
     * candidato.com.br/propostas
     * candidato.com.br/noticias/xyz
     *
     * internamente:
     *
     * /c/slug/propostas
     * /c/slug/noticias/xyz
     */
    rewriteUrl.pathname =
      `/c/${slug}${pathname}`;
  }

  const rewriteResponse =
    NextResponse.rewrite(
      rewriteUrl
    );

  /*
   * Copia para a resposta do rewrite
   * qualquer cookie que o Supabase tenha
   * atualizado no updateSession().
   */
  copySessionCookies(
    sessionResponse,
    rewriteResponse
  );

  return rewriteResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};