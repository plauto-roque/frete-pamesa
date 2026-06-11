import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cidades = await prisma.cidade.findMany({ orderBy: { nome: "asc" } });
  return NextResponse.json(cidades);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const cidade = await prisma.cidade.create({
    data: { nome: body.nome, distancia: Number(body.distancia) },
  });
  return NextResponse.json(cidade, { status: 201 });
}
