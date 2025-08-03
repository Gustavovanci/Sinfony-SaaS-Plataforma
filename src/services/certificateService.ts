import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Importa para estender o jsPDF, mesmo que não seja usado diretamente aqui

// Define os dados necessários para gerar o certificado
interface CertificateData {
  userName: string;
  moduleTitle: string;
  completionDate: string;
  organizationName?: string;
}

/**
 * Cria e aciona o download de um PDF de certificado.
 * @param data - As informações a serem incluídas no certificado.
 */
export const generateCertificatePDF = (data: CertificateData) => {
  // 1. Inicializa o documento PDF em modo paisagem (landscape)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 2. Adiciona um título principal
  doc.setFontSize(30);
  doc.setFont('helvetica', 'bold');
  doc.text('CERTIFICADO DE CONCLUSÃO', pageWidth / 2, pageHeight / 2 - 40, { align: 'center' });

  // 3. Adiciona o texto principal
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('Certificamos que', pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });

  // 4. Adiciona o nome do usuário em destaque
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.text(data.userName, pageWidth / 2, pageHeight / 2, { align: 'center' });

  // 5. Adiciona o restante do texto
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('concluiu com sucesso o treinamento:', pageWidth / 2, pageHeight / 2 + 10, { align: 'center' });

  // 6. Adiciona o nome do módulo
  doc.setFontSize(20);
  doc.setFont('helvetica', 'italic');
  doc.text(data.moduleTitle, pageWidth / 2, pageHeight / 2 + 25, { align: 'center' });

  // 7. Adiciona a data de conclusão
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Concluído em: ${data.completionDate}`, pageWidth / 2, pageHeight / 2 + 50, { align: 'center' });
  
  // 8. Adiciona o nome da organização (se existir)
  if (data.organizationName) {
    doc.text(data.organizationName, pageWidth / 2, pageHeight - 20, { align: 'center' });
  }

  // 9. Salva o arquivo PDF, acionando o download no navegador
  doc.save(`Certificado-${data.moduleTitle.replace(/ /g, '_')}.pdf`);
};
