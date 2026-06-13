"use client";

import { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatBRL, formatDate } from "@/lib/format";
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { FreteDialog } from "@/components/fretes/FreteDialog";
import { toast } from "sonner";

interface Frete {
  id: number;
  data: string;
  cliente: { id: number; nome: string };
  motorista: { id: number; nome: string };
  cidade: { id: number; nome: string };
  peso: number;
  valorTotal: number;
  valorMotorista: number;
  valorEscritorio: number;
  tipoPagamento: string | null;
  pagoCliente: boolean;
  pagoMotorista: boolean;
}

export default function FretesPage() {
  const [fretes, setFretes] = useState<Frete[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroPagoCliente, setFiltroPagoCliente] = useState("");
  const [filtroPagoMotorista, setFiltroPagoMotorista] = useState("");
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editFrete, setEditFrete] = useState<Frete | null>(null);

  const LIMIT = 20;

  const fetchFretes = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    if (filtroPagoCliente === "pago") params.set("pagoCliente", "true");
    else if (filtroPagoCliente === "pendente") params.set("pagoCliente", "false");
    else if (filtroPagoCliente === "absorvido") params.set("tipoPagamento", "ABSORVIDO");
    if (filtroPagoMotorista === "pago") params.set("pagoMotorista", "true");
    else if (filtroPagoMotorista === "pendente") params.set("pagoMotorista", "false");
    if (filtroDataInicio) params.set("dataInicio", filtroDataInicio);
    if (filtroDataFim) params.set("dataFim", filtroDataFim);

    const res = await fetch(`/api/fretes?${params}`);
    const data = await res.json();

    let items: Frete[] = data.fretes ?? [];
    if (filtroCliente) {
      const q = filtroCliente.toLowerCase();
      items = items.filter((f) => f.cliente.nome.toLowerCase().includes(q));
    }

    setFretes(items);
    setTotal(data.total);
    setLoading(false);
  }, [page, filtroCliente, filtroPagoCliente, filtroPagoMotorista, filtroDataInicio, filtroDataFim]);

  useEffect(() => { fetchFretes(); }, [fetchFretes]);

  async function togglePago(id: number, field: "pagoCliente" | "pagoMotorista", current: boolean) {
    await fetch(`/api/fretes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: !current }),
    });
    fetchFretes();
    toast.success("Status atualizado");
  }

  async function deleteFrete(id: number) {
    if (!confirm("Excluir este frete?")) return;
    await fetch(`/api/fretes/${id}`, { method: "DELETE" });
    fetchFretes();
    toast.success("Frete excluído");
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-on-surface tracking-tight">Gestão de Fretes</h2>
          <p className="text-sm text-on-surface-variant mt-0.5">{total} registros encontrados</p>
        </div>
        <button
          onClick={() => { setEditFrete(null); setDialogOpen(true); }}
          className="flex items-center gap-2 bg-primary text-on-primary-color px-5 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined msym-sm">add</span>
          Novo Frete
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex flex-wrap gap-3">
          <Input
            placeholder="Filtrar por cliente..."
            value={filtroCliente}
            onChange={(e) => setFiltroCliente(e.target.value)}
            className="w-52 bg-surface border-outline-variant text-on-surface placeholder:text-on-surface-variant/60"
          />
          <Input
            type="date"
            value={filtroDataInicio}
            onChange={(e) => setFiltroDataInicio(e.target.value)}
            className="w-40 bg-surface border-outline-variant text-on-surface"
          />
          <Input
            type="date"
            value={filtroDataFim}
            onChange={(e) => setFiltroDataFim(e.target.value)}
            className="w-40 bg-surface border-outline-variant text-on-surface"
          />
          <Select value={filtroPagoCliente || "todos"} onValueChange={(v) => setFiltroPagoCliente(!v || v === "todos" ? "" : v)}>
            <SelectTrigger className="w-44 bg-surface border-outline-variant text-on-surface">
              <SelectValue placeholder="Pgto. cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="absorvido">Absorvido</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filtroPagoMotorista || "todos"} onValueChange={(v) => setFiltroPagoMotorista(!v || v === "todos" ? "" : v)}>
            <SelectTrigger className="w-44 bg-surface border-outline-variant text-on-surface">
              <SelectValue placeholder="Pgto. motorista" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-container-high border-b border-outline-variant sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Motorista</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Cidade</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Peso (kg)</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Escritório</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Motorista</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-10 text-center text-on-surface-variant text-sm">
                    Carregando...
                  </td>
                </tr>
              ) : fretes.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-10 text-center text-on-surface-variant text-sm">
                    Nenhum frete encontrado.
                  </td>
                </tr>
              ) : (
                fretes.map((f) => (
                  <tr key={f.id} className="hover:bg-surface-container-highest/40 transition-colors">
                    <td className="px-6 py-3 text-sm text-on-surface-variant font-mono whitespace-nowrap">
                      {formatDate(f.data)}
                    </td>
                    <td className="px-6 py-3 text-sm text-on-surface font-medium max-w-[180px] truncate">
                      {f.cliente.nome}
                    </td>
                    <td className="px-6 py-3 text-sm text-on-surface-variant whitespace-nowrap">
                      {f.motorista.nome}
                    </td>
                    <td className="px-6 py-3 text-sm text-on-surface-variant whitespace-nowrap">
                      {f.cidade.nome}
                    </td>
                    <td className="px-6 py-3 text-sm text-on-surface-variant text-right font-mono">
                      {f.peso.toLocaleString("pt-BR")}
                    </td>
                    <td className="px-6 py-3 text-sm text-on-surface font-semibold text-right font-mono whitespace-nowrap">
                      {formatBRL(f.valorTotal)}
                    </td>
                    <td className="px-6 py-3 text-sm text-on-surface-variant text-right font-mono whitespace-nowrap">
                      {formatBRL(f.valorEscritorio)}
                    </td>
                    <td className="px-6 py-3 text-center">
                      {f.tipoPagamento === "ABSORVIDO" ? (
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20">
                          Absorvido
                        </span>
                      ) : (
                        <button onClick={() => togglePago(f.id, "pagoCliente", f.pagoCliente)}>
                          <span
                            className={
                              f.pagoCliente
                                ? "text-xs px-2.5 py-0.5 rounded-full font-semibold cursor-pointer select-none bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                                : "text-xs px-2.5 py-0.5 rounded-full font-semibold cursor-pointer select-none bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                            }
                          >
                            {f.pagoCliente ? "Pago" : "Pendente"}
                          </span>
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <button onClick={() => togglePago(f.id, "pagoMotorista", f.pagoMotorista)}>
                        <span
                          className={
                            f.pagoMotorista
                              ? "text-xs px-2.5 py-0.5 rounded-full font-semibold cursor-pointer select-none bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                              : "text-xs px-2.5 py-0.5 rounded-full font-semibold cursor-pointer select-none bg-surface-container-highest text-on-surface-variant border border-outline-variant hover:bg-surface-bright transition-colors"
                          }
                        >
                          {f.pagoMotorista ? "Pago" : "Pendente"}
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex gap-1">
                        <button
                          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface transition-colors"
                          onClick={() => { setEditFrete(f); setDialogOpen(true); }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          onClick={() => deleteFrete(f.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-outline-variant">
            <p className="text-sm text-on-surface-variant">
              Página {page} de {totalPages}
            </p>
            <div className="flex gap-1">
              <button
                className="p-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-highest disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                className="p-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-highest disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <FreteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        frete={editFrete}
        onSaved={() => { fetchFretes(); setDialogOpen(false); }}
      />
    </div>
  );
}
