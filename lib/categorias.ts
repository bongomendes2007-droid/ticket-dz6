// As 12 categorias oficiais da Ticket DZ6 (mesma lista da landing page).
export const CATEGORIAS = [
  "Conferências",
  "Educação",
  "Esportes",
  "Festivais",
  "Gastronomia",
  "Negócios",
  "Saúde e Bem-estar",
  "Seminários",
  "Shows",
  "Teatro",
  "Tecnologia",
  "Workshops",
] as const;

export type Categoria = (typeof CATEGORIAS)[number];
