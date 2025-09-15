// app/[locale]/statement-of-account/printCertifiedStatement.ts
// Fit & tidy + filled header tables + SUMMARY ON A NEW PAGE (with stamp).
// CHANGE: Page background now comes from **/public/watermark.pdf** (not PNG)
//          using pdf.js to render page 1 to a PNG data URL used by jsPDF.
//
// • EVERY page: full-page background from /watermark.pdf
// • EVERY page: footer stack (/note.png above /footer.png) with side margins
// • FIRST page ONLY: /header.png at the top with side margins
// • FIRST page ONLY: two compact 3×2 RTL tables under the header (labels right, values left; values filled)
// • BELOW: a bordered transactions table (bilingual header)
// • AFTER rows: ALWAYS add a NEW PAGE with the summary table + stamp (/stamp.png)
//
// Usage:
//   await printCertifiedStatement(lines, accountInfo)

"use client";

import { jsPDF } from "jspdf";
import { registerAmiriFont } from "@/app/lib/pdfFonts";
import type { StatementLine } from "@/app/[locale]/statement-of-account/services";
import type {
  PDFDocumentProxy,
  PDFPageProxy,
} from "pdfjs-dist/types/src/display/api";
import type { PageViewport } from "pdfjs-dist/types/src/display/display_utils";

registerAmiriFont();

/* ------------------------------ helpers ------------------------------ */
type Rgb = { r: number; g: number; b: number };
const TEXT: Rgb = { r: 0x1f, g: 0x29, b: 0x37 };
const GRID: Rgb = { r: 0x00, g: 0x00, b: 0x00 };
const TH_FILL: Rgb = { r: 220, g: 220, b: 220 };
const SHADE: Rgb = { r: 230, g: 230, b: 230 }; // for highlighted row



function loadPublicImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/* --------------------------- watermark.pdf loader --------------------------- */
type PdfJsLike = {
  version: string;
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (
    src: { url: string } | { data: ArrayBuffer }
  ) => { promise: Promise<PDFDocumentProxy> };
};

async function loadPdfJs(): Promise<PdfJsLike> {
  const mod = await import("pdfjs-dist/legacy/build/pdf");
  const maybeDefault = (mod as { default?: PdfJsLike }).default;
  return maybeDefault ?? (mod as unknown as PdfJsLike);
}

async function fetchPublicPdfBytes(publicPath: string): Promise<ArrayBuffer> {
  const res = await fetch(publicPath, { cache: "force-cache" });
  if (!res.ok) throw new Error(`Failed to load PDF "${publicPath}" (${res.status})`);
  return await res.arrayBuffer();
}

async function renderPdfPageToPngDataURL(
  pdfBytes: ArrayBuffer,
  pageIndex: number = 1,
  scale: number = 2
): Promise<string> {
  const pdfjs = await loadPdfJs();
  pdfjs.GlobalWorkerOptions.workerSrc =
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

  const doc: PDFDocumentProxy = await pdfjs.getDocument({ data: pdfBytes }).promise;
  const page: PDFPageProxy = await doc.getPage(pageIndex);
  const viewport: PageViewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable.");

  const task = page.render({ canvasContext: ctx, viewport });
  await task.promise;

  return canvas.toDataURL("image/png");
}

/* ------------------------------ chrome ------------------------------- */
const PUBLIC_HEADER = "/header.png";
const PUBLIC_NOTE = "/note.png";
const PUBLIC_FOOTER = "/footer.png";
const PUBLIC_STAMP = "/stamp.png";
const PUBLIC_WATERMARK_PDF = "/watermark.pdf";

const IMAGE_SIDE_MARGIN = 12; // side margin for header & footer images
const FOOTER_GAP = 6; // vertical gap between note and footer images

/** Draw background (from watermark **data URL**) + optional header (first page). Returns header image height used. */
function drawBackgroundAndHeader(
  doc: jsPDF,
  images: { watermarkDataUrl: string; header?: HTMLImageElement },
  isFirstPage: boolean
): number {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  // full-page watermark rendered from PDF
  doc.addImage(images.watermarkDataUrl, "PNG", 0, 0, pageW, pageH);

  let headerH = 0;
  if (isFirstPage && images.header) {
    const headerW = pageW - IMAGE_SIDE_MARGIN * 2;
    headerH = (images.header.naturalHeight / images.header.naturalWidth) * headerW;
    doc.addImage(images.header, "PNG", IMAGE_SIDE_MARGIN, 0, headerW, headerH);
  }
  return headerH;
}

