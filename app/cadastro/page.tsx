"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AuthCard from "@/components/AuthCard";
import { Field, PrimaryButton, ErrorAlert, SuccessAlert } from "@/components/auth-ui";

export default function CadastroPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);

    // Validacoes no cliente.
    if (nome.trim().length < 3) {
      setErro("Informe seu nome completo.");
      return;
    }
    if (senha.length < 6) {
      setErro("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (senha !== confirmar) {
      setErro("As senhas não conferem.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        // O trigger handle_new_user le este metadado para preencher
        // profiles.nome_completo automaticamente.
        data: { nome_completo: nome.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setErro(
        error.message.toLowerCase().includes("already")
          ? "Este email já está cadastrado."
          : "Não foi possível criar a conta. Tente novamente."
      );
      setLoading(false);
      return;
    }

    // Se a confirmacao de email estiver DESATIVADA, ja vem uma sessao
    // ativa -> redireciona direto para o painel.
    if (data.session) {
      router.push("/painel");
      router.refresh();
      return;
    }

    // Confirmacao de email ATIVADA: nao ha sessao ainda.
    setSucesso(
      "Conta criada! Enviamos um link de confirmação para o seu email. Confirme para poder entrar."
    );
    setLoading(false);
  }

  return (
    <AuthCard
      title="Criar conta"
      subtitle="Comece a vender ingressos para os seus eventos."
      footer={
        <>
          Já tem conta?{" "}
          <Link
            href="/login"
            className="font-semibold text-brand-blue hover:underline"
          >
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <ErrorAlert>{erro}</ErrorAlert>
        <SuccessAlert>{sucesso}</SuccessAlert>

        <Field
          label="Nome completo"
          type="text"
          required
          autoComplete="name"
          placeholder="Seu nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <Field
          label="Email"
          type="email"
          required
          autoComplete="email"
          placeholder="voce@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          label="Senha"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="Mínimo 6 caracteres"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <Field
          label="Confirmar senha"
          type="password"
          required
          autoComplete="new-password"
          placeholder="Repita a senha"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
        />

        <PrimaryButton type="submit" disabled={loading}>
          {loading ? "Criando conta..." : "Criar conta"}
        </PrimaryButton>
      </form>
    </AuthCard>
  );
}
