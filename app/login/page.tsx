"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AuthCard from "@/components/AuthCard";
import { Field, PrimaryButton, ErrorAlert } from "@/components/auth-ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      setErro("Email ou senha incorretos.");
      setLoading(false);
      return;
    }

    // Sessao criada: vai para o painel e revalida os Server Components.
    router.push("/painel");
    router.refresh();
  }

  async function handleGoogle() {
    setErro(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setErro("Não foi possível entrar com o Google. Tente novamente.");
  }

  return (
    <AuthCard
      title="Entrar"
      subtitle="Acesse sua conta para gerenciar seus eventos."
      footer={
        <>
          Não tem conta?{" "}
          <Link
            href="/cadastro"
            className="font-semibold text-brand-blue hover:underline"
          >
            Criar conta
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <ErrorAlert>{erro}</ErrorAlert>

        <Field
          label="Email"
          type="email"
          required
          autoComplete="email"
          placeholder="voce@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div>
          <Field
            label="Senha"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <div className="mt-1.5 text-right">
            <Link
              href="/recuperar-senha"
              className="text-xs font-medium text-brand-blue hover:underline"
            >
              Esqueci minha senha
            </Link>
          </div>
        </div>

        <PrimaryButton type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </PrimaryButton>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-brand-gray">
        <span className="h-px flex-1 bg-brand-blue/10" />
        ou
        <span className="h-px flex-1 bg-brand-blue/10" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-brand-blue/15 bg-white px-5 py-3 text-sm font-semibold text-brand-ink transition hover:bg-brand-light"
      >
        <GoogleIcon />
        Entrar com Google
      </button>
    </AuthCard>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}