/** Draw note.png stacked above footer.png at the bottom, both with side margins. */
function drawFooterStackGetTop(
  doc: jsPDF,
  images: { note: HTMLImageElement; footer: HTMLImageElement }
): { noteTopY: number } {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const footerW = pageW - IMAGE_SIDE_MARGIN * 2;
  const footerH = (images.footer.naturalHeight / images.footer.naturalWidth) * footerW;
  const footerX = IMAGE_SIDE_MARGIN;
  const footerY = pageH - footerH;

  const noteW = pageW - IMAGE_SIDE_MARGIN * 2;
  const noteH = (images.note.naturalHeight / images.note.naturalWidth) * noteW;
  const noteX = IMAGE_SIDE_MARGIN;
  const noteY = Math.max(0, footerY - FOOTER_GAP - noteH);

  // Draw note then footer
  doc.addImage(images.note, "PNG", noteX, noteY, noteW, noteH);
  doc.addImage(images.footer, "PNG", footerX, footerY, footerW, footerH);

  return { noteTopY: noteY };
}

/* ----------------- fit single line into width (centered) ---------------- */
function drawFittedSingleLineCentered(
  doc: jsPDF,
  text: string,
  centerX: number,
  centerY: number,
  maxWidth: number,
  startFs: number,
  minFs: number
): void {
  let fs = startFs;
  doc.setFont("Amiri", "normal");
  doc.setTextColor(TEXT.r, TEXT.g, TEXT.b);
  doc.setFontSize(fs);
  let w = doc.getTextWidth(text);
  while (w > maxWidth && fs > minFs) {
    fs -= 0.2;
    doc.setFontSize(fs);
    w = doc.getTextWidth(text);
  }
  doc.text(text, centerX, centerY, { align: "center", baseline: "middle" });
}

/* --------------------------- first-page RTL tables --------------------------- */
function drawFirstPageHeaderTablesRTL(
  doc: jsPDF,
  topY: number,
  compact: boolean,
  accountInfo: {
    accountNumber: string;
    customerName: string;
    accountType: string;
    currency: string;
    branchAgency: string;
    timePeriod: string;
  }
): number {
  const pageW = doc.internal.pageSize.getWidth();
  const marginX = 12;
  const gapX = 10;

  const tableW = (pageW - marginX * 2 - gapX) / 2;
  const rows = 3;

  const tableH = compact ? 34 : 42;
  const rowH = tableH / rows;

  const colW = tableW / 2;
  const leftTableX = marginX;
  const rightTableX = marginX + tableW + gapX;

  const leftLabels: Array<{ ar: string; en: string; value: string }> = [
    { ar: "رقم الحساب", en: "Account Number", value: accountInfo.accountNumber?.trim() || "-----" },
    { ar: "نوع العملة", en: "Currency Type", value: accountInfo.currency?.trim() || "-----" },
    { ar: "الوكالة – الفرع", en: "Branch - Agency", value: accountInfo.branchAgency?.trim() || "-----" },
  ];
  const rightLabels: Array<{ ar: string; en: string; value: string }> = [
    { ar: "اسم الزبون", en: "Customer", value: accountInfo.customerName?.trim() || "-----" },
    { ar: "نوع الحساب", en: "Account Type", value: accountInfo.accountType?.trim() || "-----" },
    { ar: "الفترة الزمنية", en: "Time Period", value: accountInfo.timePeriod?.trim() || "-----" },
  ];

  const drawOneTable = (
    x: number,
    y: number,
    labels: Array<{ ar: string; en: string; value: string }>
  ) => {
    // Outer border
    doc.setDrawColor(GRID.r, GRID.g, GRID.b);
    doc.setLineWidth(0.9);
    doc.rect(x, y, tableW, tableH, "S");

    // Horizontal
    doc.setLineWidth(0.7);
    for (let r = 1; r < rows; r++) {
      const ly = y + r * rowH;
      doc.line(x, ly, x + tableW, ly);
    }

    // Middle vertical
    const midX = x + colW;
    doc.line(midX, y, midX, y + tableH);

    // RIGHT (labels) & LEFT (values) centers
    const labelCx = x + colW + colW / 2;
    const valueCx = x + colW / 2;

    for (let r = 0; r < rows; r++) {
      const cy = y + r * rowH;
      const centerY = cy + rowH / 2;

      // Labels on RIGHT cell
      doc.setFont("Amiri", "normal");
      doc.setTextColor(TEXT.r, TEXT.g, TEXT.b);
      doc.setFontSize(9.6);
      doc.text(labels[r].ar, labelCx, centerY - 2.8, { align: "center", baseline: "middle" });
      doc.setFontSize(8.6);
      doc.text(labels[r].en, labelCx, centerY + 2.8, { align: "center", baseline: "middle" });

      // Value in LEFT cell
      drawFittedSingleLineCentered(doc, labels[r].value, valueCx, centerY, colW - 6, 10.4, 7.2);
    }
  };

  drawOneTable(leftTableX, topY, leftLabels);
  drawOneTable(rightTableX, topY, rightLabels);

  return tableH;
}

