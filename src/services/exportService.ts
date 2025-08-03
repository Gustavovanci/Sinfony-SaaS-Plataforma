import * as XLSX from 'xlsx';

/**
 * Prepara um array de objetos e gera um arquivo Excel para download.
 * @param data - A lista de objetos a serem exportados.
 * @param fileName - O nome do arquivo a ser gerado.
 */
export const exportToExcel = (data: any[], fileName: string) => {
  if (data.length === 0) {
    alert("Não há dados para exportar.");
    return;
  }

  // Cria uma nova "planilha" (worksheet) a partir dos nossos dados.
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Cria um novo "livro" (workbook), que é o arquivo Excel em si.
  const workbook = XLSX.utils.book_new();

  // Adiciona a nossa planilha ao livro, dando um nome a ela.
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório');

  // Opcional: Ajusta a largura das colunas com base no conteúdo.
  const columnWidths = Object.keys(data[0]).map(key => ({
    wch: Math.max(key.length, ...data.map(row => String(row[key] ?? '').length)) + 2
  }));
  worksheet['!cols'] = columnWidths;

  // Gera o arquivo Excel e aciona o download no navegador.
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
