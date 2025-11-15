import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { audioConfig } from './config/audio.config';

@Injectable()
export class PdfService {
  async generatePdf(report: any, filename?: string): Promise<string> {
    const outDir = path.resolve(process.cwd(), audioConfig.uploadDestination || './uploads');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const name = filename || `report-${Date.now()}.pdf`;
    const outPath = path.join(outDir, name);

    return new Promise((resolve, reject) => {
      try {
        const doc = new (PDFDocument as any)({ size: 'A4', margin: 50 });
        const stream = fs.createWriteStream(outPath);
        doc.pipe(stream);

        doc.fontSize(18).text('Relatório de Avaliação de Pronúncia', { align: 'center' });
        doc.moveDown();

        doc.fontSize(12).text(`Usuário: ${report.userId || 'N/A'}`);
        doc.text(`Data: ${new Date().toISOString()}`);
        doc.text(`Palavra alvo: ${report.targetWord || ''}`);
        doc.text(`Transcrição: ${report.transcription || ''}`);
        doc.text(`Score: ${report.score ?? 'N/A'}`);
        doc.moveDown();

        doc.fontSize(14).text('Feedback:');
        doc.fontSize(12).text(report.feedback || 'Sem feedback');
        doc.moveDown();

        if (report.suggestions && report.suggestions.length) {
          doc.fontSize(14).text('Sugestões:');
          report.suggestions.forEach((s: string) => doc.fontSize(12).text(`- ${s}`));
        }

        doc.end();
        stream.on('finish', () => resolve(outPath));
        stream.on('error', (err) => reject(err));
      } catch (err) {
        reject(err);
      }
    });
  }
}
