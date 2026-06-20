// Gera um slug a partir de um texto: minusculas, sem acentos, com hifens.
// Ex: "Festival de Verao 2026!" -> "festival-de-verao-2026"

// Faixa de marcas diacriticas combinantes (U+0300 a U+036F), montada via
// escapes para evitar qualquer problema de codificacao do arquivo-fonte.
const DIACRITICOS = new RegExp("[\\u0300-\\u036f]", "g");

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(DIACRITICOS, "") // remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove caracteres especiais
    .replace(/\s+/g, "-") // espacos -> hifen
    .replace(/-+/g, "-") // hifens repetidos -> um
    .replace(/^-+|-+$/g, ""); // remove hifens das pontas
}
