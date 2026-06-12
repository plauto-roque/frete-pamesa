import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const contato = await prisma.contato.create({
    data: {
      clienteId: Number(id),
      nome:      body.nome,
      telefone1: body.telefone1 ?? null,
      telefone2: body.telefone2 ?? null,
      email:     body.email ?? null,
    },
  });
  return NextResponse.json(contato, { status: 201 });
}
