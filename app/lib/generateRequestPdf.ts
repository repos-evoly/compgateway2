/* ------------------------------------------------------------------
   generateRequestPdf.ts
   – Generates a multi-page PDF for any request type.
   – If the table does not fit on one page it continues on
     subsequent pages, repeating the table header each time.
   – **Updated**: removed the vertical divider that cut through
     the “تفاصيل الطلب / Request Details” header row.
   Relies on mapRequestToRows() for the row list.
   Strict TypeScript – no “any”, no interface, exact types only.
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
const margin        = 20;   // left/right page margin
const headerHeight  = 25;   // table header (“تفاصيل الطلب / Request Details”)
const lineHeight    = 6;    // height per wrapped line of text
const cellPadding   = 2;    // top+bottom padding in each cell
const tableWidth    = 200;  // total table width

/* ------------------------------------------------------------------
   Helpers
------------------------------------------------------------------- */
const drawPageHeader = (
  doc: jsPDF,
  requestType: string,
  reqId: string,
  logoData: string | null
): void => {
  const pageWidth = doc.internal.pageSize.getWidth();

  /* white strip – keeps top area clean on every page */
  doc.setFillColor(255, 255, 255).rect(0, 0, pageWidth, 40, "F");

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
    .text(`${reqId} : رقم المستند`, pageWidth - margin, 15, { align: "right" });
};

const drawTableHeader = (
  doc: jsPDF,
  tableLeft: number,
  tableTop: number,
  tableWidthPx: number
): void => {
  /* border rectangle for header row */
  doc.setDrawColor(0, 0, 0).setLineWidth(0.5);
  doc.rect(tableLeft, tableTop, tableWidthPx, headerHeight, "S");

  /* white fill inside header */
  doc
    .setFillColor(255, 255, 255)
    .rect(tableLeft, tableTop, tableWidthPx, headerHeight, "F");

  /* header text (Arabic + English) */
  doc
    .setFontSize(10)
    .text("تفاصيل الطلب", tableLeft + tableWidthPx / 2, tableTop + 10, {
      align: "center",
    })
    .text("Request Details", tableLeft + tableWidthPx / 2, tableTop + 18, {
      align: "center",
    });
};

/* ------------------------------------------------------------------
   Main generator
------------------------------------------------------------------- */
export const generateRequestPdf = async (
  request: RequestData,
  requestType: string
): Promise<void> => {
  const doc          = new jsPDF({ putOnlyUsedFonts: true, hotfixes: ["px_scaling"] });
  const pageWidth    = doc.internal.pageSize.getWidth();
  const pageHeight   = doc.internal.pageSize.getHeight();
  const colWidth     = tableWidth / 2;
  const tableLeft    = (pageWidth - tableWidth) / 2;
  const tableTop     = 60;            // Y-start of the table (first page)
  const bottomMargin = margin;        // distance from bottom edge before break

  doc.setLanguage("ar");

  const logoData =
    typeof window !== "undefined" ? localStorage.getItem("pdfLogo") : null;

  /* ---------- prepare data ---------- */
  const rows: PdfRow[] = mapRequestToRows(request, 6);

  const rowHeights = rows.map((r) => {
    const dataLines  = doc.splitTextToSize(String(r.data),  colWidth - 4);
    const labelLines = doc.splitTextToSize(r.label,        colWidth - 4);
    const lines      = Math.max(dataLines.length, labelLines.length);
    return lines * lineHeight + cellPadding * 2;
  });

  /* ---------- draw first page header & table header ---------- */
  drawPageHeader(doc, requestType, String(request.id ?? "N/A"), logoData);
  drawTableHeader(doc, tableLeft, tableTop, tableWidth);

  /* ---------- iterate rows across pages ---------- */
  let cursorY = tableTop + headerHeight;

  rows.forEach((row, idx) => {
    const h = rowHeights[idx];

    /* --- page-break check --- */
    if (cursorY + h > pageHeight - bottomMargin) {
      /* close bottom border of previous page table */
      doc.line(tableLeft, cursorY, tableLeft + tableWidth, cursorY);

      /* new page */
      doc.addPage();
      drawTableHeader(doc, tableLeft, tableTop, tableWidth);
      cursorY = tableTop + headerHeight;
    }

    /* --- cell borders for this row --- */
    const rowTop    = cursorY;
    const rowBottom = cursorY + h;

    // left, middle, right verticals
    doc.line(tableLeft,            rowTop, rowLeftEnd(tableLeft), rowBottom);
    doc.line(tableLeft + colWidth, rowTop, tableLeft + colWidth,  rowBottom);
    doc.line(tableLeft + tableWidth, rowTop, tableLeft + tableWidth, rowBottom);
    // bottom horizontal
    doc.line(tableLeft, rowBottom, tableLeft + tableWidth, rowBottom);

    /* --- text --- */
    const dataLines  = doc.splitTextToSize(String(row.data),  colWidth - 4);
    const labelLines = doc.splitTextToSize(row.label,        colWidth - 4);

    doc
      .setFont("Amiri", "normal")
      .setFontSize(9)
      .text(
        dataLines,
        tableLeft + colWidth / 2,
        rowTop + cellPadding + lineHeight,
        { align: "center" }
      );

    doc.text(
      labelLines,
      tableLeft + colWidth + colWidth / 2,
      rowTop + cellPadding + lineHeight,
      { align: "center" }
    );

    cursorY += h;
  });

  /* ---------- save ---------- */
  const safe = requestType.replace(/\s+/g, "_");
  doc.save(`${safe}_${request.id ?? "request"}.pdf`);
};

/* utility – end of left border */
const rowLeftEnd = (tableLeft: number): number => tableLeft; // helper for clarity
