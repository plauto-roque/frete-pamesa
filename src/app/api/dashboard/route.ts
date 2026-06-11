import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const hoje = new Date();
  const inicioMes = startOfMonth(hoje);
  const fimMes = endOfMonth(hoje);

  const [
    totalMes,
    viagensMes,
    pendentesCliente,
    pendentesMotorista,
    ultimasViagens,
    topClientes,
    faturamentoMensal,
  ] = await Promise.all([
    prisma.frete.aggregate({
      where: { data: { gte: inicioMes, lte: fimMes } },
      _sum: { valorTotal: true, valorEscritorio: true, valorMotorista: true },
    }),

    prisma.frete.count({
      where: { data: { gte: inicioMes, lte: fimMes } },
    }),

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
        const inicio = startOfMonth(mes);
        const fim = endOfMonth(mes);
        return prisma.frete
          .aggregate({
            where: { data: { gte: inicio, lte: fim } },
            _sum: { valorTotal: true, valorEscritorio: true, valorMotorista: true },
            _count: true,
          })
          .then((r: { _sum: { valorTotal: number | null; valorEscritorio: number | null; valorMotorista: number | null }; _count: number }) => ({
            mes: format(mes, "MMM/yy"),
            total: r._sum.valorTotal ?? 0,
            escritorio: r._sum.valorEscritorio ?? 0,
            motorista: r._sum.valorMotorista ?? 0,
            viagens: r._count,
          }));
      })
    ),
  ]);

  const clienteIds = topClientes.map((t: { clienteId: number }) => t.clienteId);
  const clientes = await prisma.cliente.findMany({
    where: { id: { in: clienteIds } },
    select: { id: true, nome: true },
  });
  const clienteMap = Object.fromEntries(clientes.map((c: { id: number; nome: string }) => [c.id, c.nome]));

  return NextResponse.json({
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
    topClientes: topClientes.map((t: { clienteId: number; _sum: { valorTotal: number | null }; _count: number }) => ({
      clienteId: t.clienteId,
      nome: clienteMap[t.clienteId] ?? "Desconhecido",
      total: t._sum.valorTotal ?? 0,
      viagens: t._count,
    })),
  });
}
