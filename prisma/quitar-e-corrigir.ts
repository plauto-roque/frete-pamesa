import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const quitados = await prisma.frete.updateMany({
    where: { data: { lt: new Date("2026-01-01") } },
    data: { pagoCliente: true, pagoMotorista: true },
  });
  console.log(`Quitação: ${quitados.count} fretes anteriores a 2026 marcados como pagos.`);

  const corrigidos = await prisma.frete.updateMany({
    where: { tipoPagamento: "FUMO" },
    data: { tipoPagamento: "ABSORVIDO" },
  });
  console.log(`FUMO → ABSORVIDO: ${corrigidos.count} fretes atualizados.`);
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
