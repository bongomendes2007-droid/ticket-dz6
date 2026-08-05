import type { LucideIcon } from "lucide-react";

export type CardFaturamento = {
  label: string;
  valor: string;
  icon: LucideIcon;
};

// Grid de cards de metricas — reaproveitado no painel do organizador e no
// dashboard /admin, só muda o que cada um passa em `cards`.
export default function FaturamentoCards({ cards }: { cards: CardFaturamento[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="rounded-2xl border border-brand-blue/10 bg-white p-5 shadow-card"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-brand-gray">
              <Icon className="h-4 w-4 text-brand-blue" />
              {card.label}
            </div>
            <p className="mt-2 text-2xl font-extrabold text-brand-ink">{card.valor}</p>
          </div>
        );
      })}
    </div>
  );
}
