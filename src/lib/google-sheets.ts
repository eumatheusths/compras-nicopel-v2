import { google } from "googleapis";

export async function getDadosPlanilha() {
  try {
    // 1. Autenticação com o Google
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // 2. Busca TODAS as colunas da aba "Consulta" (A1 até ZZ)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "'Consulta'!A1:ZZ", 
      valueRenderOption: "FORMATTED_VALUE", // Recebe os dados como texto formatado
    });

    const rows = response.data.values;
    if (!rows || rows.length < 2) return [];

    // --- 3. MAPEAMENTO DINÂMICO DE COLUNAS ---
    // Transforma o cabeçalho em minúsculo para buscar sem erro
    const headers = rows[0].map(h => h.toString().toLowerCase().trim());
    
    // Função auxiliar que encontra o índice da coluna procurando por palavras-chave
    const getIndex = (termos: string[]) => headers.findIndex(h => termos.some(t => h.includes(t)));

    // Mapeia os índices baseados nos nomes reais da planilha
    const idxEmpresa = getIndex(["empresa"]);                           // Coluna A
    const idxFornecedor = getIndex(["fornecedor"]);                     // Coluna B
    const idxData = getIndex(["data", "entrada", "emissão"]);           // Coluna C
    const idxNfe = getIndex(["nfe", "nota", "número"]);                 // Coluna D
    const idxProduto = getIndex(["descrição", "produto"]);              // Coluna H (Descrição Genérica)
    const idxDescItem = getIndex(["descrição item", "item fornecedor"]); // Coluna I (Descrição Detalhada)
    const idxPlano = getIndex(["plano de contas"]);                     // Coluna P
    const idxCategoria = getIndex(["categoria"]);                       // Coluna Q
    const idxUn = getIndex(["un. compra", "unidade"]);                  // Coluna R
    const idxQtd = getIndex(["qtd compra", "quantidade"]);              // Coluna S
    const idxUnitario = getIndex(["r$ unitário", "vlr unit", "unitario"]); // Coluna U
    const idxTotal = getIndex(["r$ total", "valor total"]);             // Coluna X
    
    // Se quiser ler Almoxarifado/Tipo Material também (opcional, mas bom ter)
    const idxTipoMaterial = getIndex(["tipo material"]);                // Coluna W
    const idxAlmoxarifado = getIndex(["almoxarifado"]);                 // Coluna AB

    // --- 4. PROCESSAMENTO DAS LINHAS ---
    // Remove o cabeçalho (slice 1) e mapeia os dados
    return rows.slice(1).map((row, index) => {
      
      // Função limpadora de moeda (R$ 1.000,00 -> 1000.00)
      const limpaValor = (val: string) => {
        if (!val) return 0;
        return parseFloat(String(val).replace(/[^\d,-]/g, "").replace(",", "."));
      };
      
      const valorTotal = limpaValor(row[idxTotal]);
      const valorUnitario = limpaValor(row[idxUnitario]);

      // Tratamento de Data (DD/MM/YYYY -> YYYY-MM-DD)
      const dataRaw = row[idxData]?.split(" ")[0] || "";
      let dataFormatada = new Date().toISOString(); // Fallback para hoje
      if (dataRaw.includes("/")) {
        const [dia, mes, ano] = dataRaw.split("/");
        if (dia && mes && ano) dataFormatada = `${ano}-${mes}-${dia}`;
      }

      // Limpeza de Fornecedor (Remove CNPJ do início se houver " - ")
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
        
        // Detalhes do Produto
        descricaoItem: row[idxDescItem] || row[idxProduto] || "Item sem nome", // Usa I, se não tiver usa H
        
        // Classificação Financeira
        planoContas: row[idxPlano] || "Sem Classificação",
        categoria: row[idxCategoria] || "Geral",
        
        // Dados Quantitativos
        unidade: row[idxUn] || "UN",
        quantidade: row[idxQtd] || "0",
        
        // Valores Numéricos
        valorUnitario: isNaN(valorUnitario) ? 0 : valorUnitario,
        valorTotal: isNaN(valorTotal) ? 0 : valorTotal,

        // Extras (caso precise no futuro)
        tipoMaterial: row[idxTipoMaterial] || "",
        almoxarifado: row[idxAlmoxarifado] || ""
      };
    });

  } catch (error) {
    console.error("❌ Erro crítico ao ler planilha:", error);
    return [];
  }
}