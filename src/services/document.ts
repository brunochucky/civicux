import { type Report } from "@/store/useReportStore";
import jsPDF from "jspdf";

export async function generatePDF(report: Report): Promise<string> {
  // Simulate PDF generation delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const doc = new jsPDF();
  const template = getDocumentTemplate(report);
  
  // Add text to PDF with proper formatting
  const lines = doc.splitTextToSize(template, 180);
  doc.setFontSize(10);
  doc.text(lines, 15, 15);
  
  // Generate blob URL for download
  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  
  return url;
}

export function getDocumentTemplate(report: Report): string {
  const date = new Date().toLocaleDateString('pt-BR');
  
  return `
    REQUERIMENTO ADMINISTRATIVO
    
    À ${report.department}
    
    Assunto: Solicitação de Providências - ${report.title}
    
    Prezados Senhores,
    
    Eu, ${report.authorName}, venho por meio deste solicitar providências urgentes em relação ao problema identificado na data de hoje.
    
    Descrição do Fato:
    ${report.description}
    
    Localização:
    ${report.address ? `Endereço: ${report.address}` : ''}
    Lat: ${report.location.lat}, Lng: ${report.location.lng}
    
    Severidade Identificada: ${report.severity}/10
    
    Solicito que sejam tomadas as medidas cabíveis para a resolução do problema, conforme determina a legislação municipal.
    
    Atenciosamente,
    
    ${report.authorName}
    ${date}
  `;
}
