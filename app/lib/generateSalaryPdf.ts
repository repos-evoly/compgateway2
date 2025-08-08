import { jsPDF } from "jspdf";
import type { TSalaryTransaction } from "../[locale]/salaries/types";
import { registerAmiriFont } from "./pdfFonts";

registerAmiriFont();

/* ---------- layout constants ---------- */
const margin = 20;
const rowHeight = 10;

/* ---------- helpers for mixed entry shapes ---------- */
type AnyEntry = {
  employeeName?: string;
  name?: string;
  amount?: number;
  salary?: number;
  isTransferred?: boolean;
};

const getEntryName = (e: AnyEntry) => String(e.name ?? e.employeeName ?? "");
const getEntrySalary = (e: AnyEntry) =>
  Number(e.salary ?? e.amount ?? 0);

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
      const fmt: "PNG" | "JPEG" = logoData.startsWith("data:image/png")
        ? "PNG"
        : "JPEG";
      doc.addImage(logoData, fmt, margin, 5, 40, 30);
    } catch (err) {
      console.error("Logo could not be added:", err);
    }
  }

  doc
    .setFont("Amiri", "normal")
    .setFontSize(14)
    .text("بيان دورة الرواتب", pageWidth / 2, 25, { align: "center" });

  doc
    .setFontSize(10)
    .text(`${String(transaction.id)} : رمز المعاملة`, pageWidth - margin, 15, {
      align: "right",
    });

  /* ---------- compute fields from API data ---------- */
  const entries: AnyEntry[] = Array.isArray(transaction.entries)
    ? (transaction.entries as unknown as AnyEntry[])
    : [];

  // Prefer API totalAmount if present; otherwise compute from entries
  const computedTotalFromEntries = entries.reduce(
    (sum, e) => sum + getEntrySalary(e),
    0
  );
  const totalAmount =
    typeof transaction.totalAmount === "number" &&
    !Number.isNaN(transaction.totalAmount)
      ? transaction.totalAmount
      : computedTotalFromEntries;

  const statusText = transaction.postedAt ? "مكتمل" : "قيد المعالجة";

  // Right table: ID / Salary Month
  const rightTable: Array<[string, string]> = [
    ["رمز العملية", String(transaction.id)],
    [
      "شهر الرواتب",
      new Date(transaction.salaryMonth).toLocaleDateString("en-US"),
    ],
  ];

  // Left table: Status / Total
  const leftTable: Array<[string, string]> = [
    ["الحالة", statusText],
    ["الإجمالي", `${totalAmount.toLocaleString()} ${transaction.currency}`],
  ];

  // Y-coordinate for the top info tables, creating a 20px margin after the 40px header.
  const topTablesY = 60;

  // Draw right table
  rightTable.forEach(([label, value], i) => {
    const y = topTablesY + i * rowHeight;
    const x = pageWidth - margin - boxWidth;
    doc.setFontSize(10);
    doc.text(String(label), x + boxWidth - 5, y + 7, { align: "right" });
    doc.text(String(value), x + 5, y + 7, { align: "left" });
    doc.rect(x, y, boxWidth, rowHeight);
  });

  // Draw left table
  leftTable.forEach(([label, value], i) => {
    const y = topTablesY + i * rowHeight;
    const x = margin;
    doc.setFontSize(10);
    doc.text(String(label), x + boxWidth - 5, y + 7, { align: "right" });
    doc.text(String(value), x + 5, y + 7, { align: "left" });
    doc.rect(x, y, boxWidth, rowHeight);
  });

  // Move Y after the two top tables.
  let startY = topTablesY + rowHeight * 2 + 20;

  // Table title
  doc.setFontSize(14);
  doc.text("تفاصيل الموظفين", pageWidth / 2, startY, { align: "center" });
  startY += 10;

  // --- Main Table (Right-to-Left) ---
  const headers = ["اسم الموظف", "الحالة", "الراتب"];
  const columnWidths = [80, 40, 40]; // must sum to <= page width minus margins
  const totalTableWidth = columnWidths.reduce((a, b) => a + b, 0);

  // Calculate the table's right-most starting X-coordinate for centering
  const tableLeftX = (pageWidth - totalTableWidth) / 2;
  const tableRightX = tableLeftX + totalTableWidth;

  // Draw header from right to left
  let currentX_Header = tableRightX;
  headers.forEach((header, i) => {
    const width = columnWidths[i];
    const cellX = currentX_Header - width; // top-left X for the cell
    doc.rect(cellX, startY, width, rowHeight);
    doc.text(String(header), cellX + width / 2, startY + 7, {
      align: "center",
    });
    currentX_Header -= width; // move left
  });
  startY += rowHeight;

  // Prepare data rows from new `entries`
  const rows: Array<[string, string, string]> = entries.map((e) => [
    getEntryName(e),
    e.isTransferred ? "محوّل" : "غير محوّل",
    getEntrySalary(e).toLocaleString(),
  ]);

  // Draw data rows from right to left
  rows.forEach((row) => {
    let currentX_Row = tableRightX; // reset X to the right edge for each new row
    row.forEach((cell, i) => {
      const width = columnWidths[i];
      const cellX = currentX_Row - width; // top-left X for the cell
      doc.rect(cellX, startY, width, rowHeight);
      doc.text(String(cell), cellX + width / 2, startY + 7, {
        align: "center",
      });
      currentX_Row -= width; // move left
    });
    startY += rowHeight;
  });

  const filename = `salary_transaction_${transaction.id}_${new Date()
    .toISOString()
    .split("T")[0]}.pdf`;
  doc.save(filename);
};
