"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface FaturamentoData {
  mes: string;
  total: number;
  escritorio: number;
  motorista: number;
  viagens: number;
}

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);
}

export function FaturamentoChart({ data }: { data: FaturamentoData[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#45464d" vertical={false} />
        <XAxis
          dataKey="mes"
          tick={{ fontSize: 12, fill: "#c6c6cd" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) =>
            new Intl.NumberFormat("pt-BR", { notation: "compact" }).format(v)
          }
          tick={{ fontSize: 11, fill: "#c6c6cd" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1b2b3f",
            border: "1px solid #45464d",
            borderRadius: "8px",
            color: "#d3e4fe",
          }}
          labelStyle={{ color: "#d3e4fe", fontWeight: 600 }}
          formatter={(value, name) => [
            formatBRL(Number(value ?? 0)),
            name === "escritorio" ? "Escritório" : "Motoristas",
          ]}
        />
        <Legend
          formatter={(v) => (v === "escritorio" ? "Escritório" : "Motoristas")}
          wrapperStyle={{ color: "#c6c6cd", fontSize: "12px" }}
        />
        <Bar dataKey="escritorio" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
        <Bar dataKey="motorista" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
