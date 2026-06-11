"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, CreditCard } from "lucide-react";
import { toast } from "sonner";

interface ContaBancaria {
  nomeConta?: string; cpf?: string; banco?: string;
  numeroBanco?: string; tipoConta?: string; agencia?: string; conta?: string;
}

interface Motorista {
  id: number;
  nome: string;
  telefone?: string;
  conta?: ContaBancaria;
}

const EMPTY_CONTA: ContaBancaria = {
  nomeConta: "", cpf: "", banco: "", numeroBanco: "", tipoConta: "", agencia: "", conta: ""
};

export default function MotoristasPage() {
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [filtro, setFiltro] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Motorista | null>(null);
  const [form, setForm] = useState({ nome: "", telefone: "" });
  const [conta, setConta] = useState<ContaBancaria>(EMPTY_CONTA);
  const [showConta, setShowConta] = useState(false);

  async function load() {
    const res = await fetch("/api/motoristas");
    setMotoristas(await res.json());
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setEditing(null);
    setForm({ nome: "", telefone: "" });
    setConta(EMPTY_CONTA);
    setShowConta(false);
    setOpen(true);
  }

  function openEdit(m: Motorista) {
    setEditing(m);
    setForm({ nome: m.nome, telefone: m.telefone ?? "" });
    setConta(m.conta ?? EMPTY_CONTA);
    setShowConta(!!m.conta);
    setOpen(true);
  }

  async function save() {
    if (!form.nome.trim()) return;
    const url = editing ? `/api/motoristas/${editing.id}` : "/api/motoristas";
    const method = editing ? "PUT" : "POST";
    const body: Record<string, unknown> = {
      nome: form.nome.trim().toUpperCase(),
      telefone: form.telefone || null,
    };
    if (showConta) body.conta = conta;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) { toast.error("Erro ao salvar"); return; }
    toast.success(editing ? "Atualizado" : "Criado");
    setOpen(false);
    load();
  }

  async function del(id: number) {
    if (!confirm("Excluir este motorista?")) return;
    const res = await fetch(`/api/motoristas/${id}`, { method: "DELETE" });
    if (!res.ok) { toast.error("Não é possível excluir: motorista possui fretes vinculados"); return; }
    toast.success("Excluído");
    load();
  }

  const filtered = motoristas.filter((m) =>
    m.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  function contaField(key: keyof ContaBancaria, label: string, placeholder?: string) {
    return (
      <div className="space-y-1.5">
        <Label>{label}</Label>
        <Input
          value={conta[key] ?? ""}
          onChange={(e) => setConta((prev) => ({ ...prev, [key]: e.target.value }))}
          placeholder={placeholder}
        />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-on-surface tracking-tight">Motoristas</h2>
          <p className="text-sm text-on-surface-variant mt-0.5">{motoristas.length} cadastrados</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-primary text-on-primary-color px-5 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined msym-sm">add</span>
          Novo Motorista
        </button>
      </div>

      <Input
        placeholder="Buscar motorista..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="max-w-sm bg-surface-container border-outline-variant text-on-surface placeholder:text-on-surface-variant/60"
      />

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-auto max-h-[65vh]">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-high border-b border-outline-variant sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Telefone</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Banco</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Conta</th>
                <th className="px-6 py-3 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-surface-container-highest/40 transition-colors">
                  <td className="px-6 py-3 text-sm text-on-surface font-medium">{m.nome}</td>
                  <td className="px-6 py-3 text-sm text-on-surface-variant font-mono">{m.telefone ?? "—"}</td>
                  <td className="px-6 py-3 text-sm text-on-surface-variant">{m.conta?.banco ?? "—"}</td>
                  <td className="px-6 py-3 text-sm text-on-surface-variant font-mono">
                    {m.conta ? `Ag. ${m.conta.agencia} | CC ${m.conta.conta}` : "—"}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface transition-colors" onClick={() => openEdit(m)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button className="p-1.5 rounded-lg text-on-surface-variant hover:bg-red-500/10 hover:text-red-400 transition-colors" onClick={() => del(m.id)}>
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Motorista" : "Novo Motorista"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label>Nome</Label>
                <Input
                  value={form.nome}
                  onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                  placeholder="Nome completo"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Telefone</Label>
                <Input
                  value={form.telefone}
                  onChange={(e) => setForm((p) => ({ ...p, telefone: e.target.value }))}
                  placeholder="Ex: 9664-6265"
                />
              </div>
            </div>

            <div className="border-t pt-3">
              <button
                type="button"
                className="flex items-center gap-2 text-sm font-medium text-primary"
                onClick={() => setShowConta((v) => !v)}
              >
                <CreditCard className="h-4 w-4" />
                {showConta ? "Ocultar dados bancários" : "Dados bancários"}
              </button>
            </div>

            {showConta && (
              <div className="grid grid-cols-2 gap-3">
                {contaField("nomeConta", "Nome na conta")}
                {contaField("cpf", "CPF", "000.000.000-00")}
                {contaField("banco", "Banco")}
                {contaField("numeroBanco", "Cód. banco")}
                {contaField("tipoConta", "Tipo de conta")}
                {contaField("agencia", "Agência")}
                {contaField("conta", "Número da conta")}
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
