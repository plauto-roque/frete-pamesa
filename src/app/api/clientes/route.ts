import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clientes = await prisma.cliente.findMany({ orderBy: { nome: "asc" } });
  return NextResponse.json(clientes);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const cliente = await prisma.cliente.create({
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
  return NextResponse.json(cliente, { status: 201 });
}
