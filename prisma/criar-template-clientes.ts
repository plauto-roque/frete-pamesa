import * as XLSX from "xlsx";
import * as path from "path";

const COLUNAS = [
  "RAZÃO SOCIAL",
  "FANTASIA",
  "CNPJ / CPF",
  "LOGRADOURO",
  "Nº",
  "BAIRRO",
  "CIDADE",
  "UF",
  "CEP",
  "TELEFONE 1",
  "TELEFONE 2",
  "E-MAIL",
  "RESPONSÁVEL",
  "WHATSAPP RESPONSÁVEL",
];

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet([COLUNAS]);

// Larguras das colunas
ws["!cols"] = [
  { wch: 40 }, // RAZÃO SOCIAL
  { wch: 30 }, // FANTASIA
  { wch: 20 }, // CNPJ / CPF
  { wch: 35 }, // LOGRADOURO
  { wch: 6  }, // Nº
  { wch: 20 }, // BAIRRO
  { wch: 20 }, // CIDADE
  { wch: 5  }, // UF
  { wch: 12 }, // CEP
  { wch: 18 }, // TELEFONE 1
  { wch: 18 }, // TELEFONE 2
  { wch: 30 }, // E-MAIL
  { wch: 25 }, // RESPONSÁVEL
  { wch: 18 }, // WHATSAPP
];

XLSX.utils.book_append_sheet(wb, ws, "Clientes");

const dest = path.resolve(__dirname, "../../CLIENTES - TEMPLATE.xlsx");
XLSX.writeFile(wb, dest);
console.log(`Planilha criada: ${dest}`);
