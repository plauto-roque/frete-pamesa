import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const cliente = await prisma.cliente.update({
    where: { id: Number(id) },
    data: {
      nome: body.nome,
      fantasia: body.fantasia ?? null,
      cnpj: body.cnpj ?? null,
      logradouro: body.logradouro ?? null,
      numero: body.numero ?? null,
      bairro: body.bairro ?? null,
      cidade: body.cidade ?? null,
      uf: body.uf ?? null,
      cep: body.cep ?? null,
      telefone1: body.telefone1 ?? null,
      telefone2: body.telefone2 ?? null,
      email: body.email ?? null,
      responsavel: body.responsavel ?? null,
    },
  });
  return NextResponse.json(cliente);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.cliente.delete({ where: { id: Number(id) } });
  return new NextResponse(null, { status: 204 });
}
