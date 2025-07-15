// /* src/lib/pdf/transferPdf.ts
//    --------------------------------------------------------------
//    Generates (1) a full-page “transfer confirmation” PDF (A4) and
//    (2) a narrow receipt-style PDF (80 mm) – both Arabic-ready.
//    Requires pdfFonts.ts to have registered Amiri. No “any”, no
//    interface, strict TypeScript.
// ----------------------------------------------------------------- */

// import { jsPDF } from 'jspdf';
// import { registerAmiriFont } from './pdfFonts';
// import type { TransferResponse } from '../[locale]/transfers/internal/types';

// registerAmiriFont();

// /* ---------- helpers ---------- */
// type Rgb = { r: number; g: number; b: number };
// const primary: Rgb   = { r: 0x2a, g: 0x6c, b: 0x57 }; // #2A6C57
// const secondary: Rgb = { r: 0xa9, g: 0xc7, b: 0xbf }; // #A9C7BF
// const textCol: Rgb   = { r: 0x1f, g: 0x29, b: 0x37 }; // #1F2937

// /* -------------------------------------------------------------- */
// /* 1 · Full-page transfer confirmation (A4)                       */
// /* -------------------------------------------------------------- */
// export const generateTransferPdf = (transfer: TransferResponse): void => {
//   const doc = new jsPDF({ putOnlyUsedFonts: true, hotfixes: ['px_scaling'] });
//   doc.setLanguage('ar');

//   const pageWidth = doc.internal.pageSize.getWidth();
//   const margin = 20;

//   /* header bar ------------------------------------------------- */
//   doc.setFillColor(primary.r, primary.g, primary.b).rect(0, 0, pageWidth, 35, 'F');

//   /* logo circle was removed in the previous revision ----------- */

//   doc.setFont('Amiri', 'normal').setFontSize(8);
//   doc
//     .setTextColor(255, 255, 255)
//     .setFontSize(16)
//     .text('تأكيد التحويل', pageWidth / 2, 20, { align: 'center' });

//   doc.setFont('Amiri', 'normal').setFontSize(8);
//   const currentDate = new Date().toLocaleDateString('ar-SA');
//   const currentTime = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

//   doc.text(`رقم المستند: TRF-${transfer.id}`, pageWidth - margin, 15, { align: 'right' });
//   doc.text(`التاريخ: ${currentDate} | الوقت: ${currentTime}`, pageWidth - margin, 25, { align: 'right' });

//   /* amount panel ---------------------------------------------- */
//   let y = 50;
//   doc
//     .setFillColor(secondary.r, secondary.g, secondary.b)
//     .roundedRect(margin, y, pageWidth - margin * 2, 25, 3, 3, 'F');

//   doc.setFont('Amiri', 'normal').setFontSize(8);
//   doc
//     .setTextColor(primary.r, primary.g, primary.b)
//     .setFontSize(12)
//     .text('المبلغ المحول', pageWidth / 2, y + 10, { align: 'center' });

//   const formattedAmount = new Intl.NumberFormat('en-US', {
//     style: 'currency',
//     currency: transfer.currencyId ?? 'USD',
//     minimumFractionDigits: 2,
//   }).format(+transfer.amount);

//   doc
//     .setFont('Amiri', 'bold')
//     .setFontSize(14)
//     .text(formattedAmount, pageWidth / 2, y + 20, { align: 'center' });

//   y += 40;

//   /* details header (now right-aligned) ------------------------ */
//   doc.setFont('Amiri', 'normal').setFontSize(8);
//   doc
//     .setTextColor(primary.r, primary.g, primary.b)
//     .setFontSize(16)
//     .text('تفاصيل التحويل', pageWidth - margin, y, { align: 'right' });

//   doc
//     .setDrawColor(primary.r, primary.g, primary.b)
//     .setLineWidth(0.5)
//     .line(pageWidth - margin - 40, y + 2, pageWidth - margin, y + 2);

//   y += 15;

//   /* left + right column data (now anchored on the right) ------ */
//   type Field = { label: string; value: string | number };

