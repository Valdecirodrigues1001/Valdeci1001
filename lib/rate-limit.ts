type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

/*
 * Rate limiter em memória, best-effort.
 *
 * Em ambientes serverless cada instância mantém o próprio
 * mapa e instâncias são recicladas com frequência, portanto
 * isto NÃO substitui um limitador central (ex.: Upstash/Redis).
 * Serve como primeira barreira barata contra loops de reenvio
 * e floods triviais a partir de um mesmo cliente.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      allowed: true,
      retryAfterSeconds: 0,
    };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(
        (existing.resetAt - now) / 1000
      ),
    };
  }

  existing.count += 1;

  return {
    allowed: true,
    retryAfterSeconds: 0,
  };
}

/*
 * Limpeza oportunista para o mapa não crescer
 * indefinidamente durante a vida da instância.
 */
export function pruneRateLimitBuckets() {
  const now = Date.now();

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}
