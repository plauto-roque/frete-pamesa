import "dotenv/config";
import * as XLSX from "xlsx";
import * as path from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const COMBINING_DIACRITICS = /[̀-ͯ]/g;

function normalizar(s: string): string {
  return s
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "")
    .replace(/[^A-Z0-9 ]/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function str(v: unknown): string {
  return v != null ? String(v).trim() : "";
}

async function main() {
  const wb = XLSX.readFile(path.resolve(__dirname, "../../CLIENTES - TEMPLATE.xlsx"));
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1 });
  const dados = rows.slice(1).filter((r: unknown[]) => str(r[0]));

  const clientesDb = await prisma.cliente.findMany();
  const mapNorm = new Map<string, typeof clientesDb[0]>();
  for (const c of clientesDb) mapNorm.set(normalizar(c.nome), c);

  let atualizados = 0, criados = 0, ignorados = 0;
  const conflitos: string[] = [];

  for (const row of dados as unknown[][]) {
    const nomeXlsx = str(row[0]).toUpperCase();
    if (!nomeXlsx) continue;

    const normXlsx = normalizar(nomeXlsx);
    const payload = {
      nome:        nomeXlsx,
      fantasia:    str(row[1]).toUpperCase()   || null,
      cnpj:        str(row[2])                || null,
      logradouro:  str(row[3])                || null,
      numero:      str(row[4])                || null,
      bairro:      str(row[5]).toUpperCase()  || null,
      cidade:      str(row[6]).toUpperCase()  || null,
      uf:          str(row[7]).toUpperCase()  || null,
      cep:         str(row[8])                || null,
      telefone1:   str(row[9])                || null,
      telefone2:   str(row[10])               || null,
      email:       str(row[11]).toLowerCase() || null,
      responsavel: str(row[12]).toUpperCase() || null,
      whatsapp:    str(row[13])               || null,
    };

    // 1. Exact normalized match
    let match = mapNorm.get(normXlsx);

    // 2. Truncation match: DB name (normalized) is a prefix of the spreadsheet name
    if (!match) {
      for (const [normDb, cliente] of mapNorm) {
        if (normDb.length >= 30 && normXlsx.startsWith(normDb)) {
          match = cliente;
          break;
        }
      }
    }

    if (match) {
      try {
        await prisma.cliente.update({ where: { id: match.id }, data: payload });
        mapNorm.delete(normalizar(match.nome));
        mapNorm.set(normXlsx, { ...match, nome: nomeXlsx });
        atualizados++;
      } catch {
        conflitos.push(nomeXlsx);
        ignorados++;
      }
    } else {
      try {
        const novo = await prisma.cliente.create({ data: payload });
        mapNorm.set(normXlsx, novo);
        criados++;
      } catch {
        ignorados++;
      }
    }
  }

  console.log(`\nImportacao concluida:`);
  console.log(`  Atualizados : ${atualizados}`);
  console.log(`  Criados     : ${criados}`);
  console.log(`  Ignorados   : ${ignorados}`);
  if (conflitos.length) {
    console.log(`\nConflitos (verificar manualmente):`);
    conflitos.forEach((n) => console.log(`  ${n}`));
  }
}

main().catch(console.error).finally(() => process.exit(0));
