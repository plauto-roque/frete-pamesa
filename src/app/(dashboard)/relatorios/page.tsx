"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatDate } from "@/lib/format";
import { Download, AlertCircle, UserCheck } from "lucide-react";

interface Frete {
  id: number;
  data: string;
  cliente: { nome: string };
  motorista: { nome: string };
  cidade: { nome: string };
  peso: number;
  valorTotal: number;
  valorMotorista: number;
  valorEscritorio: number;
  tipoPagamento: string | null;
  pagoCliente: boolean;
  pagoMotorista: boolean;
}

export default function RelatoriosPage() {
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [pendentesCliente, setPendentesCliente] = useState<Frete[]>([]);
  const [pendentesMotorista, setPendentesMotorista] = useState<Frete[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const paramsCliente = new URLSearchParams({ pagoCliente: "false", limit: "200" });
    const paramsMot = new URLSearchParams({ pagoMotorista: "false", limit: "200" });

    if (dataInicio) { paramsCliente.set("dataInicio", dataInicio); paramsMot.set("dataInicio", dataInicio); }
    if (dataFim) { paramsCliente.set("dataFim", dataFim); paramsMot.set("dataFim", dataFim); }

    const [rc, rm] = await Promise.all([
      fetch(`/api/fretes?${paramsCliente}`).then((r) => r.json()),
      fetch(`/api/fretes?${paramsMot}`).then((r) => r.json()),
    ]);

    setPendentesCliente(rc.fretes ?? []);
    setPendentesMotorista(rm.fretes ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function exportCSV(data: Frete[], filename: string) {
    const header = "Data,Cliente,Motorista,Cidade,Peso(kg),Total,Motorista R$,Escritório R$,Tipo Pgto,Pago Cliente,Pago Motorista";
    const rows = data.map((f) =>
      [
        formatDate(f.data),
        `"${f.cliente.nome}"`,
        `"${f.motorista.nome}"`,
        f.cidade.nome,
        f.peso,
        f.valorTotal.toFixed(2),
        f.valorMotorista.toFixed(2),
        f.valorEscritorio.toFixed(2),
        f.tipoPagamento ?? "",
        f.pagoCliente ? "SIM" : "NÃO",
        f.pagoMotorista ? "SIM" : "NÃO",
      ].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalPendenteCliente = pendentesCliente.reduce((s, f) => s + f.valorTotal, 0);
  const totalPendenteMotorista = pendentesMotorista.reduce((s, f) => s + f.valorMotorista, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <p className="text-sm text-muted-foreground">Pendências e exportações</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Filtro de Período</CardTitle></CardHeader>
        <CardContent className="flex items-end gap-4">
          <div className="space-y-1.5">
            <Label>Data início</Label>
            <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Data fim</Label>
            <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
          </div>
          <Button onClick={load} disabled={loading}>
            {loading ? "Carregando..." : "Atualizar"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <CardTitle className="text-base">A Receber — Clientes</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportCSV(pendentesCliente, "pendentes_clientes.csv")}
              disabled={pendentesCliente.length === 0}
            >
              <Download className="h-3.5 w-3.5 mr-1.5" /> CSV
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm mb-3">
              <span className="text-muted-foreground">{pendentesCliente.length} fretes</span>
              <span className="font-bold text-destructive">{formatBRL(totalPendenteCliente)}</span>
            </div>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {pendentesCliente.map((f) => (
                <div key={f.id} className="flex items-center justify-between text-sm rounded px-3 py-2 bg-muted/40">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{f.cliente.nome}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(f.data)} · {f.motorista.nome}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="font-semibold">{formatBRL(f.valorTotal)}</p>
                    <Badge variant="outline" className="text-xs">{f.tipoPagamento ?? "—"}</Badge>
                  </div>
                </div>
              ))}
              {pendentesCliente.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma pendência</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-yellow-500" />
              <CardTitle className="text-base">A Pagar — Motoristas</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportCSV(pendentesMotorista, "pendentes_motoristas.csv")}
              disabled={pendentesMotorista.length === 0}
            >
              <Download className="h-3.5 w-3.5 mr-1.5" /> CSV
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm mb-3">
              <span className="text-muted-foreground">{pendentesMotorista.length} fretes</span>
              <span className="font-bold text-yellow-600">{formatBRL(totalPendenteMotorista)}</span>
            </div>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {pendentesMotorista.map((f) => (
                <div key={f.id} className="flex items-center justify-between text-sm rounded px-3 py-2 bg-muted/40">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{f.motorista.nome}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(f.data)} · {f.cliente.nome}</p>
                  </div>
                  <p className="font-semibold shrink-0 ml-3">{formatBRL(f.valorMotorista)}</p>
                </div>
              ))}
              {pendentesMotorista.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma pendência</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
