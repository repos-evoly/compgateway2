/* src/lib/pdf/requestPdf.ts
   --------------------------------------------------------------
   Generates PDF for various request types with Account Number information
   Requires pdfFonts.ts to have registered Amiri. No "any", no
   interface, strict TypeScript.
----------------------------------------------------------------- */

import { jsPDF } from 'jspdf';
import { registerAmiriFont } from './pdfFonts';

registerAmiriFont();

/* ---------- helpers ---------- */

// Define the request type based on the data structure
type RequestData = {
  id?: number;
  accountNumber?: string;
  accountHolderName?: string;
  fullName?: string;
  customerName?: string;
  branch?: string;
  date?: string;
  status?: string;
  amount?: number;
  purpose?: string;
  curr?: string;
  representativeId?: string | number;
  representativeName?: string;
  address?: string;
  bookContaining?: string;
  cardNum?: string;
  beneficiary?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown; // Allow additional properties for different request types
};

/* -------------------------------------------------------------- */
/* Request PDF Generation                                          */
/* -------------------------------------------------------------- */
export const generateRequestPdf = async (request: RequestData, requestType: string): Promise<void> => {
  const doc = new jsPDF({ putOnlyUsedFonts: true, hotfixes: ['px_scaling'] });
  doc.setLanguage('ar');

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  // Header
  doc
    .setFillColor(255, 255, 255) // White background
    .rect(0, 0, pageWidth, 40, 'F');

  // Add logo if available
  const logoData = typeof window !== 'undefined' ? localStorage.getItem('pdfLogo') : null;
  if (logoData) {
    try {
      // Logo dimensions (similar to logo.jpeg size - typical header logo dimensions)
      const logoWidth = 40;
      const logoHeight = 30;
      const logoX = margin;
      const logoY = 5;

      // Determine image format from data URL
      let imageFormat = 'JPEG';
      if (logoData.startsWith('data:image/png')) {
        imageFormat = 'PNG';
      } else if (logoData.startsWith('data:image/jpeg') || logoData.startsWith('data:image/jpg')) {
        imageFormat = 'JPEG';
      }

      // Add the logo image
      doc.addImage(logoData, imageFormat, logoX, logoY, logoWidth, logoHeight);
      console.log('Logo added to PDF successfully');
    } catch (error) {
      console.error('Failed to add logo to PDF:', error);
    }
  } else {
    console.log('No logo data provided');
  }

  doc
    .setTextColor(0, 0, 0) // Black text
    .setFont('Amiri', 'normal')
    .setFontSize(14)
    .text(requestType, pageWidth / 2, 25, { align: 'center' });

  doc
    .setFont('Amiri', 'normal')
    .setFontSize(10)
    .text(`${request.id || 'N/A'} : رقم المستند `, pageWidth - margin, 15, { align: 'right' });

  /* Request Details Table ---------------- */
  const y = 60; // Position below header
  
  const detailsTableWidth = 200;
  const detailsTableLeft = (pageWidth - detailsTableWidth) / 2;
  const detailsTableTop = y;
  const detailsHeaderHeight = 25;
  const detailsDataRowHeight = 20;
  const detailsColWidth = detailsTableWidth / 2;

  // Table header with white background
  doc
    .setFillColor(255, 255, 255) // White background
    .rect(detailsTableLeft, detailsTableTop, detailsTableWidth, detailsHeaderHeight, 'F');

  doc
    .setTextColor(0, 0, 0) // Black text
    .setFont('Amiri', 'normal')
    .setFontSize(10)
    .text('تفاصيل الطلب', detailsTableLeft + detailsTableWidth / 2, detailsTableTop + 10, { align: 'center' });

  doc
    .setTextColor(0, 0, 0) // Black text
    .setFont('Amiri', 'normal')
    .setFontSize(10)
    .text('Request Details', detailsTableLeft + detailsTableWidth / 2, detailsTableTop + 18, { align: 'center' });

  // Table content
  doc
    .setDrawColor(0, 0, 0)
    .setLineWidth(0.5);

  // Calculate total table height (adjust based on number of fields)
  const detailsTotalHeight = detailsHeaderHeight + (6 * detailsDataRowHeight); // 6 data rows

  // Draw the main table rectangle
  doc.rect(detailsTableLeft, detailsTableTop, detailsTableWidth, detailsTotalHeight, 'S');

  // Add horizontal divider after header (no vertical line in header)
  doc.line(
    detailsTableLeft, 
    detailsTableTop + detailsHeaderHeight, 
    detailsTableLeft + detailsTableWidth, 
    detailsTableTop + detailsHeaderHeight
  );

  // Add vertical divider between columns (only for data rows, not header)
  doc.line(
    detailsTableLeft + detailsColWidth, 
    detailsTableTop + detailsHeaderHeight, 
    detailsTableLeft + detailsColWidth, 
    detailsTableTop + detailsTotalHeight
  );

  // Add horizontal dividers between data rows
  for (let i = 1; i <= 6; i++) {
    doc.line(
      detailsTableLeft, 
      detailsTableTop + detailsHeaderHeight + (i * detailsDataRowHeight), 
      detailsTableLeft + detailsTableWidth, 
      detailsTableTop + detailsHeaderHeight + (i * detailsDataRowHeight)
    );
  }

  // Generate dynamic table rows based on request type and available data
  const generateTableRows = () => {
    const rows: Array<{ data: string; label: string }> = [];
    
    // Common fields for all request types
    if (request.id) {
      rows.push({ data: request.id.toString(), label: 'رقم الطلب' });
    }
    
    if (request.accountNumber) {
      rows.push({ data: request.accountNumber, label: 'رقم الحساب' });
    }
    
    // Name fields (different request types use different field names)
    const name = request.fullName || request.customerName || request.accountHolderName;
    if (name) {
      rows.push({ data: name, label: 'اسم العميل' });
    }
    
    if (request.branch) {
      rows.push({ data: request.branch, label: 'الفرع' });
    }
    
    if (request.date) {
      rows.push({ data: request.date, label: 'التاريخ' });
    }
    
    if (request.status) {
      rows.push({ data: request.status, label: 'الحالة' });
    }
    
    // Request-specific fields
    if (request.amount) {
      rows.push({ data: request.amount.toString(), label: 'المبلغ' });
    }
    
    if (request.purpose) {
      rows.push({ data: request.purpose, label: 'الغرض' });
    }
    
    if (request.curr) {
      rows.push({ data: request.curr, label: 'العملة' });
    }
    
    if (request.representativeName || request.representativeId) {
      const repName = request.representativeName || `ID: ${request.representativeId}`;
      rows.push({ data: repName, label: 'المندوب' });
    }
    
    if (request.address) {
      rows.push({ data: request.address, label: 'العنوان' });
    }
    
    if (request.bookContaining) {
      rows.push({ data: request.bookContaining, label: 'عدد الصفحات' });
    }
    
    if (request.cardNum) {
      rows.push({ data: request.cardNum, label: 'رقم البطاقة' });
    }
    
    if (request.beneficiary) {
      rows.push({ data: request.beneficiary, label: 'المستفيد' });
    }
    
    // Add at least 6 rows, fill empty ones with N/A
    while (rows.length < 6) {
      rows.push({ data: 'N/A', label: 'N/A' });
    }
    
    // Limit to 6 rows
    return rows.slice(0, 6);
  };

  const tableRows = generateTableRows();
  
  // Fill table data with dynamic information
  tableRows.forEach((row, index) => {
    const y = detailsTableTop + detailsHeaderHeight + (index * detailsDataRowHeight) + 10;
    
    // Data (English) on left, Arabic label on right, both centered
    doc
      .setTextColor(0, 0, 0)
      .setFont('Amiri', 'normal')
      .setFontSize(9)
      .text(row.data, detailsTableLeft + detailsColWidth / 2, y, { align: 'center' });

    doc
      .setTextColor(0, 0, 0)
      .setFont('Amiri', 'normal')
      .setFontSize(9)
      .text(row.label, detailsTableLeft + detailsColWidth + detailsColWidth / 2, y, { align: 'center' });
  });

  // Save the PDF
  doc.save(`${requestType.replace(/\s+/g, '_')}_${request.id || 'request'}.pdf`);
}; 