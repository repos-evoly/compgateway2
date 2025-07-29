/* src/lib/pdf/transferPdf.ts
   --------------------------------------------------------------
   Generates (1) a full-page "transfer confirmation" PDF (A4) and
   (2) a narrow receipt-style PDF (80 mm) – both Arabic-ready.
   Requires pdfFonts.ts to have registered Amiri. No "any", no
   interface, strict TypeScript.
----------------------------------------------------------------- */

import { jsPDF } from 'jspdf';
import { registerAmiriFont } from './pdfFonts';

registerAmiriFont();

/* ---------- helpers ---------- */
type Rgb = { r: number; g: number; b: number };
const primary: Rgb   = { r: 0x2A, g: 0x6C, b: 0x57 }; // Project's info.dark green (#2A6C57)
const textCol: Rgb   = { r: 0x1f, g: 0x29, b: 0x37 }; // #2A6C57

// Define the transfer type based on the data structure
type TransferData = {
  id: number;
  categoryName: string;
  fromAccount: string;
  toAccount: string | string[]; // Support both single and multiple accounts
  amount: number;
  status: string;
  requestedAt: string;
  currencyId: string;
  description: string;
  economicSectorId: string;
};

/* -------------------------------------------------------------- */
/* 1 · Full-page transfer confirmation (A4)                       */
/* -------------------------------------------------------------- */
export const generateTransferPdf = (transfer: TransferData): void => {
  const doc = new jsPDF({ putOnlyUsedFonts: true, hotfixes: ['px_scaling'] });
  doc.setLanguage('ar');

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  /* header ------------------------------------------------ */
  doc
    .setFillColor(primary.r, primary.g, primary.b)
    .rect(0, 0, pageWidth, 40, 'F');

  doc
    .setTextColor(255, 255, 255)
    .setFont('Amiri', 'normal')
    .setFontSize(14)
    .text('تحويل', pageWidth / 2, 25, { align: 'center' });

  // Fix Arabic text and use Gregorian date
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric'
  }); // Format: DD/MM/YYYY (solar/Gregorian)
  
  const currentTime = new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }); // Format: HH:MM (24-hour format)

  doc
    .setFont('Amiri', 'normal')
    .setFontSize(10)
    .text(`${transfer.id} : TRF - رقم المستند `, pageWidth - margin, 15, { align: 'right' });
    doc.text(`${currentDate} : الوقت : ${currentTime} | التاريخ`, pageWidth - margin, 25, { align: 'right' });

  /* Transaction details above the table ----------------------- */
  let y = 50; // Define y variable
  
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: transfer.currencyId ?? 'USD',
    minimumFractionDigits: 2,
  }).format(+(transfer.amount || 0));

  type Field = { label: string; value: string | number };

  const left: readonly Field[] = [
    { label: 'المبلغ',           value: formattedAmount },
    { label: 'الوصف',            value: transfer.description || '—' },
    { label: 'رقم التحويل',      value: transfer.id },
  ];

  const right: readonly Field[] = [
    { label: 'العملة',           value: transfer.currencyId ?? 'USD' },
    { label: 'القطاع الاقتصادي', value: transfer.economicSectorId ?? '—' },
    { label: 'الحالة',           value: transfer.status || 'مكتمل' },
  ];

  doc.setTextColor(textCol.r, textCol.g, textCol.b).setFontSize(10);

  /* positioning helpers --------------------------------------- */
  const spacing      = 30;               // distance between value and label
  const labelRightX  = pageWidth - margin;          // outer-most label column
  const valueRightX  = labelRightX - spacing;       // its value
  const labelLeftX   = labelRightX - 120;           // inner label column
  const valueLeftX   = labelLeftX - spacing;        // its value

  /* inner (formerly "left") column ---------------------------- */
  left.forEach(({ label, value }, idx) => {
    const lineY = y + idx * 12;

    doc.setFont('Amiri', 'normal').setFontSize(10);
    doc.text(String(value), valueLeftX, lineY, { align: 'right' });

    doc.setFont('Amiri', 'normal').setFontSize(10);
    doc.text(`${label}:`, labelLeftX, lineY, { align: 'right' });
  });

  /* outer (formerly "right") column --------------------------- */
  right.forEach(({ label, value }, idx) => {
    const lineY = y + idx * 12;

    doc.setFont('Amiri', 'normal').setFontSize(12);
    doc.text(String(value), valueRightX, lineY, { align: 'right' });

    doc.setFont('Amiri', 'normal').setFontSize(12);
    doc.text(`${label}:`, labelRightX, lineY, { align: 'right' });
  });

  y += 50; // Space between transaction details and table

  /* Account details table below the transaction details ------- */
  const tableWidth = 150;
  const tableLeft = (pageWidth - tableWidth) / 2;
  const tableTop = y;
  const rowHeight = 20; // Base row height
  const colWidth = tableWidth / 2;

  // Calculate dynamic row height based on number of account numbers
  const toAccounts = Array.isArray(transfer.toAccount) 
    ? transfer.toAccount 
    : (transfer.toAccount || '—').split(',').map(acc => acc.trim());
  
  const fromAccounts = Array.isArray(transfer.fromAccount) 
    ? transfer.fromAccount 
    : [transfer.fromAccount || '—'];
  
  const maxAccounts = Math.max(toAccounts.length, fromAccounts.length);
  const dynamicRowHeight = Math.max(rowHeight, maxAccounts * 15); // 15pt per account line

  // Table header
  doc
    .setFillColor(primary.r, primary.g, primary.b)
    .rect(tableLeft, tableTop, tableWidth, rowHeight, 'F');

  doc
    .setTextColor(255, 255, 255)
    .setFont('Amiri', 'normal')
    .setFontSize(12)
    .text('تفاصيل الحسابات', tableLeft + tableWidth / 2, tableTop + 13, { align: 'center' });

  // First row - Labels
  doc
    .setFillColor(255, 255, 255) // White background
    .setDrawColor(primary.r, primary.g, primary.b) // Green borders
    .setLineWidth(0.5)
    .rect(tableLeft, tableTop + rowHeight, tableWidth, rowHeight, 'F')
    .line(tableLeft + colWidth, tableTop + rowHeight, tableLeft + colWidth, tableTop + rowHeight * 2) // Vertical divider
    .line(tableLeft, tableTop + rowHeight, tableLeft + tableWidth, tableTop + rowHeight) // Top border
    .line(tableLeft, tableTop + rowHeight * 2, tableLeft + tableWidth, tableTop + rowHeight * 2); // Bottom border

  // Labels row
  doc
    .setTextColor(0, 0, 0) // Black text
    .setFont('Amiri', 'normal')
    .setFontSize(10)
    .text('إلى الحساب', tableLeft + colWidth / 2, tableTop + rowHeight + 12, { align: 'center' });

  doc
    .setTextColor(0, 0, 0) // Black text
    .setFont('Amiri', 'normal')
    .setFontSize(10)
    .text('من الحساب', tableLeft + colWidth + colWidth / 2, tableTop + rowHeight + 12, { align: 'center' });

  // Second row - Account numbers with dynamic height
  doc
    .setFillColor(255, 255, 255) // White background
    .setDrawColor(primary.r, primary.g, primary.b) // Green borders
    .setLineWidth(0.5)
    .rect(tableLeft, tableTop + rowHeight * 2, tableWidth, dynamicRowHeight, 'F')
    .line(tableLeft + colWidth, tableTop + rowHeight * 2, tableLeft + colWidth, tableTop + rowHeight * 2 + dynamicRowHeight) // Vertical divider
    .line(tableLeft, tableTop + rowHeight * 2 + dynamicRowHeight, tableLeft + tableWidth, tableTop + rowHeight * 2 + dynamicRowHeight); // Bottom border

  // Account numbers row - display each account on its own line
  doc
    .setTextColor(0, 0, 0) // Black text
    .setFont('Amiri', 'normal')
    .setFontSize(10);

  // Display To Accounts (left column) - each on its own line
  toAccounts.forEach((account, index) => {
    const yPosition = tableTop + rowHeight * 2 + 12 + (index * 15);
    doc.text(account, tableLeft + colWidth / 2, yPosition, { align: 'center' });
  });

  // Display From Account (right column) - each on its own line
  fromAccounts.forEach((account, index) => {
    const yPosition = tableTop + rowHeight * 2 + 12 + (index * 15);
    doc.text(account, tableLeft + colWidth + colWidth / 2, yPosition, { align: 'center' });
  });

  doc.save(`transfer_${transfer.id}_${new Date().toISOString().split('T')[0]}.pdf`);
};

