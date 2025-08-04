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
  logoData?: string; // Optional logo data
};

// Customer information type
type CustomerInfo = {
  customerName: string;
  accountType: string;
  branchName: string;
};

// Function to extract company code from account number
const extractCompanyCode = (accountNumber: string): string => {
  const cleanAccount = accountNumber.replace(/\D/g, '');
  if (cleanAccount.length >= 10) {
    return cleanAccount.substring(4, 10);
  }
  return '';
};

// Function to fetch customer information
const getCustomerInfo = async (accountNumber: string): Promise<CustomerInfo | null> => {
  try {
    const companyCode = extractCompanyCode(accountNumber);
    if (!companyCode) return null;

    // For now, return mock data since we can't make API calls in PDF generation
    // In a real implementation, you would make an API call here
    return {
      customerName: "نجيب فرج سالم مصيبات", // Mock customer name
      accountType: "حسابات جارية - بدون موالد", // Mock account type
      branchName: "فرع البركة", // Mock branch name
    };
  } catch (error) {
    console.error('Failed to fetch customer info:', error);
    return null;
  }
};

/* -------------------------------------------------------------- */
/* 1 · Full-page transfer confirmation (A4)                       */
/* -------------------------------------------------------------- */
export const generateTransferPdf = async (transfer: TransferData): Promise<void> => {
  const doc = new jsPDF({ putOnlyUsedFonts: true, hotfixes: ['px_scaling'] });
  doc.setLanguage('ar');

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;

  // Header
  doc
    .setFillColor(255, 255, 255) // White background instead of green
    .rect(0, 0, pageWidth, 40, 'F');

  // Add logo if available
  if (transfer.logoData) {
    try {
      // Logo dimensions (similar to logo.jpeg size - typical header logo dimensions)
      const logoWidth = 40;
      const logoHeight = 30;
      const logoX = margin;
      const logoY = 5;

      // Determine image format from data URL
      let imageFormat = 'JPEG';
      if (transfer.logoData.startsWith('data:image/png')) {
        imageFormat = 'PNG';
      } else if (transfer.logoData.startsWith('data:image/jpeg') || transfer.logoData.startsWith('data:image/jpg')) {
        imageFormat = 'JPEG';
      }

      // Add the logo image
      doc.addImage(transfer.logoData, imageFormat, logoX, logoY, logoWidth, logoHeight);
      console.log('Logo added to PDF successfully');
    } catch (error) {
      console.error('Failed to add logo to PDF:', error);
    }
  } else {
    console.log('No logo data provided');
  }

  doc
    .setTextColor(0, 0, 0) // Black text instead of white
    .setFont('Amiri', 'normal')
    .setFontSize(14)
    .text('تحويل', pageWidth / 2, 25, { align: 'center' });

  doc
    .setFont('Amiri', 'normal')
    .setFontSize(10)
    .text(`${transfer.id} : TRF - رقم المستند `, pageWidth - margin, 15, { align: 'right' });

  /* Customer Information Table (To Account Only) ---------------- */
  let y = 60; // Position below header
  
  // Get customer info for the to account
  const toAccounts = Array.isArray(transfer.toAccount) 
    ? transfer.toAccount 
    : (transfer.toAccount || '—').split(',').map(acc => acc.trim());
  
  // For group transfers, create individual tables for each account
  if (toAccounts.length > 1) {
    // Group transfer - create single table for all accounts
    const tableWidth = 200; // Same width as transaction table
    const tableLeft = (pageWidth - tableWidth) / 2;
    const tableTop = y;
    const headerHeight = 25; // Height for header row only
    const dataRowHeight = 20; // Same height for all data rows
    const colWidth = tableWidth / 6; // 6 columns like transaction table

    // Table header with white background
    doc
      .setFillColor(255, 255, 255) // White background
      .rect(tableLeft, tableTop, tableWidth, headerHeight, 'F');

    doc
      .setTextColor(0, 0, 0) // Black text for white background
      .setFont('Amiri', 'normal')
      .setFontSize(8)
      .text('تفاصيل الحسابات المستلمة', tableLeft + tableWidth / 2, tableTop + 10, { align: 'center' });

    doc
      .setTextColor(0, 0, 0) // Black text for white background
      .setFont('Amiri', 'normal')
      .setFontSize(8)
      .text('Recipient Accounts Details', tableLeft + tableWidth / 2, tableTop + 18, { align: 'center' });

    // Table content
    doc
      .setDrawColor(0, 0, 0)
      .setLineWidth(0.5);

    // Calculate total table height with consistent data row heights
    const totalTableHeight = headerHeight + (toAccounts.length * dataRowHeight);

    // Draw the main table rectangle - include header row
    doc.rect(tableLeft, tableTop, tableWidth, totalTableHeight, 'S');

    // Add vertical dividers between columns (only for data rows, not header)
    for (let j = 1; j < 6; j++) {
      doc.line(
        tableLeft + colWidth * j, 
        tableTop + headerHeight, // Start from below header row
        tableLeft + colWidth * j, 
        tableTop + totalTableHeight
      );
    }

    // Add extra vertical dividing line within the first data row to separate date column
    doc.line(
      tableLeft + colWidth * 5, // Position between "من حساب" and "التاريخ والوقت"
      tableTop + headerHeight, 
      tableLeft + colWidth * 5, 
      tableTop + headerHeight + dataRowHeight
    );

    // Add horizontal dividers between all rows
    for (let i = 1; i <= toAccounts.length; i++) {
      const yPosition = tableTop + headerHeight + (i * dataRowHeight);
      doc.line(
        tableLeft, 
        yPosition, 
        tableLeft + tableWidth, 
        yPosition
      );
    }

    // Add horizontal dividing line between header and first data row
    doc.line(
      tableLeft, 
      tableTop + headerHeight, 
      tableLeft + tableWidth, 
      tableTop + headerHeight
    );

    // Remove the duplicate line that was causing the connection
    // The main loop above already handles the line between first and second data rows

    // Header row labels
    doc
      .setTextColor(0, 0, 0)
      .setFont('Amiri', 'normal')
      .setFontSize(6);

    // Column 1: Customer Name
    doc.text('اسم الزبون', tableLeft + colWidth / 2, tableTop + headerHeight + 8, { align: 'center' });

    // Column 2: Account Number
    doc.text('رقم الحساب', tableLeft + colWidth + colWidth / 2, tableTop + headerHeight + 8, { align: 'center' });

    // Column 3: Account Type
    doc.text('نوع الحساب', tableLeft + colWidth * 2 + colWidth / 2, tableTop + headerHeight + 8, { align: 'center' });

    // Column 4: Branch - Agency
    doc.text('الفرع - الوكالة', tableLeft + colWidth * 3 + colWidth / 2, tableTop + headerHeight + 8, { align: 'center' });

    // Column 5: From Account
    doc.text('من حساب', tableLeft + colWidth * 4 + colWidth / 2, tableTop + headerHeight + 8, { align: 'center' });

    // Column 6: Date and Time
    doc.text('التاريخ والوقت', tableLeft + colWidth * 5 + colWidth / 2, tableTop + headerHeight + 8, { align: 'center' });

    // Data rows for each account
    const currentDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
    
    const currentTime = new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    for (let i = 0; i < toAccounts.length; i++) {
      const toAccount = toAccounts[i];
      const customerInfo = await getCustomerInfo(toAccount || '');
      
      // All data rows have the same height and positioning
      const rowY = tableTop + headerHeight + (i * dataRowHeight);
      const textY = rowY + 15; // Consistent text positioning for all data rows

      if (customerInfo) {
        doc
          .setTextColor(0, 0, 0)
          .setFont('Amiri', 'normal')
          .setFontSize(8);

        // Column 1: Customer Name
        doc.text(customerInfo.customerName, tableLeft + colWidth / 2, textY, { align: 'center' });

        // Column 2: Account Number
        doc.text(toAccount || '—', tableLeft + colWidth + colWidth / 2, textY, { align: 'center' });

        // Column 3: Account Type
        doc.text(customerInfo.accountType, tableLeft + colWidth * 2 + colWidth / 2, textY, { align: 'center' });

        // Column 4: Branch - Agency
        doc.text(customerInfo.branchName, tableLeft + colWidth * 3 + colWidth / 2, textY, { align: 'center' });

        // Column 5: From Account
        doc.text(transfer.fromAccount || '—', tableLeft + colWidth * 4 + colWidth / 2, textY, { align: 'center' });

        // Column 6: Date and Time
        doc.text(`${currentDate} ${currentTime}`, tableLeft + colWidth * 5 + colWidth / 2, textY, { align: 'center' });
      }
    }

    y = tableTop + totalTableHeight + 15; // Space after the unified table
    
    // Add transaction details table on the same page or new page if needed
    if (y + 100 > pageHeight - margin) { // 100pt estimated space for transaction table
      doc.addPage();
      
      // Add header to new page
      doc
        .setFillColor(255, 255, 255) // White background
        .rect(0, 0, pageWidth, 40, 'F');

      doc
        .setTextColor(0, 0, 0) // Black text
        .setFont('Amiri', 'normal')
        .setFontSize(14)
        .text('تحويل', pageWidth / 2, 25, { align: 'center' });

      doc
        .setFont('Amiri', 'normal')
        .setFontSize(10)
        .text(`${transfer.id} : TRF - رقم المستند `, pageWidth - margin, 15, { align: 'right' });
      
      y = 60; // Reset y position for new page
    }
  } else {
    // Single transfer - use the original two-table layout
    const toAccount = toAccounts[0];
    const customerInfo = await getCustomerInfo(toAccount || '');
    
    if (customerInfo) {
      const tableWidth = 80; // Smaller width for each table
      const tableSpacing = 20; // Space between tables
      const leftTableLeft = (pageWidth - (tableWidth * 2 + tableSpacing)) / 2;
      const rightTableLeft = leftTableLeft + tableWidth + tableSpacing;
      const tableTop = y;
      const rowHeight = 15; // Further reduced from 20
      const colWidth = tableWidth / 2;

      // Right Table - First 3 rows (Customer Name, Account Number, Account Type)
      // Table header with white background
      doc
        .setFillColor(255, 255, 255) // White background
        .rect(rightTableLeft, tableTop, tableWidth, rowHeight, 'F');

      doc
        .setTextColor(0, 0, 0) // Black text for white background
        .setFont('Amiri', 'normal')
        .setFontSize(8) // Reduced from 10
        .text('تفاصيل التحويل', rightTableLeft + tableWidth / 2, tableTop + rowHeight / 2, { align: 'center' });

      doc
        .setTextColor(0, 0, 0) // Black text for white background
        .setFont('Amiri', 'normal')
        .setFontSize(6) // Reduced from 8
        .text('TRANSFER DETAILS', rightTableLeft + tableWidth / 2, tableTop + rowHeight - 2, { align: 'center' });

      // Table content with no background color
      doc
        .setDrawColor(0, 0, 0) // Black borders
        .setLineWidth(0.5);

      // Row 1: Customer Name
      doc
        .rect(rightTableLeft, tableTop + rowHeight, tableWidth, rowHeight, 'S')
        .line(rightTableLeft + colWidth, tableTop + rowHeight, rightTableLeft + colWidth, tableTop + rowHeight * 2);

      doc
        .setTextColor(0, 0, 0) // Black text
        .setFont('Amiri', 'normal')
        .setFontSize(6) // Reduced from 8
        .text(customerInfo.customerName, rightTableLeft + colWidth / 2, tableTop + rowHeight + 10, { align: 'center' });

      doc
        .setTextColor(0, 0, 0)
        .setFont('Amiri', 'normal')
        .setFontSize(6) // Reduced from 8
        .text('اسم الزبون', rightTableLeft + colWidth + colWidth / 2, tableTop + rowHeight + 5, { align: 'center' })
        .text('CUSTOMER NAME', rightTableLeft + colWidth + colWidth / 2, tableTop + rowHeight + 12, { align: 'center' });

      // Row 2: Account Number
      doc
        .rect(rightTableLeft, tableTop + rowHeight * 2, tableWidth, rowHeight, 'S')
        .line(rightTableLeft + colWidth, tableTop + rowHeight * 2, rightTableLeft + colWidth, tableTop + rowHeight * 3);

      doc
        .setTextColor(0, 0, 0)
        .setFont('Amiri', 'normal')
        .setFontSize(6) // Reduced from 8
        .text(toAccount || '—', rightTableLeft + colWidth / 2, tableTop + rowHeight * 2 + 10, { align: 'center' });

      doc
        .setTextColor(0, 0, 0)
        .setFont('Amiri', 'normal')
        .setFontSize(6) // Reduced from 8
        .text('رقم الحساب', rightTableLeft + colWidth + colWidth / 2, tableTop + rowHeight * 2 + 5, { align: 'center' })
        .text('ACCOUNT NUMBER', rightTableLeft + colWidth + colWidth / 2, tableTop + rowHeight * 2 + 12, { align: 'center' });

      // Row 3: Account Type
      doc
        .rect(rightTableLeft, tableTop + rowHeight * 3, tableWidth, rowHeight, 'S')
        .line(rightTableLeft + colWidth, tableTop + rowHeight * 3, rightTableLeft + colWidth, tableTop + rowHeight * 4);

      doc
        .setTextColor(0, 0, 0)
        .setFont('Amiri', 'normal')
        .setFontSize(6) // Reduced from 8
        .text(customerInfo.accountType, rightTableLeft + colWidth / 2, tableTop + rowHeight * 3 + 10, { align: 'center' });

      doc
        .setTextColor(0, 0, 0)
        .setFont('Amiri', 'normal')
        .setFontSize(6) // Reduced from 8
        .text('نوع الحساب', rightTableLeft + colWidth + colWidth / 2, tableTop + rowHeight * 3 + 5, { align: 'center' })
        .text('ACCOUNT TYPE', rightTableLeft + colWidth + colWidth / 2, tableTop + rowHeight * 3 + 12, { align: 'center' });

      // Left Table - Last 3 rows (Branch - Agency, From Account, Date & Time)
      // Table header with white background
      doc
        .setFillColor(255, 255, 255) // White background
        .rect(leftTableLeft, tableTop, tableWidth, rowHeight, 'F');

      doc
        .setTextColor(0, 0, 0) // Black text for white background
        .setFont('Amiri', 'normal')
        .setFontSize(8) // Reduced from 10
        .text('تفاصيل إضافية', leftTableLeft + tableWidth / 2, tableTop + rowHeight / 2, { align: 'center' });

      doc
        .setTextColor(0, 0, 0) // Black text for white background
        .setFont('Amiri', 'normal')
        .setFontSize(6) // Reduced from 8
        .text('ADDITIONAL INFO', leftTableLeft + tableWidth / 2, tableTop + rowHeight - 2, { align: 'center' });

      // Row 1: Branch - Agency
      doc
        .rect(leftTableLeft, tableTop + rowHeight, tableWidth, rowHeight, 'S')
        .line(leftTableLeft + colWidth, tableTop + rowHeight, leftTableLeft + colWidth, tableTop + rowHeight * 2);

      doc
        .setTextColor(0, 0, 0)
        .setFont('Amiri', 'normal')
        .setFontSize(6) // Reduced from 8
        .text(customerInfo.branchName, leftTableLeft + colWidth / 2, tableTop + rowHeight + 10, { align: 'center' });

      doc
        .setTextColor(0, 0, 0)
        .setFont('Amiri', 'normal')
        .setFontSize(6) // Reduced from 8
        .text('الفرع - الوكالة', leftTableLeft + colWidth + colWidth / 2, tableTop + rowHeight + 5, { align: 'center' })
        .text('BRANCH - AGENCY', leftTableLeft + colWidth + colWidth / 2, tableTop + rowHeight + 12, { align: 'center' });

      // Row 2: From Account
      doc
        .rect(leftTableLeft, tableTop + rowHeight * 2, tableWidth, rowHeight, 'S')
        .line(leftTableLeft + colWidth, tableTop + rowHeight * 2, leftTableLeft + colWidth, tableTop + rowHeight * 3);

      doc
        .setTextColor(0, 0, 0)
        .setFont('Amiri', 'normal')
        .setFontSize(6) // Reduced from 8
        .text(transfer.fromAccount || '—', leftTableLeft + colWidth / 2, tableTop + rowHeight * 2 + 10, { align: 'center' });

      doc
        .setTextColor(0, 0, 0)
        .setFont('Amiri', 'normal')
        .setFontSize(6) // Reduced from 8
        .text('من حساب', leftTableLeft + colWidth + colWidth / 2, tableTop + rowHeight * 2 + 5, { align: 'center' })
        .text('FROM ACCOUNT', leftTableLeft + colWidth + colWidth / 2, tableTop + rowHeight * 2 + 12, { align: 'center' });

      // Row 3: Date and Time
      doc
        .rect(leftTableLeft, tableTop + rowHeight * 3, tableWidth, rowHeight, 'S')
        .line(leftTableLeft + colWidth, tableTop + rowHeight * 3, leftTableLeft + colWidth, tableTop + rowHeight * 4);

      const currentDate = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      });
      
      const currentTime = new Date().toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      doc
        .setTextColor(0, 0, 0)
        .setFont('Amiri', 'normal')
        .setFontSize(6) // Reduced from 8
        .text(`${currentDate} ${currentTime}`, leftTableLeft + colWidth / 2, tableTop + rowHeight * 3 + 10, { align: 'center' });

      doc
        .setTextColor(0, 0, 0)
        .setFont('Amiri', 'normal')
        .setFontSize(6) // Reduced from 8
        .text('التاريخ والوقت', leftTableLeft + colWidth + colWidth / 2, tableTop + rowHeight * 3 + 5, { align: 'center' })
        .text('DATE & TIME', leftTableLeft + colWidth + colWidth / 2, tableTop + rowHeight * 3 + 12, { align: 'center' });

      y = tableTop + rowHeight * 4 + 10; // Reduced spacing
    } else {
      y = 60; // If no customer info, start at normal position
    }
  }

  /* Transaction Details Table ----------------------- */
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: transfer.currencyId ?? 'USD',
    minimumFractionDigits: 2,
  }).format(+(transfer.amount || 0));

  const transactionTableWidth = 200; // Wider table for horizontal layout
  const transactionTableLeft = (pageWidth - transactionTableWidth) / 2;
  const transactionTableTop = y;
  const transactionRowHeight = 25; // Taller rows for horizontal layout
  const transactionColWidth = transactionTableWidth / 6; // 6 columns

  // Transaction table header with white background
  doc
    .setFillColor(255, 255, 255) // White background
    .rect(transactionTableLeft, transactionTableTop, transactionTableWidth, transactionRowHeight, 'F');

  doc
    .setTextColor(0, 0, 0) // Black text for white background
    .setFont('Amiri', 'normal')
    .setFontSize(8) // Larger font for header
    .text('تفاصيل المعاملة', transactionTableLeft + transactionTableWidth / 2, transactionTableTop + 10, { align: 'center' });

  doc
    .setTextColor(0, 0, 0) // Black text for white background
    .setFont('Amiri', 'normal')
    .setFontSize(8) // Smaller font for English text
    .text('Transaction Details', transactionTableLeft + transactionTableWidth / 2, transactionTableTop + 18, { align: 'center' });

  // Transaction table content
  doc
    .setDrawColor(0, 0, 0)
    .setLineWidth(0.5);

  // Data row
  doc
    .rect(transactionTableLeft, transactionTableTop + transactionRowHeight, transactionTableWidth, transactionRowHeight, 'S');

  // Add vertical dividers between columns
  for (let i = 1; i < 6; i++) {
    doc.line(
      transactionTableLeft + transactionColWidth * i, 
      transactionTableTop + transactionRowHeight, 
      transactionTableLeft + transactionColWidth * i, 
      transactionTableTop + transactionRowHeight * 2
    );
  }

  // Add horizontal dividing line between labels and values
  doc.line(
    transactionTableLeft, 
    transactionTableTop + transactionRowHeight + 12, 
    transactionTableLeft + transactionTableWidth, 
    transactionTableTop + transactionRowHeight + 12
  );

  // Column 1: Amount
  doc
    .setTextColor(0, 0, 0)
    .setFont('Amiri', 'normal')
    .setFontSize(6)
    .text('المبلغ', transactionTableLeft + transactionColWidth / 2, transactionTableTop + transactionRowHeight + 8, { align: 'center' });

  doc
    .setTextColor(0, 0, 0)
    .setFont('Amiri', 'normal')
    .setFontSize(8)
    .text(formattedAmount, transactionTableLeft + transactionColWidth / 2, transactionTableTop + transactionRowHeight + 18, { align: 'center' });

  // Column 2: Transfer Number (moved from column 3)
  doc
    .setTextColor(0, 0, 0)
    .setFont('Amiri', 'normal')
    .setFontSize(6)
    .text('رقم التحويل', transactionTableLeft + transactionColWidth + transactionColWidth / 2, transactionTableTop + transactionRowHeight + 8, { align: 'center' });

  doc
    .setTextColor(0, 0, 0)
    .setFont('Amiri', 'normal')
    .setFontSize(8)
    .text(transfer.id.toString(), transactionTableLeft + transactionColWidth + transactionColWidth / 2, transactionTableTop + transactionRowHeight + 18, { align: 'center' });

  // Column 3: Description (moved from column 2)
  doc
    .setTextColor(0, 0, 0)
    .setFont('Amiri', 'normal')
    .setFontSize(6)
    .text('الوصف', transactionTableLeft + transactionColWidth * 2 + transactionColWidth / 2, transactionTableTop + transactionRowHeight + 8, { align: 'center' });

  doc
    .setTextColor(0, 0, 0)
    .setFont('Amiri', 'normal')
    .setFontSize(8)
    .text(transfer.description || '—', transactionTableLeft + transactionColWidth * 2 + transactionColWidth / 2, transactionTableTop + transactionRowHeight + 18, { align: 'center' });

  // Column 4: Currency
  doc
    .setTextColor(0, 0, 0)
    .setFont('Amiri', 'normal')
    .setFontSize(6)
    .text('العملة', transactionTableLeft + transactionColWidth * 3 + transactionColWidth / 2, transactionTableTop + transactionRowHeight + 8, { align: 'center' });

  doc
    .setTextColor(0, 0, 0)
    .setFont('Amiri', 'normal')
    .setFontSize(8)
    .text(transfer.currencyId ?? 'USD', transactionTableLeft + transactionColWidth * 3 + transactionColWidth / 2, transactionTableTop + transactionRowHeight + 18, { align: 'center' });

  // Column 5: Economic Sector
  doc
    .setTextColor(0, 0, 0)
    .setFont('Amiri', 'normal')
    .setFontSize(6)
    .text('القطاع الاقتصادي', transactionTableLeft + transactionColWidth * 4 + transactionColWidth / 2, transactionTableTop + transactionRowHeight + 8, { align: 'center' });

  doc
    .setTextColor(0, 0, 0)
    .setFont('Amiri', 'normal')
    .setFontSize(8)
    .text(transfer.economicSectorId ?? '—', transactionTableLeft + transactionColWidth * 4 + transactionColWidth / 2, transactionTableTop + transactionRowHeight + 18, { align: 'center' });

  // Column 6: Status
  doc
    .setTextColor(0, 0, 0)
    .setFont('Amiri', 'normal')
    .setFontSize(6)
    .text('الحالة', transactionTableLeft + transactionColWidth * 5 + transactionColWidth / 2, transactionTableTop + transactionRowHeight + 8, { align: 'center' });

  doc
    .setTextColor(0, 0, 0)
    .setFont('Amiri', 'normal')
    .setFontSize(8)
    .text(transfer.status || 'مكتمل', transactionTableLeft + transactionColWidth * 5 + transactionColWidth / 2, transactionTableTop + transactionRowHeight + 18, { align: 'center' });

  y = transactionTableTop + transactionRowHeight * 2 + 10; // Space after transaction table

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
    .setFillColor(255, 255, 255) // White background instead of green
    .rect(0, 0, width, 15, 'F');

  doc
    .setTextColor(0, 0, 0) // Black text for white background
    .setFont('Amiri', 'bold')
    .setFontSize(10)
    .text('إيصال التحويل', width / 2, 10, { align: 'center' });

  doc.setFont('Amiri', 'normal').setTextColor(0, 0, 0).setFontSize(7);

  const lines: readonly string[] = [
    `:التاريخ ${new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    })} | :الوقت ${new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })}`,
    `:المرجع TRF-${transfer.id}`,
    '',
    'تفاصيل الحسابات:',
    `من: ${transfer.fromAccount || '—'}`,
    `إلى: ${Array.isArray(transfer.toAccount) ? transfer.toAccount.join(', ') : transfer.toAccount || '—'}`,
    '',
    `:المبلغ ${new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: transfer.currencyId ?? 'USD',
      minimumFractionDigits: 2,
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
