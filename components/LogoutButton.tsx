"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type LogoutButtonProps = {
  className?: string;
};

/** Botao de logout: limpa a sessao e volta para a home. */
export default function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={
        className ??
        "inline-flex items-center gap-2 rounded-full border border-brand-blue/15 bg-white px-4 py-2 text-sm font-semibold text-brand-ink transition hover:bg-brand-light"
      }
    >
      <LogOut className="h-4 w-4" />
      Sair
    </button>
  );
}
