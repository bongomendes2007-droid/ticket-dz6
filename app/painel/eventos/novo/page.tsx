"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/slug";
import { CATEGORIAS } from "@/lib/categorias";
import { ErrorAlert, WarningAlert } from "@/components/auth-ui";
import type { PostgrestError } from "@supabase/supabase-js";

type Lote = {
  key: string;
  nome: string;
  preco: string;
  quantidade: string;
};

const inputClass =
  "w-full rounded-xl border border-brand-blue/15 bg-white px-4 py-2.5 text-sm text-brand-ink outline-none transition placeholder:text-brand-gray/60 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20";

const labelClass = "mb-1.5 block text-sm font-medium text-brand-ink";

function novoLote(): Lote {
  return {
    key: crypto.randomUUID(),
    nome: "",
    preco: "",
    quantidade: "",
  };
}

export default function NovoEventoPage() {
  const router = useRouter();

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [dataEvento, setDataEvento] = useState("");
  const [local, setLocal] = useState("");
  const [imagem, setImagem] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [lotes, setLotes] = useState<Lote[]>([novoLote()]);

  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [salvando, setSalvando] = useState<null | "rascunho" | "publicado">(
    null
  );

  function handleImagem(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImagem(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  function atualizarLote(key: string, campo: keyof Lote, valor: string) {
    setLotes((prev) =>
      prev.map((l) => (l.key === key ? { ...l, [campo]: valor } : l))
    );
  }

  function removerLote(key: string) {
    setLotes((prev) => (prev.length > 1 ? prev.filter((l) => l.key !== key) : prev));
  }

  function validar(): string | null {
    if (titulo.trim().length < 3) return "Informe um título para o evento.";
    if (!dataEvento) return "Informe a data do evento.";
    if (new Date(dataEvento) <= new Date())
      return "A data do evento deve ser no futuro.";

    for (const lote of lotes) {
      if (lote.nome.trim().length === 0)
        return "Cada lote precisa de um nome.";
      const preco = Number(lote.preco);
      if (lote.preco === "" || Number.isNaN(preco) || preco < 0)
        return `Preço inválido no lote "${lote.nome || "sem nome"}".`;
      const qtd = Number(lote.quantidade);
      if (!Number.isInteger(qtd) || qtd <= 0)
        return `Quantidade inválida no lote "${lote.nome || "sem nome"}".`;
    }
    return null;
  }

  async function salvar(status: "rascunho" | "publicado") {
    setErro(null);
    setAviso(null);
    const erroValidacao = validar();
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    setSalvando(status);
    const supabase = createClient();

    // --- Sessao ---
    const {
      data: { user },
      error: userErro,
    } = await supabase.auth.getUser();
    if (userErro || !user) {
      console.error("[novo-evento] getUser falhou:", userErro);
      setErro("Sessão expirada. Faça login novamente.");
      setSalvando(null);
      return;
    }
    console.log("[novo-evento] organizer_id =", user.id);

    // --- 1) Upload da imagem de capa (OPCIONAL e NAO bloqueante) ---
    // O caminho segue o padrao `{auth.uid()}/{timestamp}.ext` exigido pela
    // policy RLS do bucket. Se o upload falhar, seguimos SEM imagem.
    let imagemUrl: string | null = null;
    if (imagem) {
      const ext = (imagem.name.split(".").pop() || "jpg").toLowerCase();
      const caminho = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadErro } = await supabase.storage
        .from("event-covers")
        .upload(caminho, imagem, {
          upsert: false,
          contentType: imagem.type || undefined,
        });

      if (uploadErro) {
        console.error("[novo-evento] upload da capa falhou:", {
          message: uploadErro.message,
          caminho,
        });
        // NAO interrompe: o evento e salvo sem capa.
        setAviso(
          "A imagem não pôde ser enviada — o evento será salvo sem capa. " +
            "Verifique se o bucket 'event-covers' existe, é público e tem a policy de upload."
        );
      } else {
        imagemUrl = supabase.storage
          .from("event-covers")
          .getPublicUrl(caminho).data.publicUrl;
      }
    }

    // --- 2) Insere o evento, gerando um slug unico (com sufixo se preciso) ---
    const base = slugify(titulo) || "evento";
    let eventoId: string | null = null;
    let erroEvento: PostgrestError | null = null;

    for (let tentativa = 0; tentativa < 20; tentativa++) {
      const slug = tentativa === 0 ? base : `${base}-${tentativa + 1}`;
      const { data, error } = await supabase
        .from("events")
        .insert({
          organizer_id: user.id,
          titulo: titulo.trim(),
          descricao: descricao.trim() || null,
          categoria: categoria || null,
          data_evento: new Date(dataEvento).toISOString(),
          local: local.trim() || null,
          imagem_capa: imagemUrl,
          slug,
          status,
        })
        .select("id")
        .single();

      if (!error && data) {
        eventoId = data.id;
        break;
      }
      erroEvento = error;
      // 23505 = slug duplicado -> tenta o proximo sufixo.
      if (error?.code === "23505") continue;
      // Qualquer outro erro: para o loop e reporta abaixo.
      break;
    }

    if (!eventoId) {
      console.error("[novo-evento] erro ao inserir evento:", {
        message: erroEvento?.message,
        details: erroEvento?.details,
        hint: erroEvento?.hint,
        code: erroEvento?.code,
      });
      setErro(mensagemErroEvento(erroEvento));
      setSalvando(null);
      return;
    }

    // --- 3) Insere os lotes (preco/quantidade como NUMBER) ---
    const { error: lotesErro } = await supabase.from("ticket_batches").insert(
      lotes.map((l) => ({
        event_id: eventoId,
        nome: l.nome.trim(),
        preco: Number(l.preco),
        quantidade_total: Number(l.quantidade),
      }))
    );

    if (lotesErro) {
      console.error("[novo-evento] erro ao inserir lotes:", {
        message: lotesErro.message,
        details: lotesErro.details,
        hint: lotesErro.hint,
        code: lotesErro.code,
      });
      // Desfaz o evento para nao deixar lixo sem lotes.
      await supabase.from("events").delete().eq("id", eventoId);
      setErro(`Erro ao salvar os lotes: ${lotesErro.message}`);
      setSalvando(null);
      return;
    }

    router.push("/painel");
    router.refresh();
  }

  // Traduz o erro do Postgres/Supabase numa mensagem util para o usuario.
  function mensagemErroEvento(error: PostgrestError | null): string {
    if (!error) {
      return "Não foi possível gerar um endereço único para o evento.";
    }
    switch (error.code) {
      case "42501": // RLS
        return "Permissão negada ao salvar (RLS). Confirme que você está logado e tente novamente.";
      case "23503": // foreign key
        return "Seu perfil de organizador não foi encontrado. Saia e entre novamente para recriar a sessão.";
      case "23514": // check constraint
        return `Algum valor não passou na validação do banco: ${error.message}`;
      case "23502": // not null
        return `Um campo obrigatório ficou vazio: ${error.message}`;
      default:
        return `Erro ao salvar o evento: ${error.message}`;
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/painel"
        className="inline-flex items-center gap-2 text-sm font-medium text-brand-gray transition hover:text-brand-blue"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para o painel
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-brand-ink">
        Criar novo evento
      </h1>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="mt-6 flex flex-col gap-6"
      >
        <ErrorAlert>{erro}</ErrorAlert>
        <WarningAlert>{aviso}</WarningAlert>

        {/* Dados do evento */}
        <section className="rounded-2xl border border-brand-blue/10 bg-white p-6 shadow-card">
          <h2 className="mb-4 font-bold text-brand-ink">Informações</h2>

          <div className="flex flex-col gap-4">
            <div>
              <label className={labelClass}>Título *</label>
              <input
                className={inputClass}
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Festival de Verão 2026"
              />
            </div>

            <div>
              <label className={labelClass}>Descrição</label>
              <textarea
                className={`${inputClass} min-h-28 resize-y`}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Conte os detalhes do seu evento..."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Categoria</label>
                <select
                  className={inputClass}
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Data e hora *</label>
                <input
                  type="datetime-local"
                  className={inputClass}
                  value={dataEvento}
                  onChange={(e) => setDataEvento(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Local</label>
              <input
                className={inputClass}
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                placeholder="Ex: Centro de Convenções, São Paulo - SP"
              />
            </div>

            <div>
              <label className={labelClass}>Imagem de capa</label>
              <div className="flex items-center gap-4">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-brand-blue/15 bg-brand-light px-4 py-2.5 text-sm font-semibold text-brand-ink transition hover:bg-white">
                  <Upload className="h-4 w-4" />
                  Escolher imagem
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImagem}
                  />
                </label>
                {preview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview}
                    alt="Pré-visualização"
                    className="h-16 w-24 rounded-lg object-cover"
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Lotes */}
        <section className="rounded-2xl border border-brand-blue/10 bg-white p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-brand-ink">Lotes de ingressos</h2>
            <button
              type="button"
              onClick={() => setLotes((prev) => [...prev, novoLote()])}
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-blue/15 px-3 py-1.5 text-sm font-semibold text-brand-blue transition hover:bg-brand-light"
            >
              <Plus className="h-4 w-4" />
              Adicionar lote
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {lotes.map((lote, i) => (
              <div
                key={lote.key}
                className="grid grid-cols-1 gap-3 rounded-xl border border-brand-blue/10 bg-brand-light/40 p-3 sm:grid-cols-[1fr_120px_120px_auto]"
              >
                <input
                  className={inputClass}
                  value={lote.nome}
                  onChange={(e) => atualizarLote(lote.key, "nome", e.target.value)}
                  placeholder={`Ex: ${i + 1}º Lote`}
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputClass}
                  value={lote.preco}
                  onChange={(e) => atualizarLote(lote.key, "preco", e.target.value)}
                  placeholder="Preço R$"
                />
                <input
                  type="number"
                  min="1"
                  step="1"
                  className={inputClass}
                  value={lote.quantidade}
                  onChange={(e) =>
                    atualizarLote(lote.key, "quantidade", e.target.value)
                  }
                  placeholder="Qtd."
                />
                <button
                  type="button"
                  onClick={() => removerLote(lote.key)}
                  disabled={lotes.length === 1}
                  className="flex items-center justify-center rounded-xl px-3 py-2 text-brand-gray transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Remover lote"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Acoes */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => salvar("rascunho")}
            disabled={salvando !== null}
            className="rounded-full border border-brand-blue/20 bg-white px-6 py-3 text-sm font-semibold text-brand-ink transition hover:bg-brand-light disabled:opacity-60"
          >
            {salvando === "rascunho" ? "Salvando..." : "Salvar como rascunho"}
          </button>
          <button
            type="button"
            onClick={() => salvar("publicado")}
            disabled={salvando !== null}
            className="rounded-full bg-brand-blue px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-blue-dark disabled:opacity-60"
          >
            {salvando === "publicado" ? "Publicando..." : "Publicar"}
          </button>
        </div>
      </form>
    </div>
  );
}
