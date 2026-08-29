/*
 * Helpers para leitura de campos de FormData em Server Actions.
 *
 * Antes cada actions.ts reimplementava estas funções.
 */

export function getString(
  formData: FormData,
  field: string
): string {
  const value = formData.get(field);

  return typeof value === "string"
    ? value.trim()
    : "";
}

export function getOptionalString(
  formData: FormData,
  field: string
): string | null {
  return getString(formData, field) || null;
}

export function getBoolean(
  formData: FormData,
  field: string
): boolean {
  const value = formData.get(field);

  return (
    value === "true" ||
    value === "on" ||
    value === "1"
  );
}

/*
 * Retorna o arquivo enviado no campo, ou null quando
 * ausente ou vazio (input file não preenchido).
 */
export function getFile(
  formData: FormData,
  field: string
): File | null {
  const value = formData.get(field);

  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  return value;
}

/*
 * Inteiro >= 0 a partir de um campo de texto/numérico.
 * Valores inválidos ou negativos viram o fallback (default 0).
 */
export function getNonNegativeInteger(
  formData: FormData,
  field: string,
  fallback = 0
): number {
  const value = Number(
    getString(formData, field) || String(fallback)
  );

  if (!Number.isInteger(value) || value < 0) {
    return fallback;
  }

  return value;
}
