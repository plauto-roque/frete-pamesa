import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const antes = await prisma.frete.aggregate({
    where: { pagoCliente: false, data: { lt: new Date("2026-01-01") } },
    _sum: { valorTotal: true },
    _count: true,
  });
  const depois = await prisma.frete.aggregate({
    where: { pagoCliente: false, data: { gte: new Date("2026-01-01") } },
    _sum: { valorTotal: true },
    _count: true,
  });
  console.log(`Pendentes anteriores a 2026: ${antes._count} fretes — R$ ${antes._sum.valorTotal}`);
  console.log(`Pendentes de 2026 em diante: ${depois._count} fretes — R$ ${depois._sum.valorTotal}`);
}

main().catch(console.error).finally(() => process.exit(0));
