import { Ticket } from "lucide-react";

// Placeholder exibido no lugar da capa quando o evento nao tem imagem_capa.
// Gradiente nas cores da marca + icone de ingresso + texto "Sem imagem".
export default function EventoCapaPlaceholder({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-brand-blue to-brand-orange text-white ${className}`}
    >
      <Ticket className="h-8 w-8 opacity-90" />
      <span className="text-xs font-semibold uppercase tracking-wide opacity-90">
        Sem imagem
      </span>
    </div>
  );
}
