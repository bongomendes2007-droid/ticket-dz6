// Regras de split financeiro do checkout — Fase 3.2 (somente Pix por
// enquanto). Centralizado aqui porque o valor é usado tanto no backend
// (app/api/checkout/criar-pagamento) quanto no frontend (estimativa exibida
// antes de ir pro pagamento) — nunca duplique essa conta em outro lugar.
//
// * comprador paga preco_ingresso + taxa do gateway (Pix).
// * plataforma fica com 8% do preco_ingresso, ou R$2,00 por ingresso, o que
//   for maior.
// * organizador recebe o restante.

// Estimativa da taxa do Mercado Pago pro Pix (~0,99%). AJUSTAR aqui quando
// confirmarmos o valor exato cobrado pelo MP.
export const TAXA_GATEWAY_PIX_PERCENTUAL = 0.0099;

// Comissão da Ticket DZ6: 8% do valor do ingresso...
export const TAXA_PLATAFORMA_PERCENTUAL = 0.08;
// ...ou este valor mínimo por ingresso, o que for maior.
export const TAXA_PLATAFORMA_MINIMA_POR_INGRESSO = 2.0;

function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100;
}

export type ValoresCheckout = {
  precoIngresso: number;
  valorTaxaGateway: number;
  valorTotal: number;
  valorTaxaPlataforma: number;
  valorOrganizador: number;
};

export function calcularValoresCheckout(
  precoUnitario: number,
  quantidade: number
): ValoresCheckout {
  const precoIngresso = arredondar(precoUnitario * quantidade);
  const valorTaxaGateway = arredondar(precoIngresso * TAXA_GATEWAY_PIX_PERCENTUAL);
  const valorTotal = arredondar(precoIngresso + valorTaxaGateway);
  const valorTaxaPlataforma = arredondar(
    Math.max(
      precoIngresso * TAXA_PLATAFORMA_PERCENTUAL,
      TAXA_PLATAFORMA_MINIMA_POR_INGRESSO * quantidade
    )
  );
  const valorOrganizador = arredondar(precoIngresso - valorTaxaPlataforma);

  return {
    precoIngresso,
    valorTaxaGateway,
    valorTotal,
    valorTaxaPlataforma,
    valorOrganizador,
  };
}
