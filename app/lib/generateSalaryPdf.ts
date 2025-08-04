import { jsPDF } from "jspdf";
import { registerAmiriFont } from "@/app/lib/pdfFonts";
import type { TSalaryTransaction } from "../[locale]/salaries/types";

registerAmiriFont();

type Rgb = { r: number; g: number; b: number };
const textCol: Rgb = { r: 0x1f, g: 0x29, b: 0x37 };

export function generateSalaryTransactionPdf(
  transaction: TSalaryTransaction,
  bgImageBase64: string,
  topImageBase64?: string,
  bottomImageBase64?: string
) {
  const doc = new jsPDF({ putOnlyUsedFonts: true, hotfixes: ["px_scaling"] });
  doc.setLanguage("ar");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;

  // Add background image (cover entire page)
  doc.addImage(bgImageBase64, "JPEG", 0, 0, pageWidth, pageHeight);

  // Add top image (header/banner)
  let topImageHeight = 0;
  if (topImageBase64) {
    topImageHeight = 28; // px, adjust as needed
    doc.addImage(topImageBase64, "PNG", 0, 0, pageWidth, topImageHeight);
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
  doc.rect(leftBoxLeft, boxTop, boxWidth, boxHeight, "S");
  for (let i = 1; i < 3; i++) {
    doc.line(
      leftBoxLeft,
      boxTop + i * cellHeight,
      leftBoxLeft + boxWidth,
      boxTop + i * cellHeight
    );
  }
  for (let i = 1; i < 2; i++) {
    doc.line(
      leftBoxLeft + i * cellWidth,
      boxTop,
      leftBoxLeft + i * cellWidth,
      boxTop + boxHeight
    );
  }
  // Draw right box grid (3 rows x 2 cols)
  doc.rect(rightBoxLeft, boxTop, boxWidth, boxHeight, "S");
  for (let i = 1; i < 3; i++) {
    doc.line(
      rightBoxLeft,
      boxTop + i * cellHeight,
      rightBoxLeft + boxWidth,
      boxTop + i * cellHeight
    );
  }
  for (let i = 1; i < 2; i++) {
    doc.line(
      rightBoxLeft + i * cellWidth,
      boxTop,
      rightBoxLeft + i * cellWidth,
      boxTop + boxHeight
    );
  }

  // Left box data: [row][col] (GenCode, Amount, Date)
  const leftBoxLabels = [
    { ar: "رمز المعاملة", en: "GenCode", value: transaction.genCode },
    {
      ar: "المبلغ",
      en: "Amount",
      value: `${transaction.amount.toLocaleString()} دينار`,
    },
    {
      ar: "التاريخ",
      en: "Date",
      value: new Date(transaction.date).toLocaleDateString("ar-SA"),
    },
  ];
  // Right box data: [row][col] (Employee Name, Employee ID, Status)
  const rightBoxLabels = [
    { ar: "اسم الموظف", en: "Employee Name", value: transaction.employeeName },
    { ar: "رقم الموظف", en: "Employee ID", value: transaction.employeeId },
    { ar: "الحالة", en: "Status", value: getStatusText(transaction.status) },
  ];

  // Draw left box cells (labels right col, value left col)
  for (let row = 0; row < 3; row++) {
    // Value cell (left col)
    let x = leftBoxLeft;
    const y = boxTop + row * cellHeight;
    doc
      .setFont("Amiri", "normal")
      .setFontSize(8)
      .setTextColor(textCol.r, textCol.g, textCol.b);
    doc.text(
      leftBoxLabels[row].value,
      x + cellWidth / 2,
      y + cellHeight / 2 + 1,
      { align: "center", baseline: "middle" }
    );
    // Label cell (right col)
    x = leftBoxLeft + cellWidth;
    doc
      .setFont("Amiri", "normal")
      .setFontSize(8)
      .setTextColor(textCol.r, textCol.g, textCol.b);
    doc.text(leftBoxLabels[row].ar, x + cellWidth / 2, y + 4, {
      align: "center",
      baseline: "top",
    });
    doc
      .setFont("Amiri", "bold")
      .setFontSize(8)
      .setTextColor(textCol.r, textCol.g, textCol.b);
    doc.text(leftBoxLabels[row].en, x + cellWidth / 2, y + cellHeight - 2, {
      align: "center",
      baseline: "bottom",
    });
  }
  // Draw right box cells (labels right col, value left col)
  for (let row = 0; row < 3; row++) {
    // Value cell (left col)
    let x = rightBoxLeft;
    const y = boxTop + row * cellHeight;
    doc
      .setFont("Amiri", "normal")
      .setFontSize(8)
      .setTextColor(textCol.r, textCol.g, textCol.b);
    doc.text(
      rightBoxLabels[row].value,
      x + cellWidth / 2,
      y + cellHeight / 2 + 1,
      { align: "center", baseline: "middle" }
    );
    // Label cell (right col)
    x = rightBoxLeft + cellWidth;
    doc
      .setFont("Amiri", "normal")
      .setFontSize(8)
      .setTextColor(textCol.r, textCol.g, textCol.b);
    doc.text(rightBoxLabels[row].ar, x + cellWidth / 2, y + 4, {
      align: "center",
      baseline: "top",
    });
    doc
      .setFont("Amiri", "bold")
      .setFontSize(8)
      .setTextColor(textCol.r, textCol.g, textCol.b);
    doc.text(rightBoxLabels[row].en, x + cellWidth / 2, y + cellHeight - 2, {
      align: "center",
      baseline: "bottom",
    });
  }

  // Add accounts section
  const accountsSectionTop = boxTop + boxHeight + 20;
  doc
    .setFont("Amiri", "bold")
    .setFontSize(12)
    .setTextColor(textCol.r, textCol.g, textCol.b);
  doc.text("الحسابات المرتبطة", pageWidth / 2, accountsSectionTop, {
    align: "center",
  });
  doc.text("Associated Accounts", pageWidth / 2, accountsSectionTop + 8, {
    align: "center",
  });

  // Draw accounts table
  const tableTop = accountsSectionTop + 20;
  const tableWidth = pageWidth - margin * 2;
  const rowHeight = 12;
  const colWidth = tableWidth / 2;

  // Table header
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(margin, tableTop, tableWidth, rowHeight, "S");
  doc.line(
    margin + colWidth,
    tableTop,
    margin + colWidth,
    tableTop + rowHeight
  );

  doc
    .setFont("Amiri", "bold")
    .setFontSize(10)
    .setTextColor(textCol.r, textCol.g, textCol.b);
  doc.text("رقم الحساب", margin + colWidth / 2, tableTop + rowHeight / 2 + 2, {
    align: "center",
    baseline: "middle",
  });
  doc.text(
    "Account Number",
    margin + colWidth / 2,
    tableTop + rowHeight / 2 - 2,
    { align: "center", baseline: "middle" }
  );
  doc.text(
    "نوع الحساب",
    margin + colWidth + colWidth / 2,
    tableTop + rowHeight / 2 + 2,
    { align: "center", baseline: "middle" }
  );
  doc.text(
    "Account Type",
    margin + colWidth + colWidth / 2,
    tableTop + rowHeight / 2 - 2,
    { align: "center", baseline: "middle" }
  );

  // Table rows
  transaction.accounts.forEach((account, index) => {
    const rowY = tableTop + (index + 1) * rowHeight;
    doc.rect(margin, rowY, tableWidth, rowHeight, "S");
    doc.line(margin + colWidth, rowY, margin + colWidth, rowY + rowHeight);

    doc
      .setFont("Amiri", "normal")
      .setFontSize(9)
      .setTextColor(textCol.r, textCol.g, textCol.b);
    doc.text(account, margin + colWidth / 2, rowY + rowHeight / 2, {
      align: "center",
      baseline: "middle",
    });
    doc.text(
      "حساب جاري",
      margin + colWidth + colWidth / 2,
      rowY + rowHeight / 2 + 2,
      { align: "center", baseline: "middle" }
    );
    doc.text(
      "Current Account",
      margin + colWidth + colWidth / 2,
      rowY + rowHeight / 2 - 2,
      { align: "center", baseline: "middle" }
    );
  });

  // Add transaction type and additional info
  const infoSectionTop =
    tableTop + (transaction.accounts.length + 1) * rowHeight + 20;
  doc
    .setFont("Amiri", "bold")
    .setFontSize(11)
    .setTextColor(textCol.r, textCol.g, textCol.b);
  doc.text(
    `نوع المعاملة: ${getTransactionTypeText(transaction.transactionType)}`,
    margin,
    infoSectionTop
  );
  doc.text(
    `Transaction Type: ${transaction.transactionType.toUpperCase()}`,
    margin,
    infoSectionTop + 8
  );

  // Add bottom image (footer) at the bottom of the page
  if (bottomImageBase64) {
    const bottomImageHeight = 18; // px, adjust as needed
    doc.addImage(
      bottomImageBase64,
      "PNG",
      0,
      pageHeight - bottomImageHeight,
      pageWidth,
      bottomImageHeight
    );
  }

  doc.save(
    `salary_transaction_${transaction.genCode}_${
      new Date().toISOString().split("T")[0]
    }.pdf`
  );
}

function getStatusText(status: string): string {
  switch (status) {
    case "completed":
      return "مكتمل";
    case "pending":
      return "قيد المعالجة";
    case "failed":
      return "فشل";
    default:
      return status;
  }
}

function getTransactionTypeText(type: string): string {
  switch (type) {
    case "salary":
      return "راتب";
    case "bonus":
      return "مكافأة";
    case "allowance":
      return "بدل";
    default:
      return type;
  }
}
