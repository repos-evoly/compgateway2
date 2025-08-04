/* ------------------------------------------------------------------
   Generates a PDF for any request type.
   Relies on mapRequestToRows() for the row list.
   Strict TypeScript – no “any”, no interface.
------------------------------------------------------------------- */

import { jsPDF } from "jspdf";
import { registerAmiriFont } from "./pdfFonts";
import {
  mapRequestToRows,
  type RequestData,
  type PdfRow,
} from "./requestRowMapper";

registerAmiriFont();

/* ---------- layout constants ---------- */
const margin        = 20;
const headerHeight  = 25;
const lineHeight    = 6;  // per wrapped line
const cellPadding   = 2;  // top+bottom padding inside each cell
const tableWidth    = 200;

/* ------------------------------------------------------------------
   Main generator
------------------------------------------------------------------- */
export const generateRequestPdf = async (
  request: RequestData,
  requestType: string
): Promise<void> => {
  const doc = new jsPDF({ putOnlyUsedFonts: true, hotfixes: ["px_scaling"] });
  doc.setLanguage("ar");

  const pageWidth = doc.internal.pageSize.getWidth();

  /* ---------- header area (logo + title) ---------- */
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
    .text(requestType, pageWidth / 2, 25, { align: "center" });

  doc
    .setFontSize(10)
    .text(`${request.id ?? "N/A"} : رقم المستند`, pageWidth - margin, 15, {
      align: "right",
    });

  /* ---------- table setup ---------- */
  const tableLeft = (pageWidth - tableWidth) / 2;
  const tableTop  = 60;
  const colWidth  = tableWidth / 2;

  const rows: PdfRow[] = mapRequestToRows(request, 6);

  /* --- compute row heights (wrap where needed) --- */
  const rowHeights = rows.map((r) => {
    const dataLines  = doc.splitTextToSize(String(r.data),  colWidth - 4);
    const labelLines = doc.splitTextToSize(r.label,        colWidth - 4);
    const lines      = Math.max(dataLines.length, labelLines.length);
    return lines * lineHeight + cellPadding * 2;
  });

  const tableHeight =
    headerHeight + rowHeights.reduce((sum, h) => sum + h, 0);

  /* ---------- outer border + header fill ---------- */
  doc.setDrawColor(0, 0, 0).setLineWidth(0.5);
  doc.rect(tableLeft, tableTop, tableWidth, tableHeight, "S");

  doc
    .setFillColor(255, 255, 255)
    .rect(tableLeft, tableTop, tableWidth, headerHeight, "F");

  doc
    .setFontSize(10)
    .text("تفاصيل الطلب", tableLeft + tableWidth / 2, tableTop + 10, {
      align: "center",
    })
    .text("Request Details", tableLeft + tableWidth / 2, tableTop + 18, {
      align: "center",
    });

  /* ---------- vertical divider (starts BELOW header) ---------- */
  doc.line(
    tableLeft + colWidth,
    tableTop + headerHeight,      // ← start below header
    tableLeft + colWidth,
    tableTop + tableHeight
  );

  /* ---------- horizontal lines + content ---------- */
  let cursorY = tableTop + headerHeight;

  rows.forEach((row, idx) => {
    const h = rowHeights[idx];

    // bottom line of the row
    doc.line(tableLeft, cursorY + h, tableLeft + tableWidth, cursorY + h);

    const dataLines  = doc.splitTextToSize(String(row.data),  colWidth - 4);
    const labelLines = doc.splitTextToSize(row.label,        colWidth - 4);

    // data (left column)
    doc.setFontSize(9).text(
      dataLines,
      tableLeft + colWidth / 2,
      cursorY + cellPadding + lineHeight,
      { align: "center" }
    );

    // label (right column)
    doc.text(
      labelLines,
      tableLeft + colWidth + colWidth / 2,
      cursorY + cellPadding + lineHeight,
      { align: "center" }
    );

    cursorY += h;
  });

  /* ---------- save ---------- */
  const safe = requestType.replace(/\s+/g, "_");
  doc.save(`${safe}_${request.id ?? "request"}.pdf`);
};