/* -------------------------- transactions table -------------------------- */
type Col = { w: number; ar: string; en: string };

const BASE_COLS: Col[] = [
  { w: 24, ar: "الرصيد", en: "Balance" },
  { w: 24, ar: "دائن", en: "Credit" },
  { w: 24, ar: "مدين", en: "Debit" },
  { w: 60, ar: "البيان", en: "Ref.Desc" },
  { w: 32, ar: "الرمز", en: "Ref." },
  { w: 32, ar: "التاريخ", en: "Date" },
];



const HEADER_H = 13.6;
const HEADER_AR = 9.6;
const HEADER_EN = 8.8;

const BODY_FONT = 8.1;
const BALANCE_MIN_FONT = 6.8;
const CELL_VPAD = 1.2;

const lineH = (fs: number) => fs * 0.34;
const colsWidthSum = (cols: Col[]) => cols.reduce((a, b) => a + b.w, 0);

function wrapClamp(
  doc: jsPDF,
  text: string,
  width: number,
  maxLines: number,
  fs: number
): string[] {
  doc.setFont("Amiri", "normal");
  doc.setTextColor(TEXT.r, TEXT.g, TEXT.b);
  doc.setFontSize(fs);
  const raw = doc.splitTextToSize(text ?? "", width);
  if (raw.length <= maxLines) return raw;

  const out = raw.slice(0, Math.max(1, maxLines));
  let last = out[out.length - 1];
  while (last.length > 1 && doc.getTextWidth(last + "…") > width - 0.8) {
    last = last.slice(0, -1);
  }
  out[out.length - 1] = last + "…";
  return out;
}

function drawTableHeaderRow(doc: jsPDF, cols: Col[], x: number, y: number): void {
  let cx = x;
  for (let i = 0; i < cols.length; i++) {
    doc.setFillColor(TH_FILL.r, TH_FILL.g, TH_FILL.b);
    doc.rect(cx, y, cols[i].w, HEADER_H, "F");
    doc.setDrawColor(GRID.r, GRID.g, GRID.b);
    doc.setLineWidth(0.7);
    doc.rect(cx, y, cols[i].w, HEADER_H, "S");

    // Arabic (top) and English (bottom) — both normal (no bold) to avoid glyph glitches
    doc.setFont("Amiri", "normal");
    doc.setTextColor(TEXT.r, TEXT.g, TEXT.b);
    doc.setFontSize(HEADER_AR);
    doc.text(cols[i].ar, cx + cols[i].w / 2, y + 3.4, { align: "center", baseline: "top" });

    doc.setFontSize(HEADER_EN);
    doc.text(cols[i].en, cx + cols[i].w / 2, y + HEADER_H - 3.4, {
      align: "center",
      baseline: "bottom",
    });
    cx += cols[i].w;
  }
}

