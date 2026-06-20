"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AuthCard from "@/components/AuthCard";
import { Field, PrimaryButton, ErrorAlert, SuccessAlert } from "@/components/auth-ui";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });

    if (error) {
      setErro("Não foi possível enviar o link. Verifique o email e tente novamente.");
      setLoading(false);
      return;
    }

    setSucesso(
      "Se este email tiver uma conta, enviamos um link para redefinir a senha. Verifique sua caixa de entrada."
    );
    setLoading(false);
  }

  return (
    <AuthCard
      title="Recuperar senha"
      subtitle="Informe seu email e enviaremos um link para redefinir sua senha."
      footer={
        <>
          Lembrou a senha?{" "}
          <Link
            href="/login"
            className="font-semibold text-brand-blue hover:underline"
          >
            Voltar para o login
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <ErrorAlert>{erro}</ErrorAlert>
        <SuccessAlert>{sucesso}</SuccessAlert>

        <Field
          label="Email"
          type="email"
          required
          autoComplete="email"
          placeholder="voce@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <PrimaryButton type="submit" disabled={loading}>
          {loading ? "Enviando..." : "Enviar link"}
        </PrimaryButton>
      </form>
    </AuthCard>
  );
}
