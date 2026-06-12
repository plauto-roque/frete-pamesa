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
  const abaIdx = wb.SheetNames.findIndex((n) => n.toUpperCase().includes("RESPONSAV"));
  if (abaIdx < 0) { console.error("Aba RESPONSAVEIS nao encontrada"); process.exit(1); }
  const ws = wb.Sheets[wb.SheetNames[abaIdx]];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1 });

  // Carrega todos os clientes e monta mapa normalizado
  const clientes = await prisma.cliente.findMany();
  const mapNorm = new Map<string, number>(); // normName -> clienteId
  for (const c of clientes) mapNorm.set(normalizar(c.nome), c.id);

  let criados = 0, semCliente = 0;
  const naoEncontrados = new Set<string>();

  for (const row of rows.slice(1) as unknown[][]) {
    const nomeContato = str(row[0]).toUpperCase();
    const orgXlsx     = str(row[1]).toUpperCase();
    if (!nomeContato || !orgXlsx) continue;

    const normOrg = normalizar(orgXlsx);

    // Busca exata
    let clienteId = mapNorm.get(normOrg);

    // Busca por truncamento (DB name é prefixo do nome da planilha)
    if (!clienteId) {
      for (const [normDb, id] of mapNorm) {
        if (normDb.length >= 30 && normOrg.startsWith(normDb)) {
          clienteId = id;
          break;
        }
      }
    }

    if (!clienteId) {
      naoEncontrados.add(orgXlsx);
      semCliente++;
      continue;
    }

    // Primeiro e-mail disponível
    const email =
      str(row[5]).toLowerCase() ||
      str(row[6]).toLowerCase() ||
      str(row[7]).toLowerCase() ||
      null;

    await prisma.contato.create({
      data: {
        clienteId,
        nome:      nomeContato,
        telefone1: str(row[2]) || null,
        telefone2: str(row[3]) || str(row[4]) || null,
        email,
      },
    });
    criados++;
  }

  console.log(`\nImportacao de contatos concluida:`);
  console.log(`  Criados          : ${criados}`);
  console.log(`  Sem cliente (DB) : ${semCliente}`);
  if (naoEncontrados.size) {
    console.log(`\nEmpresas nao encontradas no banco (primeiras 20):`);
    [...naoEncontrados].slice(0, 20).forEach((n) => console.log(`  ${n}`));
  }
}

main().catch(console.error).finally(() => process.exit(0));
