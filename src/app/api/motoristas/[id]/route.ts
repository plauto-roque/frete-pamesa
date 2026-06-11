import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const motorista = await prisma.motorista.update({
    where: { id: Number(id) },
    data: {
      nome: body.nome,
      telefone: body.telefone ?? null,
      ...(body.conta && {
        conta: {
          upsert: {
            create: body.conta,
            update: body.conta,
          },
        },
      }),
    },
    include: { conta: true },
  });
  return NextResponse.json(motorista);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.motorista.delete({ where: { id: Number(id) } });
  return new NextResponse(null, { status: 204 });
}
