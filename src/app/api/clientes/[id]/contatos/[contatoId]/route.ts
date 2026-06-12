import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string; contatoId: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { contatoId } = await params;
  const body = await req.json();
  const contato = await prisma.contato.update({
    where: { id: Number(contatoId) },
    data: {
      nome:      body.nome,
      telefone1: body.telefone1 ?? null,
      telefone2: body.telefone2 ?? null,
      email:     body.email ?? null,
    },
  });
  return NextResponse.json(contato);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { contatoId } = await params;
  await prisma.contato.delete({ where: { id: Number(contatoId) } });
  return new NextResponse(null, { status: 204 });
}
