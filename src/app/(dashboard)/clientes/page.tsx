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
import { Label } from "@/components/ui/label";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Cliente { id: number; nome: string }

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filtro, setFiltro] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [nome, setNome] = useState("");

  async function load() {
    const res = await fetch("/api/clientes");
    setClientes(await res.json());
  }

  useEffect(() => { load(); }, []);

  function openNew() { setEditing(null); setNome(""); setOpen(true); }
  function openEdit(c: Cliente) { setEditing(c); setNome(c.nome); setOpen(true); }

  async function save() {
    if (!nome.trim()) return;
    const url = editing ? `/api/clientes/${editing.id}` : "/api/clientes";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: nome.trim().toUpperCase() }),
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

  const filtered = clientes.filter((c) =>
    c.nome.toLowerCase().includes(filtro.toLowerCase())
  );

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
        placeholder="Buscar cliente..."
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
                <th className="px-6 py-3 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-surface-container-highest/40 transition-colors">
                  <td className="px-6 py-3 text-sm text-on-surface">{c.nome}</td>
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome do cliente"
                onKeyDown={(e) => e.key === "Enter" && save()}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={save}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
