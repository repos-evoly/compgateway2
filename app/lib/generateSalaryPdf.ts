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
  const salaryMonthValue = String(transaction.salaryMonth ?? "");
  const additionalMonthValue = String(transaction.additionalMonth ?? "").trim();

  const rightTable = [
    { label: "رمز العملية", lines: [String(transaction.id)] },
    { label: "شهر الرواتب", lines: [salaryMonthValue] },
  ];

  if (additionalMonthValue.length > 0) {
    rightTable.push({ label: "الشهر الاضافي", lines: [additionalMonthValue] });
  }

  // Left table: Status / Total
  const leftTable = [
    { label: "الحالة", lines: [statusText] },
    {
      label: "الإجمالي",
      lines: [`${totalAmount.toLocaleString()} ${transaction.currency}`],
    },
  ];

  if (rightTable.length > leftTable.length) {
    leftTable.push({ label: "", lines: [""] });
  }

  // Y-coordinate for the top info tables, creating a 20px margin after the 40px header.
  const topTablesY = 60;

  const topRowHeights = rightTable.map((row, i) =>
    Math.max(
      row.lines.length * rowHeight,
      leftTable[i]?.lines.length * rowHeight || rowHeight
    )
  );

  let currentTopY = topTablesY;

  // Draw right table
  rightTable.forEach((row, i) => {
    const rowHeightPx = topRowHeights[i];
    const x = pageWidth - margin - boxWidth;
    const y = currentTopY;
    doc.setFontSize(10);
    const labelY =
      rowHeightPx === rowHeight ? y + 7 : y + rowHeightPx / 2 + 2;
    doc.text(String(row.label), x + boxWidth - 5, labelY, { align: "right" });
    row.lines.forEach((line, lineIndex) => {
      doc.text(String(line), x + 5, y + 7 + lineIndex * rowHeight, {
        align: "left",
      });
    });
    doc.rect(x, y, boxWidth, rowHeightPx);
    currentTopY += rowHeightPx;
  });

  currentTopY = topTablesY;

  // Draw left table
  leftTable.forEach((row, i) => {
    const rowHeightPx = topRowHeights[i];
    const x = margin;
    const y = currentTopY;
    doc.setFontSize(10);
    const labelY =
      rowHeightPx === rowHeight ? y + 7 : y + rowHeightPx / 2 + 2;
    doc.text(String(row.label), x + boxWidth - 5, labelY, { align: "right" });
    row.lines.forEach((line, lineIndex) => {
      doc.text(String(line), x + 5, y + 7 + lineIndex * rowHeight, {
        align: "left",
      });
    });
    doc.rect(x, y, boxWidth, rowHeightPx);
    currentTopY += rowHeightPx;
  });

  // Move Y after the two top tables.
  let startY = topTablesY + topRowHeights.reduce((sum, h) => sum + h, 0) + 20;

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
