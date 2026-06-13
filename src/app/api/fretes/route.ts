import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "20");
  const clienteId = searchParams.get("clienteId");
  const motoristaId = searchParams.get("motoristaId");
  const cidadeId = searchParams.get("cidadeId");
  const dataInicio = searchParams.get("dataInicio");
  const dataFim = searchParams.get("dataFim");
  const pagoCliente = searchParams.get("pagoCliente");
  const pagoMotorista = searchParams.get("pagoMotorista");
  const tipoPagamento = searchParams.get("tipoPagamento");

  const where = {
    ...(clienteId && { clienteId: Number(clienteId) }),
    ...(motoristaId && { motoristaId: Number(motoristaId) }),
    ...(cidadeId && { cidadeId: Number(cidadeId) }),
    ...(dataInicio || dataFim
      ? {
          data: {
            ...(dataInicio && { gte: new Date(dataInicio) }),
            ...(dataFim && { lte: new Date(dataFim) }),
          },
        }
      : {}),
    ...(tipoPagamento ? { tipoPagamento } : {}),
    ...(pagoCliente !== null && pagoCliente !== ""
      ? { pagoCliente: pagoCliente === "true" }
      : {}),
    ...(pagoMotorista !== null && pagoMotorista !== ""
      ? { pagoMotorista: pagoMotorista === "true" }
      : {}),
  };

  const [total, fretes] = await Promise.all([
    prisma.frete.count({ where }),
    prisma.frete.findMany({
      where,
      include: {
        cliente: true,
        motorista: true,
        cidade: true,
      },
      orderBy: { data: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({ fretes, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const frete = await prisma.frete.create({
    data: {
      data: new Date(body.data),
      clienteId: Number(body.clienteId),
      peso: Number(body.peso),
      motoristaId: Number(body.motoristaId),
      cidadeId: Number(body.cidadeId),
      distancia: Number(body.distancia),
      valorPorTonelada: Number(body.valorPorTonelada),
      valorTonMotorista: Number(body.valorTonMotorista),
      valorTonEscritorio: Number(body.valorTonEscritorio),
      valorTotal: Number(body.valorTotal),
      valorMotorista: Number(body.valorMotorista),
      valorEscritorio: Number(body.valorEscritorio),
      tipoPagamento: body.tipoPagamento ?? null,
      pagoCliente: Boolean(body.pagoCliente),
      pagoMotorista: Boolean(body.pagoMotorista),
      observacao: body.observacao ?? null,
    },
    include: { cliente: true, motorista: true, cidade: true },
  });
  return NextResponse.json(frete, { status: 201 });
}
