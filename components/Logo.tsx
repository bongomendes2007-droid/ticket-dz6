import { Ticket } from "lucide-react";

type LogoProps = {
  variant?: "light" | "dark";
  className?: string;
};

export default function Logo({ variant = "dark", className = "" }: LogoProps) {
  const textColor = variant === "light" ? "text-white" : "text-brand-ink";

  return (
    <span className={`flex items-center gap-2 font-extrabold tracking-tight ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-blue text-white shadow-soft">
        <Ticket className="h-5 w-5 -rotate-12" strokeWidth={2.4} />
      </span>
      <span className={`text-xl ${textColor}`}>
        TICKET <span className="text-brand-orange">DZ6</span>
      </span>
    </span>
  );
}
