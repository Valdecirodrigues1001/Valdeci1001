/*
 * As campanhas operam no horário de Brasília. O Brasil não
 * usa horário de verão desde 2019, então o offset é fixo em
 * -03:00 o ano todo — mas usamos o nome IANA na formatação
 * para o caso de isso mudar no futuro.
 */
export const CAMPAIGN_TIME_ZONE = "America/Sao_Paulo";

const BRASILIA_OFFSET = "-03:00";

/*
 * Converte data + hora digitadas pelo usuário (entendidas
 * como horário de Brasília) no instante correspondente.
 *
 *   ("2026-08-30", "15:00") -> Date de 2026-08-30T18:00:00Z
 */
export function brasiliaInputToDate(
  dateStr: string,
  timeStr: string
): Date {
  return new Date(
    `${dateStr}T${timeStr}:00${BRASILIA_OFFSET}`
  );
}

/*
 * Formata um instante (ISO string, ms ou Date) no horário
 * de Brasília, no formato pt-BR.
 */
export function formatBrasilia(
  value: string | number | Date,
  options: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat("pt-BR", {
    ...options,
    timeZone: CAMPAIGN_TIME_ZONE,
  }).format(new Date(value));
}

/*
 * Valor para <input type="date"> (YYYY-MM-DD) a partir de
 * um instante, no horário de Brasília.
 */
export function toDateInputValue(
  value: string | number | Date
): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CAMPAIGN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

/*
 * Valor para <input type="time"> (HH:MM) a partir de um
 * instante, no horário de Brasília.
 */
export function toTimeInputValue(
  value: string | number | Date
): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: CAMPAIGN_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

/*
 * Data de "hoje" em Brasília no formato YYYY-MM-DD.
 */
export function todayInBrasilia(): string {
  return toDateInputValue(new Date());
}
