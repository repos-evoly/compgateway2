import { jsPDF } from 'jspdf';
import { registerAmiriFont } from '@/app/lib/pdfFonts';
import type { StatementLine } from './services';

registerAmiriFont();

type Rgb = { r: number; g: number; b: number };
const textCol: Rgb = { r: 0x1f, g: 0x29, b: 0x37 }; // #1F2937

export function generateStatementPdf(
  lines: StatementLine[],
  accountInfo: {
    accountNumber: string;
    customerName: string;
    accountType: string;
    currency: string;
    branchAgency: string;
    timePeriod: string;
  },
  bgImageBase64: string,
  topImageBase64?: string,
  bottomImageBase64?: string
) {
  const doc = new jsPDF({ putOnlyUsedFonts: true, hotfixes: ['px_scaling'] });
  doc.setLanguage('ar');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;

  // Add background image (cover entire page)
  doc.addImage(bgImageBase64, 'JPEG', 0, 0, pageWidth, pageHeight);

  // Add top image (header/banner)
  let topImageHeight = 0;
  if (topImageBase64) {
    topImageHeight = 28; // px, adjust as needed
    doc.addImage(topImageBase64, 'PNG', 0, 0, pageWidth, topImageHeight);
  }

  // Move header boxes further down to be under the watermark/banner
  const offsetForBanner = 40; // px, adjust as needed for your bg image
  const boxTop = topImageHeight + margin + offsetForBanner;
  const boxHeight = 36;
  const boxWidth = (pageWidth - margin * 2 - 4) / 2; // 2px gap between boxes
  const cellHeight = boxHeight / 3;
  const cellWidth = boxWidth / 2;
  const leftBoxLeft = margin;
  const rightBoxLeft = margin + boxWidth + 4;

  // Draw left box grid (3 rows x 2 cols)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.7);
  doc.rect(leftBoxLeft, boxTop, boxWidth, boxHeight, 'S');
  for (let i = 1; i < 3; i++) {
    doc.line(leftBoxLeft, boxTop + i * cellHeight, leftBoxLeft + boxWidth, boxTop + i * cellHeight);
  }
  for (let i = 1; i < 2; i++) {
    doc.line(leftBoxLeft + i * cellWidth, boxTop, leftBoxLeft + i * cellWidth, boxTop + boxHeight);
  }
  // Draw right box grid (3 rows x 2 cols)
  doc.rect(rightBoxLeft, boxTop, boxWidth, boxHeight, 'S');
  for (let i = 1; i < 3; i++) {
    doc.line(rightBoxLeft, boxTop + i * cellHeight, rightBoxLeft + boxWidth, boxTop + i * cellHeight);
  }
  for (let i = 1; i < 2; i++) {
    doc.line(rightBoxLeft + i * cellWidth, boxTop, rightBoxLeft + i * cellWidth, boxTop + boxHeight);
  }

  // Left box data: [row][col] (Account Number, Currency, Branch)
  const leftBoxLabels = [
    { ar: 'رقم الحساب', en: 'Account Number', value: accountInfo.accountNumber },
    { ar: 'العملة', en: 'Currency', value: accountInfo.currency },
    { ar: 'الفرع - الوكالة', en: 'Branch - Agency', value: accountInfo.branchAgency }
  ];
  // Right box data: [row][col] (Customer Name, Account Type, Time Period)
  const rightBoxLabels = [
    { ar: 'اسم الزبون', en: 'Customer Name', value: accountInfo.customerName },
    { ar: 'نوع الحساب', en: 'Account Type', value: accountInfo.accountType },
    { ar: 'الفترة الزمنية', en: 'Time Period', value: accountInfo.timePeriod }
  ];

  // Draw left box cells (labels right col, value left col)
  for (let row = 0; row < 3; row++) {
    // Value cell (left col)
    let x = leftBoxLeft;
    const y = boxTop + row * cellHeight;
    doc.setFont('Amiri', 'normal').setFontSize(8).setTextColor(textCol.r, textCol.g, textCol.b);
    doc.text(leftBoxLabels[row].value, x + cellWidth / 2, y + cellHeight / 2 + 1, { align: 'center', baseline: 'middle' });
    // Label cell (right col)
    x = leftBoxLeft + cellWidth;
    doc.setFont('Amiri', 'normal').setFontSize(8).setTextColor(textCol.r, textCol.g, textCol.b);
    doc.text(leftBoxLabels[row].ar, x + cellWidth / 2, y + 4, { align: 'center', baseline: 'top' });
    doc.setFont('Amiri', 'bold').setFontSize(8).setTextColor(textCol.r, textCol.g, textCol.b);
    doc.text(leftBoxLabels[row].en, x + cellWidth / 2, y + cellHeight - 2, { align: 'center', baseline: 'bottom' });
  }
  // Draw right box cells (labels right col, value left col)
  for (let row = 0; row < 3; row++) {
    // Value cell (left col)
    let x = rightBoxLeft;
    const y = boxTop + row * cellHeight;
    doc.setFont('Amiri', 'normal').setFontSize(8).setTextColor(textCol.r, textCol.g, textCol.b);
    doc.text(rightBoxLabels[row].value, x + cellWidth / 2, y + cellHeight / 2 + 1, { align: 'center', baseline: 'middle' });
    // Label cell (right col)
    x = rightBoxLeft + cellWidth;
    doc.setFont('Amiri', 'normal').setFontSize(8).setTextColor(textCol.r, textCol.g, textCol.b);
    doc.text(rightBoxLabels[row].ar, x + cellWidth / 2, y + 4, { align: 'center', baseline: 'top' });
    doc.setFont('Amiri', 'bold').setFontSize(8);
    doc.text(rightBoxLabels[row].en, x + cellWidth / 2, y + cellHeight - 2, { align: 'center', baseline: 'bottom' });
  }

  // Table (unchanged for first page)
  const tableTop = boxTop + boxHeight + 8;
  const tableTopSubsequent = margin + 45; // Raise table on non-first pages
  const colWidths = [24, 24, 24, 60, 32, 32];
  const tableCols = colWidths.length;
  const tableWidth = colWidths.reduce((a, b) => a + b, 0);
  const tableLeft = (pageWidth - tableWidth) / 2;
  const rowHeight = 13;

  // Table headers (bilingual)
  const tableHeaders = [
    { ar: 'الرصيد', en: 'Balance' },
    { ar: 'دائن', en: 'Credit' },
    { ar: 'مدين', en: 'Debit' },
    { ar: 'البيان', en: 'Ref. Desc' },
    { ar: 'الرمز', en: '.Ref' },
    { ar: 'التاريخ', en: 'Date' },
  ];

  // Draw table header row with gray background and styled text
  let y = tableTop;
  let x = tableLeft;
  const headerFontSize = 8;
  for (let i = 0; i < tableCols; i++) {
    // Gray background
    doc.setFillColor(220, 220, 220);
    doc.rect(x, y, colWidths[i], rowHeight, 'F');
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(x, y, colWidths[i], rowHeight, 'S');
    // Arabic label (top, Amiri)
    doc.setFont('Amiri', 'normal').setFontSize(headerFontSize).setTextColor(textCol.r, textCol.g, textCol.b);
    doc.text(tableHeaders[i].ar, x + colWidths[i] / 2, y + 4, { align: 'center', baseline: 'top' });
    // English label (Helvetica bold, bottom)
    doc.setFont('helvetica', 'bold').setFontSize(headerFontSize);
    doc.text(tableHeaders[i].en, x + colWidths[i] / 2, y + rowHeight - 2, { align: 'center', baseline: 'bottom' });
    x += colWidths[i];
  }

  // Table rows: first page
  y += rowHeight;
  doc.setFont('Amiri', 'normal').setFontSize(10);
  const lineHeight = 10 * 0.35; // approx. line height in jsPDF
  let rowIdx = 0;
  while (rowIdx < lines.length) {
    // For first page, fill as many rows as fit
    let rowsOnThisPage = 0;
    while (rowIdx < lines.length && rowsOnThisPage < 20 && y + rowHeight < pageHeight - margin - 20) {
      x = tableLeft;
      // Prepare all cell texts and wrapped lines for this row
      const cellContents: string[][] = [];
      for (let i = 0; i < tableCols; i++) {
        let cellText = '';
        switch (i) {
          case 0:
            cellText = lines[rowIdx].balance !== undefined ? String(lines[rowIdx].balance) : '';
            break;
          case 1:
            cellText = lines[rowIdx].amount > 0 ? String(lines[rowIdx].amount) : '';
            break;
          case 2:
            cellText = lines[rowIdx].amount < 0 ? String(Math.abs(lines[rowIdx].amount)) : '';
            break;
          case 3:
            cellText = [lines[rowIdx].nr1, lines[rowIdx].nr2, lines[rowIdx].nr3].filter(Boolean).join(' ');
            break;
          case 4:
            cellText = lines[rowIdx].trxCode ?? '';
            break;
          case 5:
            cellText = lines[rowIdx].postingDate ? new Date(lines[rowIdx].postingDate).toISOString().slice(0, 10).replace(/-/g, '') : '';
            break;
        }
        cellContents[i] = doc.splitTextToSize(cellText, colWidths[i] - 2);
      }
      // Find max number of lines for this row
      const maxLines = Math.max(...cellContents.map(arr => arr.length));
      const thisRowHeight = maxLines * lineHeight + 3; // 3px padding
      // Alternate row background
      if (rowIdx % 2 === 0) {
        doc.setFillColor(240, 248, 240);
        doc.rect(tableLeft, y, tableWidth, thisRowHeight, 'F');
      }
      // Draw row borders and cells, and center text block vertically
      x = tableLeft;
      for (let i = 0; i < tableCols; i++) {
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.3);
        doc.rect(x, y, colWidths[i], thisRowHeight, 'S');
        const linesArr = cellContents[i];
        const textBlockHeight = linesArr.length * lineHeight;
        const yOffset = y + (thisRowHeight - textBlockHeight) / 2 + lineHeight / 2;
        doc.setFont('Amiri', 'normal').setFontSize(10);
        doc.text(linesArr, x + colWidths[i] / 2, yOffset, { align: 'center', baseline: 'middle' });
        x += colWidths[i];
      }
      y += thisRowHeight;
      rowIdx++;
      rowsOnThisPage++;
      // If 20 rows or page full, break to new page
      if (rowsOnThisPage === 20 || y + rowHeight > pageHeight - margin - 20) {
        break;
      }
    }
    if (rowIdx < lines.length) {
      doc.addPage();
      doc.addImage(bgImageBase64, 'JPEG', 0, 0, pageWidth, pageHeight);
      // On subsequent pages, start table higher (just under the margin)
      y = tableTopSubsequent;
      x = tableLeft;
      // Draw table header row again
      for (let i = 0; i < tableCols; i++) {
        doc.setFillColor(220, 220, 220);
        doc.rect(x, y, colWidths[i], rowHeight, 'F');
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.rect(x, y, colWidths[i], rowHeight, 'S');
        doc.setFont('Amiri', 'normal').setFontSize(headerFontSize).setTextColor(textCol.r, textCol.g, textCol.b);
        doc.text(tableHeaders[i].ar, x + colWidths[i] / 2, y + 4, { align: 'center', baseline: 'top' });
        doc.setFont('helvetica', 'bold').setFontSize(headerFontSize);
        doc.text(tableHeaders[i].en, x + colWidths[i] / 2, y + rowHeight - 2, { align: 'center', baseline: 'bottom' });
        x += colWidths[i];
      }
      y += rowHeight;
    } else {
      break;
    }
  }

  // Add bottom image (footer) at the bottom of the page
  if (bottomImageBase64) {
    const bottomImageHeight = 18; // px, adjust as needed
    doc.addImage(bottomImageBase64, 'PNG', 0, pageHeight - bottomImageHeight, pageWidth, bottomImageHeight);
  }

  doc.save(`statement_${accountInfo.accountNumber}_${new Date().toISOString().split('T')[0]}.pdf`);
} 