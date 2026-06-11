import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const cidade = await prisma.cidade.update({
    where: { id: Number(id) },
    data: { nome: body.nome, distancia: Number(body.distancia) },
  });
  return NextResponse.json(cidade);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.cidade.delete({ where: { id: Number(id) } });
  return new NextResponse(null, { status: 204 });
}