function drawBodyRow(
  doc: jsPDF,
  cols: Col[],
  x: number,
  y: number,
  h: number,
  data: { balance: string; credit: string; debit: string; desc: string; ref: string; date: string }
): void {
  const maxLines = Math.max(1, Math.floor((h - CELL_VPAD * 2) / lineH(BODY_FONT)));
  const cellsRaw = [data.balance, data.credit, data.debit, data.desc, data.ref, data.date];

  let cx = x;
  for (let i = 0; i < cols.length; i++) {
    doc.setDrawColor(GRID.r, GRID.g, GRID.b);
    doc.setLineWidth(0.55);
    doc.rect(cx, y, cols[i].w, h, "S");

    let fs = BODY_FONT;
    let lines: string[];

    if (i === 0) {
      const text = cellsRaw[i] ?? "";
      doc.setFont("Amiri", "normal");
      doc.setTextColor(TEXT.r, TEXT.g, TEXT.b);
      doc.setFontSize(fs);
      while (doc.getTextWidth(text) > cols[i].w - 1.2 && fs > BALANCE_MIN_FONT) {
        fs -= 0.2;
        doc.setFontSize(fs);
      }
      lines = [text];
    } else {
      const width = cols[i].w - 2;
      const text = cellsRaw[i] ?? "";
      lines = wrapClamp(doc, text, width, maxLines, fs);
    }

    const lH = lineH(fs);
    const textBlockH = Math.max(1, lines.length) * lH;
    const yStart = y + (h - textBlockH) / 2 + lH / 2;

    doc.setFont("Amiri", "normal");
    doc.setTextColor(TEXT.r, TEXT.g, TEXT.b);
    doc.setFontSize(fs);
    doc.text(lines, cx + cols[i].w / 2, yStart, { align: "center", baseline: "middle" });

    cx += cols[i].w;
  }
}

/* --------------------- summary (NEW PAGE ONLY) with stamp --------------------- */
type SummaryValues = {
  bookValue: string;
  facilities: string;
  nonSettlement: string;
  held: string;
  available: string;
  issueDate: string;
  issueTime: string;
};

function drawSummaryWithStamp(
  doc: jsPDF,
  stampImg: HTMLImageElement,
  yStart: number,
  values: SummaryValues
): number {
  const pageW = doc.internal.pageSize.getWidth();
  const marginX = 12;
  const areaW = pageW - marginX * 2;

  const gapX = 10;
  const stampW = 56;
  const stampH = (stampImg.naturalHeight / stampImg.naturalWidth) * stampW;

  const tableW = areaW - stampW - gapX;
  const tableX = marginX + areaW - tableW;
  const stampX = marginX;

  // Summary table: 5 rows × 2 columns (labels on right, values on left)
  const rows = [
    { ar: "القيمة الدفترية", val: values.bookValue },
    { ar: "التسهيلات الممنوحة", val: values.facilities },
    { ar: "بنود غير مساواة", val: values.nonSettlement },
    { ar: "الرصيد المحجوز", val: values.held },
    { ar: "الرصيد المتاح", val: values.available, highlight: true as const },
  ];
  const rowH = 11.2;
  const tableH = rows.length * rowH;
  const colW = tableW / 2;

  // Draw stamp
  doc.addImage(stampImg, "PNG", stampX, yStart, stampW, stampH);

  // Draw table
  const tableY = yStart;
  doc.setDrawColor(GRID.r, GRID.g, GRID.b);
  doc.setLineWidth(1);
  doc.rect(tableX, tableY, tableW, tableH, "S");
  doc.setLineWidth(0.8);
  for (let r = 1; r < rows.length; r++) {
    const y = tableY + r * rowH;
    doc.line(tableX, y, tableX + tableW, y);
  }
  const midX = tableX + colW;
  doc.line(midX, tableY, midX, tableY + tableH);

  // Highlight row
  const hiIdx = rows.findIndex((r) => r.highlight);
  if (hiIdx >= 0) {
    const y = tableY + hiIdx * rowH;
    doc.setFillColor(SHADE.r, SHADE.g, SHADE.b);
    doc.rect(tableX, y, tableW, rowH, "F");
    doc.setLineWidth(1.4);
    doc.rect(tableX, y, tableW, rowH, "S");
    doc.setLineWidth(0.8);
  }

  // Values (left) + labels (right) — force Amiri NORMAL for Arabic labels
  for (let r = 0; r < rows.length; r++) {
    const cy = tableY + r * rowH;
    const centerY = cy + rowH / 2;

    // LEFT (values)
    const valCx = tableX + colW / 2;
    drawFittedSingleLineCentered(doc, rows[r].val, valCx, centerY, colW - 6, 10.4, 7.2);

    // RIGHT (labels)
    doc.setFont("Amiri", "normal");
    doc.setTextColor(TEXT.r, TEXT.g, TEXT.b);
    doc.setFontSize(rows[r].highlight ? 10.2 : 9.8);
    const labCx = tableX + colW + colW / 2;
    doc.text(rows[r].ar, labCx, centerY, { align: "center", baseline: "middle" });
  }

  // Date row below the table (3 cells): [Date | Time | Label]
  const dateGapY = 8;
  const dateY = tableY + tableH + dateGapY;
  const dateH = 12;
  const dateColsW = [tableW * 0.38, tableW * 0.22, tableW * 0.40] as const;
  const dateX = tableX;

  doc.setLineWidth(1);
  doc.rect(dateX, dateY, tableW, dateH, "S");
  doc.setLineWidth(0.8);
  let cx = dateX;
  for (let i = 0; i < 3; i++) {
    if (i > 0) doc.line(cx, dateY, cx, dateY + dateH);
    cx += dateColsW[i];
  }

  // Arabic-safe (normal) for all three cells
  doc.setFont("Amiri", "normal");
  doc.setTextColor(TEXT.r, TEXT.g, TEXT.b);
  doc.setFontSize(9.6);
  doc.text(values.issueDate, dateX + dateColsW[0] / 2, dateY + dateH / 2, { align: "center", baseline: "middle" });
  doc.text(values.issueTime, dateX + dateColsW[0] + dateColsW[1] / 2, dateY + dateH / 2, { align: "center", baseline: "middle" });
  doc.setFontSize(9.8);
  doc.text("تاريخ إصدار كشف الحساب", dateX + dateColsW[0] + dateColsW[1] + dateColsW[2] / 2, dateY + dateH / 2, {
    align: "center",
    baseline: "middle",
  });

  return Math.max(stampH, tableH) + dateGapY + dateH;
}

