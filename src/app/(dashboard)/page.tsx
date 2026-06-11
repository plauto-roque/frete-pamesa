import { KpiCard } from "@/components/dashboard/KpiCard";
import { FaturamentoChart } from "@/components/dashboard/FaturamentoChart";
import { formatBRL, formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

async function getDashboardData() {
  const hoje = new Date();
  const inicioMes = startOfMonth(hoje);
  const fimMes = endOfMonth(hoje);

  const [
    totalMes,
    viagensMes,
    pendentesCliente,
    pendentesMotorista,
    ultimasViagens,
    topClientesRaw,
    faturamentoMensal,
  ] = await Promise.all([
    prisma.frete.aggregate({
      where: { data: { gte: inicioMes, lte: fimMes } },
      _sum: { valorTotal: true, valorEscritorio: true, valorMotorista: true },
    }),
    prisma.frete.count({ where: { data: { gte: inicioMes, lte: fimMes } } }),
    prisma.frete.aggregate({
      where: { pagoCliente: false },
      _sum: { valorTotal: true },
      _count: true,
    }),
    prisma.frete.aggregate({
      where: { pagoMotorista: false },
      _sum: { valorMotorista: true },
      _count: true,
    }),
    prisma.frete.findMany({
      take: 10,
      orderBy: { data: "desc" },
      include: { cliente: true, motorista: true, cidade: true },
    }),
    prisma.frete.groupBy({
      by: ["clienteId"],
      where: { data: { gte: startOfMonth(subMonths(hoje, 5)) } },
      _sum: { valorTotal: true },
      _count: true,
      orderBy: { _sum: { valorTotal: "desc" } },
      take: 5,
    }),
    Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const mes = subMonths(hoje, 5 - i);
        return prisma.frete
          .aggregate({
            where: { data: { gte: startOfMonth(mes), lte: endOfMonth(mes) } },
            _sum: { valorTotal: true, valorEscritorio: true, valorMotorista: true },
            _count: true,
          })
          .then((r) => ({
            mes: format(mes, "MMM/yy"),
            total: r._sum.valorTotal ?? 0,
            escritorio: r._sum.valorEscritorio ?? 0,
            motorista: r._sum.valorMotorista ?? 0,
            viagens: r._count,
          }));
      })
    ),
  ]);

  const clienteIds = topClientesRaw.map((t) => t.clienteId);
  const clientes = await prisma.cliente.findMany({
    where: { id: { in: clienteIds } },
    select: { id: true, nome: true },
  });
  const clienteMap = Object.fromEntries(clientes.map((c) => [c.id, c.nome]));

  return {
    kpis: {
      totalMes: totalMes._sum.valorTotal ?? 0,
      escritorioMes: totalMes._sum.valorEscritorio ?? 0,
      motoristasMes: totalMes._sum.valorMotorista ?? 0,
      viagensMes,
      pendentesCliente: {
        valor: pendentesCliente._sum.valorTotal ?? 0,
        count: pendentesCliente._count,
      },
      pendentesMotorista: {
        valor: pendentesMotorista._sum.valorMotorista ?? 0,
        count: pendentesMotorista._count,
      },
    },
    faturamentoMensal,
    ultimasViagens,
    topClientes: topClientesRaw.map((t) => ({
      clienteId: t.clienteId,
      nome: clienteMap[t.clienteId] ?? "Desconhecido",
      total: t._sum.valorTotal ?? 0,
      viagens: t._count,
    })),
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  const { kpis, faturamentoMensal, ultimasViagens, topClientes } = data;

  return (
    <div className="p-8 space-y-8">
      {/* Page header */}
      <div>
        <h2 className="text-xl font-semibold text-on-surface tracking-tight">Dashboard</h2>
        <p className="text-sm text-on-surface-variant mt-0.5">
          Visão geral do mês atual
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Faturamento do Mês"
          value={formatBRL(kpis.totalMes)}
          sub={`${kpis.viagensMes} viagens`}
          icon="local_shipping"
        />
        <KpiCard
          title="Receita Escritório"
          value={formatBRL(kpis.escritorioMes)}
          sub={`${((kpis.escritorioMes / (kpis.totalMes || 1)) * 100).toFixed(1)}% do total`}
          icon="payments"
        />
        <KpiCard
          title="A Receber (Clientes)"
          value={formatBRL(kpis.pendentesCliente.valor)}
          sub={`${kpis.pendentesCliente.count} fretes em aberto`}
          icon="warning"
          variant={kpis.pendentesCliente.count > 0 ? "danger" : "default"}
        />
        <KpiCard
          title="A Pagar (Motoristas)"
          value={formatBRL(kpis.pendentesMotorista.valor)}
          sub={`${kpis.pendentesMotorista.count} aguardando pagamento`}
          icon="badge"
          variant={kpis.pendentesMotorista.count > 0 ? "warning" : "default"}
        />
      </div>

      {/* Chart + Top Clientes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-6 lg:col-span-2">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-on-surface">Faturamento Mensal</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">Escritório vs motoristas — últimos 6 meses</p>
          </div>
          <FaturamentoChart data={faturamentoMensal} />
        </div>

        <div className="glass-card rounded-xl p-6">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-on-surface">Top Clientes</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">Últimos 6 meses</p>
          </div>
          <div className="space-y-4">
            {topClientes.map((c, i) => {
              const pct = (c.total / (topClientes[0]?.total || 1)) * 100;
              return (
                <div key={c.clienteId} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-mono text-on-surface-variant shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <p className="text-sm text-on-surface truncate">{c.nome}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-on-surface">{formatBRL(c.total)}</p>
                      <p className="text-xs text-on-surface-variant">{c.viagens}x</p>
                    </div>
                  </div>
                  <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary/60 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Últimas viagens */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant">
          <h3 className="text-base font-semibold text-on-surface">Últimas Viagens</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">10 registros mais recentes</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-container-high border-b border-outline-variant">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Motorista
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Cidade
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {ultimasViagens.map((f) => (
                <tr key={f.id} className="hover:bg-surface-container-highest/50 transition-colors">
                  <td className="px-6 py-3 text-sm text-on-surface-variant font-mono">
                    {formatDate(f.data)}
                  </td>
                  <td className="px-6 py-3 text-sm text-on-surface font-medium max-w-[200px] truncate">
                    {f.cliente.nome}
                  </td>
                  <td className="px-6 py-3 text-sm text-on-surface-variant">
                    {f.motorista.nome}
                  </td>
                  <td className="px-6 py-3 text-sm text-on-surface-variant">
                    {f.cidade.nome}
                  </td>
                  <td className="px-6 py-3 text-sm text-on-surface font-semibold text-right font-mono">
                    {formatBRL(f.valorTotal)}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex gap-1.5">
                      <span
                        className={
                          f.pagoCliente
                            ? "text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }
                      >
                        {f.pagoCliente ? "Pago" : "Pendente"}
                      </span>
                      <span
                        className={
                          f.pagoMotorista
                            ? "text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "text-xs px-2.5 py-0.5 rounded-full font-semibold bg-surface-container-highest text-on-surface-variant border border-outline-variant"
                        }
                      >
                        Mot.{f.pagoMotorista ? " ✓" : " ✗"}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
