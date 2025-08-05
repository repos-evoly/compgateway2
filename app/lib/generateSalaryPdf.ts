import { jsPDF } from "jspdf";
import type { TSalaryTransaction } from "../[locale]/salaries/types";
import { registerAmiriFont } from "./pdfFonts";

registerAmiriFont();

/* ---------- layout constants ---------- */
const margin = 20;
const rowHeight = 10;


/* ---------- Main Exported Function ---------- */
export const generateSalaryTransactionPdf = (
  transaction: TSalaryTransaction
): void => {
  const doc = new jsPDF({ putOnlyUsedFonts: true, hotfixes: ["px_scaling"] });
  doc.setLanguage("ar");
  doc.setFont("Amiri");

  const pageWidth = doc.internal.pageSize.getWidth();
  const boxWidth = (pageWidth - margin * 3) / 2;

  /* ---------- header (logo/title) ---------- */
  doc.setFillColor(255, 255, 255).rect(0, 0, pageWidth, 40, "F");

  const logoData =
    typeof window !== "undefined" ? localStorage.getItem("pdfLogo") : null;

  if (logoData) {
    try {
      const fmt = logoData.startsWith("data:image/png") ? "PNG" : "JPEG";
      doc.addImage(logoData, fmt, margin, 5, 40, 30);
    } catch (err) {
      console.error("Logo could not be added:", err);
    }
  }

  doc
    .setFont("Amiri", "normal")
    .setFontSize(14)
    .text("Salary Transaction", pageWidth / 2, 25, { align: "center" });

  doc
    .setFontSize(10)
    .text(`${transaction.genCode} : رمز المعاملة`, pageWidth - margin, 15, {
      align: "right",
    });


  // Right table: GenCode / Date
  const rightTable = [
    ["رمز العملية", transaction.genCode],
    ["التاريخ", new Date(transaction.date).toLocaleDateString("en-US")],
  ];

  // Left table: Status / Total
  const leftTable = [
    ["الحالة", getStatusText(transaction.status)],
    ["المبلغ", `${transaction.total.toLocaleString()} دينار`],
  ];

  // Y-coordinate for the top info tables, creating a 20px margin after the 40px header.
  const topTablesY = 60;

  // Draw right table
  rightTable.forEach(([label, value], i) => {
    const y = topTablesY + i * rowHeight;
    const x = pageWidth - margin - boxWidth;
    doc.setFontSize(10);
    doc.text(label, x + boxWidth - 5, y + 7, { align: "right" });
    doc.text(value, x + 5, y + 7, { align: "left" });
    doc.rect(x, y, boxWidth, rowHeight);
  });

  // Draw left table
  leftTable.forEach(([label, value], i) => {
    const y = topTablesY + i * rowHeight;
    const x = margin;
    doc.setFontSize(10);
    doc.text(label, x + boxWidth - 5, y + 7, { align: "right" });
    doc.text(value, x + 5, y + 7, { align: "left" });
    doc.rect(x, y, boxWidth, rowHeight);
  });

  // Move Y after the two top tables.
  let startY = topTablesY + rowHeight * 2 + 20;

  // Table title
  doc.setFontSize(14);
  doc.text("الحسابات المرتبطة", pageWidth / 2, startY, { align: "center" });
  startY += 10;

  // --- Main Table (Right-to-Left) ---

  const headers = ["اسم الموظف", "رقم الحساب", "نوع الحساب", "الراتب"];
  const columnWidths = [40, 50, 40, 30]; // Widths correspond to the headers array
  const totalTableWidth = columnWidths.reduce((a, b) => a + b, 0);

  // Calculate the table's right-most starting X-coordinate for centering
  const tableLeftX = (pageWidth - totalTableWidth) / 2;
  const tableRightX = tableLeftX + totalTableWidth;

  // Draw header from right to left
  let currentX_Header = tableRightX;
  headers.forEach((header, i) => {
    const width = columnWidths[i];
    const cellX = currentX_Header - width; // Calculate the top-left X for the cell
    doc.rect(cellX, startY, width, rowHeight);
    doc.text(header, cellX + width / 2, startY + 7, { align: "center" });
    currentX_Header -= width; // Move the cursor to the left for the next cell
  });
  startY += rowHeight;

  // Prepare data rows
  const rows = transaction.accounts.map((acc ) => [
    transaction.employeeName,
    acc, // Using 'acc' for the individual account number
    transaction.accountType, // MODIFIED: Changed from transaction.transactionType
    `${transaction.amount.toLocaleString()}`,
  ]);

  // Draw data rows from right to left
  rows.forEach((row) => {
    let currentX_Row = tableRightX; // Reset X to the right edge for each new row
    row.forEach((cell, i) => {
      const width = columnWidths[i];
      const cellX = currentX_Row - width; // Calculate the top-left X for the cell
      doc.rect(cellX, startY, width, rowHeight);
      doc.text(String(cell), cellX + width / 2, startY + 7, { align: "center" });
      currentX_Row -= width; // Move the cursor to the left
    });
    startY += rowHeight;
  });


  const filename = `salary_transaction_${transaction.genCode}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
};

function getStatusText(status: string): string {
  switch (status) {
    case "completed": return "مكتمل";
    case "pending": return "قيد المعالجة";
    case "failed": return "فشل";
    default: return status;
  }
}