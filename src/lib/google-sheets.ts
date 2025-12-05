import { google } from "googleapis";

// --- FUNÇÃO 1: BUSCA DADOS DO DASHBOARD (Aba "Consulta") ---
export async function getDadosPlanilha() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "'Consulta'!A1:ZZ", 
      valueRenderOption: "FORMATTED_VALUE",
    });

    const rows = response.data.values;
    if (!rows || rows.length < 2) return [];

    // Mapeamento Inteligente
    const headers = rows[0].map(h => h.toString().toLowerCase().trim());
    const getIndex = (termos: string[]) => headers.findIndex(h => termos.some(t => h.includes(t)));

    const idxEmpresa = getIndex(["empresa"]);
    const idxFornecedor = getIndex(["fornecedor"]);
    const idxData = getIndex(["data", "entrada", "emissão"]);
    const idxNfe = getIndex(["nfe", "nota"]);
    const idxProduto = getIndex(["descrição", "produto"]);
    const idxDescItem = getIndex(["descrição item", "item fornecedor"]);
    const idxPlano = getIndex(["plano de contas"]);
    const idxCategoria = getIndex(["categoria"]);
    const idxUn = getIndex(["un. compra", "unidade"]);
    const idxQtd = getIndex(["qtd compra", "quantidade"]);
    const idxUnitario = getIndex(["r$ unitário", "unitario"]);
    const idxTotal = getIndex(["r$ total", "valor total"]);
    const idxTipoMaterial = getIndex(["tipo material"]);
    const idxAlmoxarifado = getIndex(["almoxarifado"]);

    return rows.slice(1).map((row, index) => {
      const limpaValor = (val: string) => {
        if (!val) return 0;
        return parseFloat(String(val).replace(/[^\d,-]/g, "").replace(",", "."));
      };
      
      const valorTotal = limpaValor(row[idxTotal]);
      const valorUnitario = limpaValor(row[idxUnitario]);

      const dataRaw = row[idxData]?.split(" ")[0] || "";
      let dataFormatada = new Date().toISOString();
      if (dataRaw.includes("/")) {
        const [dia, mes, ano] = dataRaw.split("/");
        if (dia && mes && ano) dataFormatada = `${ano}-${mes}-${dia}`;
      }

      let nomeFornecedor = row[idxFornecedor] || "Desconhecido";
      if (nomeFornecedor.includes(" - ")) {
        nomeFornecedor = nomeFornecedor.split(" - ")[1].trim();
      }

      return {
        id: index,
        empresa: row[idxEmpresa] || "Outros",
        fornecedor: nomeFornecedor,
        data: dataFormatada,
        nfe: row[idxNfe] || "",
        descricaoItem: row[idxDescItem] || row[idxProduto] || "Item sem nome",
        planoContas: row[idxPlano] || "Sem Classificação",
        categoria: row[idxCategoria] || "Geral",
        unidade: row[idxUn] || "UN",
        quantidade: row[idxQtd] || "0",
        valorUnitario: isNaN(valorUnitario) ? 0 : valorUnitario,
        valorTotal: isNaN(valorTotal) ? 0 : valorTotal,
        tipoMaterial: row[idxTipoMaterial] || "",
        almoxarifado: row[idxAlmoxarifado] || ""
      };
    });

  } catch (error) {
    console.error("❌ Erro ao ler planilha Consulta:", error);
    return [];
  }
}

// --- FUNÇÃO 2: BUSCA USUÁRIOS (Aba "Usuarios") ---
// Essa é a função que estava faltando e quebrou o build
export async function getUsuarios() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // Busca na aba "Usuarios"
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "'Usuarios'!A1:E", 
    });

    const rows = response.data.values;
    if (!rows || rows.length < 2) return [];

    const headers = rows[0].map(h => h.toString().toLowerCase().trim());
    
    // Mapeia colunas de login
    const idxEmail = headers.findIndex(h => h.includes("email") || h.includes("login"));
    const idxSenha = headers.findIndex(h => h.includes("senha") || h.includes("password"));
    const idxNome = headers.findIndex(h => h.includes("nome"));
    const idxPermissao = headers.findIndex(h => h.includes("permissao") || h.includes("role") || h.includes("cargo"));

    return rows.slice(1).map((row) => ({
      email: row[idxEmail] || "",
      password: row[idxSenha] || "", // O NextAuth geralmente espera 'password'
      name: row[idxNome] || "Sem Nome",
      role: row[idxPermissao] || "user",
    }));

  } catch (error) {
    console.error("❌ Erro ao ler planilha Usuarios:", error);
    return [];
  }
}