import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";

/** Campo de texto padrao das telas de auth. */
export function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-brand-ink">
        {label}
      </span>
      <input
        {...props}
        className="w-full rounded-xl border border-brand-blue/15 bg-white px-4 py-3 text-sm text-brand-ink outline-none transition placeholder:text-brand-gray/60 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
      />
    </label>
  );
}

/** Botao primario (azul, full width). */
export function PrimaryButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="w-full rounded-full bg-brand-blue px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}

/** Caixa de mensagem de erro. */
export function ErrorAlert({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

/** Caixa de aviso (nao bloqueante). */
export function WarningAlert({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

/** Caixa de mensagem de sucesso. */
export function SuccessAlert({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
