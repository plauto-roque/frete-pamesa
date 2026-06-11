import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const frete = await prisma.frete.findUnique({
    where: { id: Number(id) },
    include: { cliente: true, motorista: true, cidade: true },
  });
  if (!frete) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(frete);
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const frete = await prisma.frete.update({
    where: { id: Number(id) },
    data: {
      data: body.data ? new Date(body.data) : undefined,
      clienteId: body.clienteId ? Number(body.clienteId) : undefined,
      peso: body.peso !== undefined ? Number(body.peso) : undefined,
      motoristaId: body.motoristaId ? Number(body.motoristaId) : undefined,
      cidadeId: body.cidadeId ? Number(body.cidadeId) : undefined,
      distancia: body.distancia !== undefined ? Number(body.distancia) : undefined,
      valorPorTonelada: body.valorPorTonelada !== undefined ? Number(body.valorPorTonelada) : undefined,
      valorTonMotorista: body.valorTonMotorista !== undefined ? Number(body.valorTonMotorista) : undefined,
      valorTonEscritorio: body.valorTonEscritorio !== undefined ? Number(body.valorTonEscritorio) : undefined,
      valorTotal: body.valorTotal !== undefined ? Number(body.valorTotal) : undefined,
      valorMotorista: body.valorMotorista !== undefined ? Number(body.valorMotorista) : undefined,
      valorEscritorio: body.valorEscritorio !== undefined ? Number(body.valorEscritorio) : undefined,
      tipoPagamento: body.tipoPagamento,
      pagoCliente: body.pagoCliente !== undefined ? Boolean(body.pagoCliente) : undefined,
      pagoMotorista: body.pagoMotorista !== undefined ? Boolean(body.pagoMotorista) : undefined,
      observacao: body.observacao,
    },
    include: { cliente: true, motorista: true, cidade: true },
  });
  return NextResponse.json(frete);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.frete.delete({ where: { id: Number(id) } });
  return new NextResponse(null, { status: 204 });
}
