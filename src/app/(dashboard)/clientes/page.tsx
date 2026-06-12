"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, UserPlus, X } from "lucide-react";
import { toast } from "sonner";

function formatPhone(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  const n = d.length;
  if (n === 0) return "";
  if (n <= 2) return `(${d}`;
  if (n <= 6) return `(${d.slice(0,2)}) ${d.slice(2)}`;
  if (n <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}

function formatCpfCnpj(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 14);
  const n = d.length;
  if (n <= 11) {
    if (n <= 3) return d;
    if (n <= 6) return `${d.slice(0,3)}.${d.slice(3)}`;
    if (n <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
    return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
  }
  if (n <= 2) return d;
  if (n <= 5) return `${d.slice(0,2)}.${d.slice(2)}`;
  if (n <= 8) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5)}`;
  if (n <= 12) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8)}`;
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`;
}

const UFS = [
  "PB","RN","PE",
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA",
  "MT","MS","MG","PA","PR","PI","RJ",
  "RS","RO","RR","SC","SP","SE","TO",
];

interface Contato {
  id: number;
  nome: string;
  telefone1?: string | null;
  telefone2?: string | null;
  email?: string | null;
}

interface Cliente {
  id: number;
  nome: string;
  fantasia?: string | null;
  cnpj?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  uf?: string | null;
  cep?: string | null;
  telefone1?: string | null;
  telefone2?: string | null;
  email?: string | null;
  responsavel?: string | null;
  whatsapp?: string | null;
  contatos: Contato[];
}

const EMPTY_CLIENTE: Omit<Cliente, "id" | "contatos"> = {
  nome: "", fantasia: "", cnpj: "", logradouro: "", numero: "",
  bairro: "", cidade: "", uf: "", cep: "",
  telefone1: "", telefone2: "", email: "", responsavel: "", whatsapp: "",
};

const EMPTY_CONTATO: Omit<Contato, "id"> = {
  nome: "", telefone1: "", telefone2: "", email: "",
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filtro, setFiltro] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [form, setForm] = useState<Omit<Cliente, "id" | "contatos">>(EMPTY_CLIENTE);

  // Contacts state inside dialog
  const [contatoForm, setContatoForm] = useState<Omit<Contato, "id">>(EMPTY_CONTATO);
  const [editingContato, setEditingContato] = useState<Contato | null>(null);
  const [addingContato, setAddingContato] = useState(false);

  async function load() {
    const res = await fetch("/api/clientes");
    setClientes(await res.json());
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setEditing(null);
    setForm(EMPTY_CLIENTE);
    setAddingContato(false);
    setEditingContato(null);
    setOpen(true);
  }

  function openEdit(c: Cliente) {
    setEditing(c);
    setForm({
      nome: c.nome ?? "",
      fantasia: c.fantasia ?? "",
      cnpj: c.cnpj ?? "",
      logradouro: c.logradouro ?? "",
      numero: c.numero ?? "",
      bairro: c.bairro ?? "",
      cidade: c.cidade ?? "",
      uf: c.uf ?? "",
      cep: c.cep ?? "",
      telefone1: c.telefone1 ?? "",
      telefone2: c.telefone2 ?? "",
      email: c.email ?? "",
      responsavel: c.responsavel ?? "",
      whatsapp: c.whatsapp ?? "",
    });
    setAddingContato(false);
    setEditingContato(null);
    setOpen(true);
  }

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    if (!form.nome.trim()) return;
    const url = editing ? `/api/clientes/${editing.id}` : "/api/clientes";
    const method = editing ? "PUT" : "POST";
    const payload = {
      ...form,
      nome: form.nome.trim().toUpperCase(),
      fantasia: form.fantasia?.trim().toUpperCase() || null,
      cnpj: form.cnpj?.trim() || null,
      logradouro: form.logradouro?.trim() || null,
      numero: form.numero?.trim() || null,
      bairro: form.bairro?.trim().toUpperCase() || null,
      cidade: form.cidade?.trim().toUpperCase() || null,
      uf: form.uf || null,
      cep: form.cep?.trim() || null,
      telefone1: form.telefone1?.trim() || null,
      telefone2: form.telefone2?.trim() || null,
      email: form.email?.trim().toLowerCase() || null,
      responsavel: form.responsavel?.trim().toUpperCase() || null,
      whatsapp: form.whatsapp ? formatPhone(form.whatsapp) : null,
    };
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) { toast.error("Erro ao salvar"); return; }
    toast.success(editing ? "Atualizado" : "Criado");
    setOpen(false);
    load();
  }

  async function del(id: number) {
    if (!confirm("Excluir este cliente?")) return;
    const res = await fetch(`/api/clientes/${id}`, { method: "DELETE" });
    if (!res.ok) { toast.error("Não é possível excluir: cliente possui fretes vinculados"); return; }
    toast.success("Excluído");
    load();
  }

  // --- Contatos ---
  async function saveContato() {
    if (!editing || !contatoForm.nome.trim()) return;
    const nome = contatoForm.nome.trim().toUpperCase();
    const payload = {
      nome,
      telefone1: contatoForm.telefone1?.trim() || null,
      telefone2: contatoForm.telefone2?.trim() || null,
      email: contatoForm.email?.trim().toLowerCase() || null,
    };

    let res: Response;
    if (editingContato) {
      res = await fetch(`/api/clientes/${editing.id}/contatos/${editingContato.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetch(`/api/clientes/${editing.id}/contatos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    if (!res.ok) { toast.error("Erro ao salvar contato"); return; }
    toast.success(editingContato ? "Contato atualizado" : "Contato adicionado");
    setAddingContato(false);
    setEditingContato(null);
    setContatoForm(EMPTY_CONTATO);
    load().then(() => {
      setEditing((prev) => prev ? clientes.find((c) => c.id === prev.id) ?? prev : null);
    });
  }

  async function delContato(contatoId: number) {
    if (!editing) return;
    const res = await fetch(`/api/clientes/${editing.id}/contatos/${contatoId}`, { method: "DELETE" });
    if (!res.ok) { toast.error("Erro ao excluir contato"); return; }
    toast.success("Contato excluído");
    load().then(() => {
      setEditing((prev) => prev ? clientes.find((c) => c.id === prev.id) ?? prev : null);
    });
  }

  function startEditContato(c: Contato) {
    setEditingContato(c);
    setContatoForm({ nome: c.nome, telefone1: c.telefone1 ?? "", telefone2: c.telefone2 ?? "", email: c.email ?? "" });
    setAddingContato(true);
  }

  const filtered = clientes.filter((c) =>
    c.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    (c.fantasia ?? "").toLowerCase().includes(filtro.toLowerCase()) ||
    (c.cnpj ?? "").includes(filtro)
  );

  function field(key: keyof typeof form, label: string, placeholder?: string, className?: string) {
    return (
      <div className={`space-y-1.5 ${className ?? ""}`}>
        <Label>{label}</Label>
        <Input
          value={(form[key] as string) ?? ""}
          onChange={(e) => set(key, e.target.value)}
          placeholder={placeholder}
        />
      </div>
    );
  }

  // Live contatos from the editing client (kept in sync after load)
  const liveContatos = editing ? (clientes.find((c) => c.id === editing.id)?.contatos ?? editing.contatos) : [];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-on-surface tracking-tight">Clientes</h2>
          <p className="text-sm text-on-surface-variant mt-0.5">{clientes.length} cadastrados</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-primary text-on-primary-color px-5 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined msym-sm">add</span>
          Novo Cliente
        </button>
      </div>

      <Input
        placeholder="Buscar por razão social, fantasia ou CNPJ..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="max-w-md bg-surface-container border-outline-variant text-on-surface placeholder:text-on-surface-variant/60"
      />

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-auto max-h-[65vh]">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-high border-b border-outline-variant sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Razão Social</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Fantasia</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">CNPJ</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Cidade/UF</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Telefone</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Contatos</th>
                <th className="px-6 py-3 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-surface-container-highest/40 transition-colors">
                  <td className="px-6 py-3 text-sm text-on-surface font-medium max-w-[200px] truncate">{c.nome}</td>
                  <td className="px-6 py-3 text-sm text-on-surface-variant max-w-[160px] truncate">{c.fantasia ?? "—"}</td>
                  <td className="px-6 py-3 text-sm text-on-surface-variant font-mono whitespace-nowrap">{c.cnpj ?? "—"}</td>
                  <td className="px-6 py-3 text-sm text-on-surface-variant whitespace-nowrap">
                    {c.cidade && c.uf ? `${c.cidade}/${c.uf}` : c.cidade ?? c.uf ?? "—"}
                  </td>
                  <td className="px-6 py-3 text-sm text-on-surface-variant font-mono whitespace-nowrap">{c.telefone1 ?? "—"}</td>
                  <td className="px-6 py-3 text-sm text-on-surface-variant">
                    {c.contatos.length > 0 ? (
                      <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full">
                        {c.contatos.length} contato{c.contatos.length > 1 ? "s" : ""}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface transition-colors" onClick={() => openEdit(c)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button className="p-1.5 rounded-lg text-on-surface-variant hover:bg-red-500/10 hover:text-red-400 transition-colors" onClick={() => del(c.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setAddingContato(false); setEditingContato(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">

            <div className="grid grid-cols-2 gap-3">
              {field("nome", "Razão Social", "Razão social", "col-span-2")}
              {field("fantasia", "Fantasia", "Nome fantasia", "col-span-2")}
              <div className="space-y-1.5 col-span-2">
                <Label>CNPJ / CPF</Label>
                <Input
                  value={form.cnpj ?? ""}
                  onChange={(e) => set("cnpj", formatCpfCnpj(e.target.value))}
                  placeholder="00.000.000/0000-00"
                  inputMode="numeric"
                />
              </div>
            </div>

            <div className="border-t pt-3">
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Endereço</p>
              <div className="grid grid-cols-6 gap-3">
                {field("logradouro", "Logradouro", "Rua, Av., etc.", "col-span-4")}
                {field("numero", "Nº", "", "col-span-2")}
                {field("bairro", "Bairro", "", "col-span-3")}
                {field("cidade", "Cidade", "", "col-span-3")}
                <div className="space-y-1.5 col-span-1">
                  <Label>UF</Label>
                  <Select
                    value={form.uf ?? ""}
                    onValueChange={(v) => set("uf", v ?? "")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent className="max-h-56">
                      {UFS.map((uf) => (
                        <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {field("cep", "CEP", "00000-000", "col-span-2")}
              </div>
            </div>

            <div className="border-t pt-3">
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Telefones / E-mail</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Telefone 1</Label>
                  <Input
                    value={form.telefone1 ?? ""}
                    onChange={(e) => set("telefone1", formatPhone(e.target.value))}
                    placeholder="(83) 00000-0000"
                    inputMode="numeric"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Telefone 2</Label>
                  <Input
                    value={form.telefone2 ?? ""}
                    onChange={(e) => set("telefone2", formatPhone(e.target.value))}
                    placeholder="(83) 00000-0000"
                    inputMode="numeric"
                  />
                </div>
                {field("email", "E-mail", "contato@empresa.com.br", "col-span-2")}
              </div>
            </div>

            {/* Contacts section — only when editing an existing client */}
            {editing && (
              <div className="border-t pt-3">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Responsáveis ({liveContatos.length})
                  </p>
                  {!addingContato && (
                    <button
                      type="button"
                      onClick={() => { setEditingContato(null); setContatoForm(EMPTY_CONTATO); setAddingContato(true); }}
                      className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      Adicionar
                    </button>
                  )}
                </div>

                {liveContatos.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    {liveContatos.map((ct) => (
                      <div key={ct.id} className="flex items-center justify-between rounded-lg bg-surface-container px-3 py-2 text-sm">
                        <div className="min-w-0">
                          <span className="font-medium text-on-surface">{ct.nome}</span>
                          {(ct.telefone1 || ct.email) && (
                            <span className="text-on-surface-variant ml-2 text-xs">
                              {[ct.telefone1, ct.email].filter(Boolean).join(" · ")}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1 shrink-0 ml-2">
                          <button className="p-1 rounded text-on-surface-variant hover:text-on-surface" onClick={() => startEditContato(ct)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button className="p-1 rounded text-on-surface-variant hover:text-red-400" onClick={() => delContato(ct.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {addingContato && (
                  <div className="rounded-lg border border-outline-variant p-3 space-y-3 bg-surface-container">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5 col-span-2">
                        <Label>Nome</Label>
                        <Input
                          value={contatoForm.nome}
                          onChange={(e) => setContatoForm((p) => ({ ...p, nome: e.target.value }))}
                          placeholder="Nome do responsável"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Telefone 1</Label>
                        <Input
                          value={contatoForm.telefone1 ?? ""}
                          onChange={(e) => setContatoForm((p) => ({ ...p, telefone1: formatPhone(e.target.value) }))}
                          placeholder="(83) 00000-0000"
                          inputMode="numeric"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Telefone 2</Label>
                        <Input
                          value={contatoForm.telefone2 ?? ""}
                          onChange={(e) => setContatoForm((p) => ({ ...p, telefone2: formatPhone(e.target.value) }))}
                          placeholder="(83) 00000-0000"
                          inputMode="numeric"
                        />
                      </div>
                      <div className="space-y-1.5 col-span-2">
                        <Label>E-mail</Label>
                        <Input
                          value={contatoForm.email ?? ""}
                          onChange={(e) => setContatoForm((p) => ({ ...p, email: e.target.value }))}
                          placeholder="contato@empresa.com.br"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => { setAddingContato(false); setEditingContato(null); setContatoForm(EMPTY_CONTATO); }}
                        className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-on-surface"
                      >
                        <X className="h-3.5 w-3.5" /> Cancelar
                      </button>
                      <Button size="sm" onClick={saveContato}>
                        {editingContato ? "Atualizar" : "Adicionar"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={save}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
