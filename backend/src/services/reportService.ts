import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { prisma } from '../config/db';

export class ReportService {
  static async generateCSV(type: string, data: any[]): Promise<string> {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map((header) => {
        const val = row[header];
        const valStr = val instanceof Date ? val.toISOString() : String(val ?? '');
        const escaped = valStr.replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  static async generateExcel(
  sheetName: string,
  columns: { header: string; key: string; width: number }[],
  data: any[]
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  worksheet.columns = columns;

  // Apply header styles
  worksheet.getRow(1).font = {
    bold: true,
    color: { argb: "FFFFFF" },
  };

  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "1E3A8A" },
  };

  for (const row of data) {
    worksheet.addRow(row);
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return Buffer.from(buffer);
}

  static async generatePDF(title: string, headers: string[], rows: string[][]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // Title & Header
      doc.fontSize(20).fillColor('#1e3a8a').text(title, { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).fillColor('#555555').text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });
      doc.moveDown(2);

      // Table Setup
      const startX = 40;
      let startY = doc.y;
      const rowHeight = 25;
      const tableWidth = 515;
      const colWidth = tableWidth / headers.length;

      // Draw table headers
      doc.fillColor('#1e3a8a').rect(startX, startY, tableWidth, rowHeight).fill();
      doc.fillColor('#ffffff').fontSize(10);
      
      headers.forEach((header, i) => {
        doc.text(header, startX + i * colWidth + 5, startY + 8, { width: colWidth - 10, align: 'left' });
      });

      startY += rowHeight;
      doc.fillColor('#000000');

      // Draw table rows
      rows.forEach((row, rowIndex) => {
        // Alternating row background
        if (rowIndex % 2 === 0) {
          doc.fillColor('#f3f4f6').rect(startX, startY, tableWidth, rowHeight).fill();
        }

        doc.fillColor('#374151');
        row.forEach((cell, i) => {
          doc.text(cell || '', startX + i * colWidth + 5, startY + 8, { width: colWidth - 10, align: 'left' });
        });

        startY += rowHeight;

        // Auto Page break
        if (startY > doc.page.height - 60) {
          doc.addPage();
          startY = 40;
        }
      });

      doc.end();
    });
  }
}