/* ---------------------------- public API (print) --------------------------- */
export async function printCertifiedStatement(
  lines: StatementLine[],
  accountInfo: {
    accountNumber: string;
    customerName: string;
    accountType: string;
    currency: string;
    branchAgency: string;
    timePeriod: string;
  }
): Promise<void> {
  console.log("[printCertifiedStatement] data:", { lines, accountInfo });

  // Load non-watermark assets
  const [header, note, footer, stamp] = await Promise.all([
    loadPublicImage(PUBLIC_HEADER),
    loadPublicImage(PUBLIC_NOTE),
    loadPublicImage(PUBLIC_FOOTER),
    loadPublicImage(PUBLIC_STAMP),
  ]);

  // Load watermark.pdf and render page 1 → PNG data URL
  const watermarkBytes = await fetchPublicPdfBytes(PUBLIC_WATERMARK_PDF);
  const watermarkDataUrl = await renderPdfPageToPngDataURL(watermarkBytes, 1, 2);

  const doc = new jsPDF({ putOnlyUsedFonts: true, hotfixes: ["px_scaling"] });
  doc.setLanguage("ar");

  const pageW = doc.internal.pageSize.getWidth();

  // Fallback running balance if not provided
  let runningBalance = 0;
  const hasBalance = lines.some((l) => typeof l.balance === "number");

  // Pagination settings
  const rowsFirstPage = 33;
  const rowsOtherPages = 43;

  let idx = 0;
  let pageIndex = 0;

  while (idx < lines.length || pageIndex === 0) {
    const isFirst = pageIndex === 0;
    const cols: Col[] = isFirst ? [
      { w: 30, ar: "الرصيد", en: "Balance" },
      { w: 24, ar: "دائن", en: "Credit" },
      { w: 24, ar: "مدين", en: "Debit" },
      { w: 60, ar: "البيان", en: "Ref.Desc" },
      { w: 32, ar: "الرمز", en: "Ref." },
      { w: 26, ar: "التاريخ", en: "Date" },
    ] : BASE_COLS;

    const tableLeft = (pageW - colsWidthSum(cols)) / 2;

    // Background + header image
    const headerH = drawBackgroundAndHeader(doc, { watermarkDataUrl, header }, isFirst);

    // First-page header tables (FILLED)
    let topAfterTables = isFirst ? headerH + 6 : 14;
    if (isFirst) {
      const tablesTop = headerH + 6;
      const tablesH = drawFirstPageHeaderTablesRTL(doc, tablesTop, true, accountInfo);
      topAfterTables = tablesTop + tablesH + 6;
    }

    // Footer (for available height)
    const { noteTopY } = drawFooterStackGetTop(doc, { note, footer });

    // Transactions header
    const tableHeaderY = topAfterTables;
    drawTableHeaderRow(doc, cols, tableLeft, tableHeaderY);

    // Available height and rows per page
    const usableH = Math.max(0, noteTopY - (tableHeaderY + HEADER_H) - 6);
    const rowsThisPage =
      idx === 0
        ? Math.min(rowsFirstPage, Math.max(0, lines.length - idx))
        : Math.min(rowsOtherPages, Math.max(0, lines.length - idx));

    const rowH = rowsThisPage > 0 ? usableH / rowsThisPage : 0;

    // Body rows
    let y = tableHeaderY + HEADER_H;
    for (let n = 0; n < rowsThisPage; n++, idx++) {
      const L = lines[idx];

      const amount = typeof L.amount === "number" ? L.amount : 0;
      if (!hasBalance) runningBalance += amount;
      const balanceVal = typeof L.balance === "number" ? L.balance : runningBalance;

      const creditText = amount > 0 ? String(amount) : "";
      const debitText = amount < 0 ? String(amount) : "";
      const desc = [L.nr1, L.nr2, L.nr3].filter((s): s is string => !!s).join(" ");
      const ref = L.reference ?? "";
      const dateStr = L.postingDate ? new Date(L.postingDate).toISOString().slice(0, 10) : "";

      drawBodyRow(doc, cols, tableLeft, y, rowH, {
        balance: String(balanceVal),
        credit: creditText,
        debit: debitText,
        desc,
        ref,
        date: dateStr,
      });

      y += rowH;
    }

    pageIndex++;
    if (idx < lines.length) {
      doc.addPage();
    } else {
      break;
    }
  }

  // --------- ALWAYS put SUMMARY + STAMP on a NEW PAGE ----------
  doc.addPage();
  // Background (no header on summary page)
  drawBackgroundAndHeader(doc, { watermarkDataUrl }, false);
  // Footer for the summary page
  const { noteTopY: summaryNoteTop } = drawFooterStackGetTop(doc, { note, footer });

  // Prepare summary values
  const now = new Date();
  const issueDate = now.toISOString().slice(0, 10);
  const issueTime = now
    .toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    .replace(/^24:/, "00:");

  let finalBalanceNum: number;
  if (hasBalance) {
    const last = lines[lines.length - 1];
    finalBalanceNum = typeof last.balance === "number" ? last.balance : runningBalance;
  } else {
    finalBalanceNum = runningBalance;
  }
  const finalBalance = String(finalBalanceNum);

  const summaryValues = {
    bookValue: finalBalance || "-----",
    facilities: "-----",
    nonSettlement: "-----",
    held: "-----",
    available: finalBalance || "-----",
    issueDate,
    issueTime,
  };


  const rowHsum = 11.2;
  const tableHsum = 5 * rowHsum;
  const dateH = 12;
  const requiredH = Math.max(56, tableHsum) + 8 + dateH; // approximate height
  const yStart = Math.max(24, summaryNoteTop - requiredH - 12);

  void (function draw() {
    // drawSummaryWithStamp needs the actual stamp image dimensions; we already loaded 'stamp'
    const consumed = drawSummaryWithStamp(
      doc,
      (stamp as HTMLImageElement),
      yStart,
      summaryValues
    );
    return consumed;
  })();

  // Save
  doc.save(
    `certified_statement_${accountInfo.accountNumber}_${new Date()
      .toISOString()
      .split("T")[0]}.pdf`
  );
}
