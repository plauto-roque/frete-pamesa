import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const motoristas = await prisma.motorista.findMany({
    include: { conta: true },
    orderBy: { nome: "asc" },
  });
  return NextResponse.json(motoristas);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const motorista = await prisma.motorista.create({
    data: {
      nome: body.nome,
      telefone: body.telefone ?? null,
      ...(body.conta && {
        conta: { create: body.conta },
      }),
    },
    include: { conta: true },
  });
  return NextResponse.json(motorista, { status: 201 });
}
