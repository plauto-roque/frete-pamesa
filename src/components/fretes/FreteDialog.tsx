"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formatBRL } from "@/lib/format";

interface FormValues {
  data: string;
  clienteId: string;
  peso: string;
  motoristaId: string;
  cidadeId: string;
  distancia: string;
  valorPorTonelada: string;
  valorTonMotorista: string;
  valorTonEscritorio: string;
  tipoPagamento: string;
  pagoCliente: boolean;
  pagoMotorista: boolean;
  observacao: string;
}

interface FreteDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  frete: {
    id: number;
    data: string;
    cliente: { id: number; nome: string };
    motorista: { id: number; nome: string };
    cidade: { id: number; nome: string; distancia?: number };
    peso: number;
    valorTotal: number;
    valorMotorista: number;
    valorEscritorio: number;
    tipoPagamento: string | null;
    pagoCliente: boolean;
    pagoMotorista: boolean;
  } | null;
  onSaved: () => void;
}

function SearchableSelect<T extends { id: number; nome: string }>({
  items,
  value,
  onChange,
  placeholder,
  renderLabel,
}: {
  items: T[];
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
  renderLabel?: (item: T) => string;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const label = renderLabel ?? ((item: T) => item.nome);
  const selected = items.find((i) => String(i.id) === value);
  const selectedLabel = selected ? label(selected) : "";

  const filtered = items.filter((i) =>
    i.nome.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative">
      <Input
        value={isOpen ? query : selectedLabel}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          setQuery("");
          setIsOpen(true);
        }}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 max-h-52 overflow-y-auto rounded-md border border-outline-variant bg-[#102034] shadow-xl">
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-sm text-on-surface-variant">Nenhum resultado</p>
          ) : (
            filtered.slice(0, 80).map((item) => (
              <button
                key={item.id}
                type="button"
                className="w-full text-left px-3 py-2 text-sm text-on-surface hover:bg-surface-container-highest transition-colors"
                onClick={() => {
                  onChange(String(item.id));
                  setIsOpen(false);
                  setQuery("");
                }}
              >
                {label(item)}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

type CidadeItem = { id: number; nome: string; distancia: number };

export function FreteDialog({ open, onOpenChange, frete, onSaved }: FreteDialogProps) {
  const [clientes, setClientes] = useState<{ id: number; nome: string }[]>([]);
  const [motoristas, setMotoristas] = useState<{ id: number; nome: string }[]>([]);
  const [cidades, setCidades] = useState<CidadeItem[]>([]);
  const [preview, setPreview] = useState({ total: 0, mot: 0, esc: 0 });

  const { register, handleSubmit, watch, setValue, reset, formState: { isSubmitting } } = useForm<FormValues>({
    defaultValues: {
      data: "",
      clienteId: "",
      peso: "",
      motoristaId: "",
      cidadeId: "",
      distancia: "",
      valorPorTonelada: "",
      valorTonMotorista: "",
      valorTonEscritorio: "",
      tipoPagamento: "",
      pagoCliente: false,
      pagoMotorista: false,
      observacao: "",
    },
  });

  const [peso, valTon, valTonMot, valTonEsc] = watch([
    "peso",
    "valorPorTonelada",
    "valorTonMotorista",
    "valorTonEscritorio",
  ]);

  useEffect(() => {
    const pesoNum = parseFloat(peso) || 0;
    const tons = pesoNum / 1000;
    const total = tons * (parseFloat(valTon) || 0);
    const mot = tons * (parseFloat(valTonMot) || 0);
    const esc = tons * (parseFloat(valTonEsc) || 0);
    setPreview({ total, mot, esc });
  }, [peso, valTon, valTonMot, valTonEsc]);

  useEffect(() => {
    const total = parseFloat(valTon) || 0;
    const mot = parseFloat(valTonMot) || 0;
    setValue("valorTonEscritorio", (total - mot).toFixed(2));
  }, [valTon, valTonMot, setValue]);

  useEffect(() => {
    if (!open) return;
    Promise.all([
      fetch("/api/clientes").then((r) => r.json()),
      fetch("/api/motoristas").then((r) => r.json()),
      fetch("/api/cidades").then((r) => r.json()),
    ]).then(([c, m, ci]) => {
      setClientes(c);
      setMotoristas(m);
      setCidades(ci);
    });
  }, [open]);

  useEffect(() => {
    if (frete) {
      const dataStr = new Date(frete.data).toISOString().split("T")[0];
      const tons = frete.peso / 1000 || 1;
      reset({
        data: dataStr,
        clienteId: String(frete.cliente.id),
        peso: String(frete.peso),
        motoristaId: String(frete.motorista.id),
        cidadeId: String(frete.cidade.id),
        distancia: String(frete.cidade.distancia ?? 0),
        valorPorTonelada: String((frete.valorTotal / tons).toFixed(2)),
        valorTonMotorista: String((frete.valorMotorista / tons).toFixed(2)),
        valorTonEscritorio: String((frete.valorEscritorio / tons).toFixed(2)),
        tipoPagamento: frete.tipoPagamento ?? "",
        pagoCliente: frete.pagoCliente,
        pagoMotorista: frete.pagoMotorista,
        observacao: "",
      });
    } else {
      reset({
        data: new Date().toISOString().split("T")[0],
        clienteId: "",
        peso: "",
        motoristaId: "",
        cidadeId: "",
        distancia: "",
        valorPorTonelada: "",
        valorTonMotorista: "",
        valorTonEscritorio: "",
        tipoPagamento: "",
        pagoCliente: false,
        pagoMotorista: false,
        observacao: "",
      });
    }
  }, [frete, reset]);

  function handleCidadeChange(cidadeId: string) {
    setValue("cidadeId", cidadeId);
    const cidade = cidades.find((c) => String(c.id) === cidadeId);
    if (cidade) setValue("distancia", String(cidade.distancia));
  }

  async function onSubmit(values: FormValues) {
    const pesoNum = parseFloat(values.peso) || 0;
    const tons = pesoNum / 1000;
    const valTonNum = parseFloat(values.valorPorTonelada) || 0;
    const valMotNum = parseFloat(values.valorTonMotorista) || 0;
    const valEscNum = parseFloat(values.valorTonEscritorio) || 0;

    const payload = {
      data: values.data,
      clienteId: values.clienteId,
      peso: pesoNum,
      motoristaId: values.motoristaId,
      cidadeId: values.cidadeId,
      distancia: parseFloat(values.distancia) || 0,
      valorPorTonelada: valTonNum,
      valorTonMotorista: valMotNum,
      valorTonEscritorio: valEscNum,
      valorTotal: tons * valTonNum,
      valorMotorista: tons * valMotNum,
      valorEscritorio: tons * valEscNum,
      tipoPagamento: values.tipoPagamento || null,
      pagoCliente: values.pagoCliente,
      pagoMotorista: values.pagoMotorista,
      observacao: values.observacao || null,
    };

    const url = frete ? `/api/fretes/${frete.id}` : "/api/fretes";
    const method = frete ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      toast.error("Erro ao salvar frete");
      return;
    }

    toast.success(frete ? "Frete atualizado" : "Frete criado");
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{frete ? "Editar Frete" : "Novo Frete"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Data</Label>
              <Input type="date" {...register("data", { required: true })} />
            </div>

            <div className="space-y-1.5">
              <Label>Cliente</Label>
              <SearchableSelect
                items={clientes}
                value={watch("clienteId")}
                onChange={(v) => setValue("clienteId", v)}
                placeholder="Buscar cliente..."
              />
            </div>

            <div className="space-y-1.5">
              <Label>Motorista</Label>
              <SearchableSelect
                items={motoristas}
                value={watch("motoristaId")}
                onChange={(v) => setValue("motoristaId", v)}
                placeholder="Buscar motorista..."
              />
            </div>

            <div className="space-y-1.5">
              <Label>Cidade</Label>
              <SearchableSelect
                items={cidades}
                value={watch("cidadeId")}
                onChange={handleCidadeChange}
                placeholder="Buscar cidade..."
                renderLabel={(c) => `${c.nome} (${c.distancia} km)`}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Peso (kg)</Label>
              <Input type="number" step="0.01" {...register("peso")} placeholder="Ex: 14500" />
            </div>

            <div className="space-y-1.5">
              <Label>Distância (km)</Label>
              <Input type="number" {...register("distancia")} readOnly className="bg-muted" />
            </div>

            <div className="space-y-1.5">
              <Label>R$/Ton Total</Label>
              <Input type="number" step="0.01" {...register("valorPorTonelada")} />
            </div>

            <div className="space-y-1.5">
              <Label>R$/Ton Motorista</Label>
              <Input type="number" step="0.01" {...register("valorTonMotorista")} />
            </div>

            <div className="space-y-1.5">
              <Label>R$/Ton Escritório</Label>
              <Input
                type="number"
                step="0.01"
                {...register("valorTonEscritorio")}
                readOnly
                className="bg-muted"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Tipo de Pagamento</Label>
              <Select
                onValueChange={(v) => setValue("tipoPagamento", v ?? "")}
                value={watch("tipoPagamento")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRANSFERÊNCIA">Transferência</SelectItem>
                  <SelectItem value="BOLETO">Boleto</SelectItem>
                  <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                  <SelectItem value="PIX">PIX</SelectItem>
                  <SelectItem value="CHEQUE">Cheque</SelectItem>
                  <SelectItem value="ABSORVIDO">Absorvido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(preview.total > 0 || parseFloat(peso) > 0) && (
            <div className="rounded-md bg-muted p-3 grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="font-semibold">{formatBRL(preview.total)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Motorista</p>
                <p className="font-semibold">{formatBRL(preview.mot)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Escritório</p>
                <p className="font-semibold">{formatBRL(preview.esc)}</p>
              </div>
            </div>
          )}

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" {...register("pagoCliente")} className="h-4 w-4" />
              Cliente pagou
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" {...register("pagoMotorista")} className="h-4 w-4" />
              Motorista recebeu
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : frete ? "Salvar alterações" : "Criar frete"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