/* -------------------------------------------------------------- */
/* 2 · Compact receipt (80 mm × 100 mm)                           */
/* -------------------------------------------------------------- */
export const generateTransferReceipt = (transfer: TransferData): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 100],
    putOnlyUsedFonts: true,
  });
  doc.setLanguage('ar');

  const width = doc.internal.pageSize.getWidth();

  doc
    .setFillColor(primary.r, primary.g, primary.b)
    .rect(0, 0, width, 15, 'F');

  doc
    .setTextColor(255, 255, 255)
    .setFont('Amiri', 'bold')
    .setFontSize(10)
    .text('إيصال التحويل', width / 2, 10, { align: 'center' });

  doc.setFont('Amiri', 'normal').setTextColor(0, 0, 0).setFontSize(7);

  const lines: readonly string[] = [
    `:التاريخ ${new Date().toLocaleDateString('ar-SA')} | :الوقت ${new Date().toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
    })}`,
    `:المرجع TRF-${transfer.id}`,
    '',
    'تفاصيل الحسابات:',
    `من: ${transfer.fromAccount || '—'}`,
    `إلى: ${transfer.toAccount || '—'}`,
    '',
    `:المبلغ ${new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: transfer.currencyId ?? 'USD',
    }).format(+(transfer.amount || 0))}`,
    '',
    `: الوصف ${transfer.description || 'تحويل'}`,
    `: الحالة ${transfer.status || 'مكتمل'}`,
    '',
    'شكراً لتعاملكم معنا!',
  ];

  let y = 22;
  lines.forEach((line) => {
    if (line === '') {
      y += 2;
    } else {
      doc.text(line, 3, y);
      y += 4;
    }
  });

  doc.save(`transfer_receipt_${transfer.id}.pdf`);
};