//   const left: readonly Field[] = [
//     { label: 'من الحساب',        value: transfer.fromAccount },
//     { label: 'المبلغ',           value: formattedAmount },
//     { label: 'الوصف',            value: transfer.description || '—' },
//     { label: 'رقم التحويل',      value: transfer.id },
//   ];

//   const right: readonly Field[] = [
//     { label: 'إلى الحساب',       value: transfer.toAccount },
//     { label: 'العملة',           value: transfer.currencyId ?? 'USD' },
//     { label: 'القطاع الاقتصادي', value: transfer.economicSectorId ?? '—' },
//     { label: 'الحالة',           value: 'مكتمل' },
//   ];

//   doc.setTextColor(textCol.r, textCol.g, textCol.b).setFontSize(10);

//   /* positioning helpers --------------------------------------- */
//   const spacing      = 35;               // distance between value and label
//   const labelRightX  = pageWidth - margin;          // outer-most label column
//   const valueRightX  = labelRightX - spacing;       // its value
//   const labelLeftX   = labelRightX - 120;           // inner label column
//   const valueLeftX   = labelLeftX - spacing;        // its value

//   /* inner (formerly “left”) column ---------------------------- */
//   left.forEach(({ label, value }, idx) => {
//     const lineY = y + idx * 12;

//     doc.setFont('Amiri', 'normal').setFontSize(10);
//     doc.text(String(value), valueLeftX, lineY, { align: 'right' });

//     doc.setFont('Amiri', 'normal').setFontSize(10);
//     doc.text(`${label}:`, labelLeftX, lineY, { align: 'right' });
//   });

//   /* outer (formerly “right”) column --------------------------- */
//   right.forEach(({ label, value }, idx) => {
//     const lineY = y + idx * 12;

//     doc.setFont('Amiri', 'normal').setFontSize(12);
//     doc.text(String(value), valueRightX, lineY, { align: 'right' });

//     doc.setFont('Amiri', 'normal').setFontSize(12);
//     doc.text(`${label}:`, labelRightX, lineY, { align: 'right' });
//   });

//   doc.save(`transfer_${transfer.id}_${new Date().toISOString().split('T')[0]}.pdf`);
// };

// /* -------------------------------------------------------------- */
// /* 2 · Compact receipt (80 mm × 100 mm)                           */
// /* -------------------------------------------------------------- */
// export const generateTransferReceipt = (transfer: TransferResponse): void => {
//   const doc = new jsPDF({
//     orientation: 'portrait',
//     unit: 'mm',
//     format: [80, 100],
//     putOnlyUsedFonts: true,
//   });
//   doc.setLanguage('ar');

//   const width = doc.internal.pageSize.getWidth();

//   doc
//     .setFillColor(primary.r, primary.g, primary.b)
//     .rect(0, 0, width, 15, 'F');

//   doc
//     .setTextColor(255, 255, 255)
//     .setFont('Amiri', 'bold')
//     .setFontSize(10)
//     .text('إيصال التحويل', width / 2, 10, { align: 'center' });

//   doc.setFont('Amiri', 'normal').setTextColor(0, 0, 0).setFontSize(7);

//   const lines: readonly string[] = [
//     `التاريخ: ${new Date().toLocaleDateString('ar-SA')} | الوقت: ${new Date().toLocaleTimeString('ar-SA', {
//       hour: '2-digit',
//       minute: '2-digit',
//     })}`,
//     `المرجع: TRF-${transfer.id}`,
//     '',
//     `من: ${transfer.fromAccount}`,
//     `إلى: ${transfer.toAccount}`,
//     '',
//     `المبلغ: ${new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: transfer.currencyId ?? 'USD',
//     }).format(+transfer.amount)}`,
//     '',
//     `الوصف: ${transfer.description || 'تحويل'}`,
//     'الحالة: مكتمل',
//     '',
//     'شكراً لتعاملكم معنا!',
//   ];

//   let y = 22;
//   lines.forEach((line) => {
//     if (line === '') {
//       y += 2;
//     } else {
//       doc.text(line, 3, y);
//       y += 4;
//     }
//   });

//   doc.save(`transfer_receipt_${transfer.id}.pdf`);
// };
