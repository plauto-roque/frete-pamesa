import "dotenv/config";
import * as XLSX from "xlsx";
import * as path from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const wb = XLSX.readFile(path.resolve(__dirname, "../../CLIENTES - TEMPLATE.xlsx"));
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 });

  const nomesXlsx = rows.slice(1)
    .map((r) => String(r[0] ?? "").trim().toUpperCase())
    .filter(Boolean);

  const clientes = await prisma.cliente.findMany({ select: { nome: true } });
  const nomesDb = new Set(clientes.map((c) => c.nome.trim().toUpperCase()));
  const xlsxSet = new Set(nomesXlsx);

  const soBanco = [...nomesDb].filter((n) => !xlsxSet.has(n));
  const soXlsx  = [...xlsxSet].filter((n) => !nomesDb.has(n));
  const iguais  = [...xlsxSet].filter((n) => nomesDb.has(n));

  console.log(`\n✓ Nomes iguais (${iguais.length}):`);
  iguais.sort().forEach((n) => console.log(`   ${n}`));

  console.log(`\n⚠ Só na planilha — novos ou divergentes (${soXlsx.length}):`);
  soXlsx.sort().forEach((n) => console.log(`   ${n}`));

  console.log(`\n⚠ Só no banco — ausentes na planilha (${soBanco.length}):`);
  soBanco.sort().forEach((n) => console.log(`   ${n}`));
}

main().catch(console.error).finally(() => process.exit(0));
