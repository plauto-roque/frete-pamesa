import "dotenv/config";
import * as XLSX from "xlsx";
import * as path from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const XLSX_PATH = path.resolve(__dirname, "../../FRETE - PAMESA.xlsx");
const ADMIN_EMAIL = "admin@metricapb.com.br";
const ADMIN_PASSWORD = "Nath2210";

function excelDateToJS(serial: number | string): Date | null {
  if (typeof serial === "string") {
    const cleaned = serial.replace(/\//g, "-");
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) return d;
    return null;
  }
  if (typeof serial !== "number" || serial < 40000 || serial > 50000) return null;
  return new Date(Math.round((serial - 25569) * 864e5));
}

function toFloat(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseFloat(v.replace(",", ".")) || 0;
  return 0;
}

function toStr(v: unknown): string {
  if (v == null) return "";
  return String(v).trim().toUpperCase();
}

async function main() {
  console.log("Abrindo planilha:", XLSX_PATH);
  const wb = XLSX.readFile(XLSX_PATH, { cellDates: false });

  // 1. Criar usuário admin
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: { email: ADMIN_EMAIL, password: hash },
  });
  console.log(`Admin criado: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);

  // 2. Importar CIDADES
  const wsCidades = wb.Sheets["CIDADES"];
  const cidadesData = XLSX.utils.sheet_to_json<unknown>(
    wsCidades,
    { header: ["nome", "dist"], range: 0 }
  ) as Array<{ nome: unknown; dist: unknown }>;

  let cidadesCount = 0;
  for (const row of cidadesData) {
    const nome = toStr(row.nome);
    const dist = toFloat(row.dist);
    if (!nome || dist <= 0) continue;
    await prisma.cidade.upsert({
      where: { nome },
      update: { distancia: dist },
      create: { nome, distancia: dist },
    });
    cidadesCount++;
  }
  console.log(`Cidades importadas: ${cidadesCount}`);

  // 3. Importar CLIENTES
  const wsClientes = wb.Sheets["CLIENTES"];
  const clientesData = XLSX.utils.sheet_to_json<string[]>(wsClientes, { header: 1 }) as string[][];
  let clientesCount = 0;
  for (const row of clientesData) {
    const nome = toStr(row[0]);
    if (!nome) continue;
    await prisma.cliente.upsert({
      where: { nome },
      update: {},
      create: { nome },
    });
    clientesCount++;
  }
  console.log(`Clientes importados: ${clientesCount}`);

  // 4. Importar MOTORISTAS e CONTAS
  const wsMotoristas = wb.Sheets["MOTORISTAS"];
  const motoristasData = XLSX.utils.sheet_to_json<string[]>(wsMotoristas, { header: 1 }) as string[][];
  let motoristasCount = 0;
  for (const row of motoristasData) {
    const nome = toStr(row[0]);
    if (!nome) continue;
    await prisma.motorista.upsert({
      where: { nome },
      update: {},
      create: { nome },
    });
    motoristasCount++;
  }

  const wsContas = wb.Sheets["CONTAS"];
  const contasData = XLSX.utils.sheet_to_json<Record<string, unknown>>(wsContas, {
    header: ["motorista", "telefone", "nomeConta", "cpf", "banco", "numeroBanco", "tipoConta", "agencia", "conta"],
    range: 1,
  });
  for (const row of contasData) {
    const nomeMotorista = toStr(row.motorista);
    if (!nomeMotorista) continue;
    const motorista = await prisma.motorista.findUnique({ where: { nome: nomeMotorista } });
    if (!motorista) continue;

    const telefone = row.telefone ? String(row.telefone).trim() : null;
    if (telefone) {
      await prisma.motorista.update({ where: { id: motorista.id }, data: { telefone } });
    }

    const contaData = {
      nomeConta: row.nomeConta ? String(row.nomeConta).trim() : null,
      cpf: row.cpf ? String(row.cpf).trim() : null,
      banco: row.banco ? String(row.banco).trim() : null,
      numeroBanco: row.numeroBanco ? String(row.numeroBanco) : null,
      tipoConta: row.tipoConta ? String(row.tipoConta) : null,
      agencia: row.agencia ? String(row.agencia) : null,
      conta: row.conta ? String(row.conta) : null,
    };

    await prisma.contaBancaria.upsert({
      where: { motoristaId: motorista.id },
      update: contaData,
      create: { motoristaId: motorista.id, ...contaData },
    });
  }
  console.log(`Motoristas importados: ${motoristasCount}`);

  // 5. Importar CONTROLE26 (fretes de 2026)
  await importarFretes(wb, "CONTROLE26", 2);

  // 6. Importar BD_FRETE (histórico)
  await importarFretes(wb, "BD_FRETE", 1);

  await prisma.$disconnect();
  console.log("Seed concluído!");
}

async function importarFretes(wb: XLSX.WorkBook, sheetName: string, startRow: number) {
  const ws = wb.Sheets[sheetName];
  if (!ws) { console.log(`Aba ${sheetName} não encontrada, pulando.`); return; }

  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, {
    header: 1,
    range: startRow,
    defval: null,
  });

  let count = 0;
  let skipped = 0;

  for (const row of rows) {
    const rawData = row[0];
    const data = excelDateToJS(rawData as number | string);
    if (!data) { skipped++; continue; }

    const nomeCliente = toStr(row[1]);
    const peso = toFloat(row[2]);
    const nomeMotorista = toStr(row[3]);
    const nomeCidade = toStr(row[4]);

    if (!nomeCliente || !nomeMotorista || !nomeCidade || peso <= 0) {
      skipped++;
      continue;
    }

    const distancia = toFloat(row[5]);
    const valorTotal = toFloat(sheetName === "CONTROLE26" ? row[9] : row[7]);
    const valorMotorista = toFloat(sheetName === "CONTROLE26" ? row[10] : row[8]);
    const valorEscritorio = toFloat(sheetName === "CONTROLE26" ? row[11] : row[9] ?? 0);
    const tipoPagamento = sheetName === "CONTROLE26" ? toStr(row[12]) || null : toStr(row[13]) || null;
    const pagoCliente = sheetName === "CONTROLE26"
      ? toStr(row[13]) === "SIM"
      : toStr(row[14]) === "SIM";
    const pagoMotorista = sheetName === "CONTROLE26"
      ? toStr(row[14]) === "SIM"
      : toStr(row[15]) === "SIM";

    const tons = peso / 1000;
    const valorPorTonelada = tons > 0 ? valorTotal / tons : 0;
    const valorTonMotorista = tons > 0 ? valorMotorista / tons : 0;
    const valorTonEscritorio = tons > 0 ? valorEscritorio / tons : 0;

    const [cliente, motorista, cidade] = await Promise.all([
      prisma.cliente.upsert({
        where: { nome: nomeCliente },
        update: {},
        create: { nome: nomeCliente },
      }),
      prisma.motorista.upsert({
        where: { nome: nomeMotorista },
        update: {},
        create: { nome: nomeMotorista },
      }),
      prisma.cidade.upsert({
        where: { nome: nomeCidade },
        update: {},
        create: { nome: nomeCidade, distancia: distancia || 0 },
      }),
    ]);

    await prisma.frete.create({
      data: {
        data,
        clienteId: cliente.id,
        peso,
        motoristaId: motorista.id,
        cidadeId: cidade.id,
        distancia: distancia || cidade.distancia,
        valorPorTonelada,
        valorTonMotorista,
        valorTonEscritorio,
        valorTotal,
        valorMotorista,
        valorEscritorio,
        tipoPagamento,
        pagoCliente,
        pagoMotorista,
      },
    });

    count++;
    if (count % 100 === 0) process.stdout.write(`  ${sheetName}: ${count} registros...\r`);
  }

  console.log(`${sheetName}: ${count} fretes importados (${skipped} ignorados)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
