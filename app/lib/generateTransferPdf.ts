import { jsPDF } from "jspdf";
import { registerAmiriFont } from "./pdfFonts";

/* Optional: if you pass these in from the page, keep the type here for clarity */
export type CheckAccountResponse = {
  accountString: string;
  availableBalance: number;
  debitBalance: number;
  transferType: string;
  companyName: string;
  branchCode: string;
  branchName: string;
  accountName?: string;
  currency: string;
};

registerAmiriFont();

/* ---------- Transfer types ---------- */
export type TransferData = {
  id: number;
  categoryName: string;
  fromAccount: string;
  toAccount: string | string[];
  amount: number;
  status: string;
  requestedAt: string;
  currencyId: string | null;
  description: string;
  economicSectorId: string | null;
  logoData?: string;
};

export type TransferExtra = {
  from: CheckAccountResponse | null;
  to: CheckAccountResponse | null;
};

/* ---------- helpers ---------- */
type ImageProps = { width: number; height: number };
type FittedSize = { w: number; h: number };

const detectImageFormat = (dataUrl: string): "PNG" | "JPEG" =>
  dataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";

const fitInto = (srcW: number, srcH: number, maxW: number, maxH: number): FittedSize => {
  const ratio = Math.min(maxW / srcW, maxH / srcH);
  return { w: srcW * ratio, h: srcH * ratio };
};

const fetchImageAsDataURL = async (path: string): Promise<string | null> => {
  try {
    const res = await fetch(path);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onloadend = () => resolve(typeof r.result === "string" ? r.result : "");
      r.onerror = () => reject(new Error("Failed to read image blob"));
      r.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

const resolveFromPublic = async (candidates: readonly string[]): Promise<string | null> => {
  for (const p of candidates) {
    const data = await fetchImageAsDataURL(p);
    if (data) return data;
  }
  return null;
};

const resolveFooter = (): Promise<string | null> =>
  resolveFromPublic(["/Companygw/footer.png", "/Companygw/images/footer.png"]);

const resolveLogoSide = (): Promise<string | null> =>
  resolveFromPublic(["/Companygw/logoSide.png", "/Companygw/images/logoSide.png"]);

const resolveStamp = (): Promise<string | null> =>
  resolveFromPublic(["/Companygw/stamp.png", "/Companygw/images/stamp.png"]);

/* ---------- text + shape helpers ---------- */
const tCenter = (
  doc: jsPDF,
  s: string,
  x: number,
  y: number,
  family: "Helvetica" | "Amiri",
  size: number,
  color?: { r: number; g: number; b: number }
): void => {
  doc.setFont(family, family === "Amiri" ? "normal" : "normal").setFontSize(size);
  if (family === "Amiri") doc.setFont("Amiri", "normal");
  if (color) doc.setTextColor(color.r, color.g, color.b);
  else doc.setTextColor(0, 0, 0);
  doc.text(s || "", x, y, { align: "center" as const });
};

const tRight = (
  doc: jsPDF,
  s: string,
  x: number,
  y: number,
  family: "Helvetica" | "Amiri",
  size: number,
  color?: { r: number; g: number; b: number }
): void => {
  doc.setFont(family, family === "Amiri" ? "normal" : "normal").setFontSize(size);
  if (family === "Amiri") doc.setFont("Amiri", "normal");
  if (color) doc.setTextColor(color.r, color.g, color.b);
  else doc.setTextColor(0, 0, 0);
  doc.text(s || "", x, y, { align: "right" as const });
};

const box = (
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  fill?: { r: number; g: number; b: number }
): void => {
  if (fill) doc.setFillColor(fill.r, fill.g, fill.b).rect(x, y, w, h, "F");
  doc.setDrawColor(0, 0, 0).setLineWidth(0.25).rect(x, y, w, h, "S");
};

const vline = (doc: jsPDF, x: number, y1: number, y2: number): void => {
  doc.setDrawColor(0, 0, 0).setLineWidth(0.25).line(x, y1, x, y2);
};

const hline = (doc: jsPDF, x1: number, x2: number, y: number): void => {
  doc.setDrawColor(0, 0, 0).setLineWidth(0.25).line(x1, y, x2, y);
};

/* Center-wrapped text inside a region (cx = center X of the region) */
const tCenterWrapped = (
  doc: jsPDF,
  text: string,
  cx: number,
  yTop: number,
  maxWidth: number,
  family: "Helvetica" | "Amiri",
  size: number,
  lineGap = 2
): void => {
  if (!text) return;
  doc.setFont(family, family === "Amiri" ? "normal" : "normal").setFontSize(size);
  if (family === "Amiri") doc.setFont("Amiri", "normal");
  doc.setTextColor(0, 0, 0);
  const lines = doc.splitTextToSize(text, maxWidth) as string[];
  let y = yTop;
  for (const line of lines) {
    doc.text(line, cx, y, { align: "center" as const });
    y += size + lineGap;
  }
};

/* ================================================================== */
/*  PDF (centered branch, to-account name/number, and purpose)        */
/* ================================================================== */
export const generateTransferPdf = async (
  transfer: TransferData,
  extra?: TransferExtra
): Promise<void> => {
  const doc = new jsPDF({ putOnlyUsedFonts: true, hotfixes: ["px_scaling"] });
  doc.setLanguage("ar");

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const fullWidth = pageWidth - margin * 2;
  const gap = 8;

  const logoSide = await resolveLogoSide();
  if (logoSide) {
    try {
      const props = doc.getImageProperties(logoSide) as ImageProps;
      const fmt = detectImageFormat(logoSide);
      const size = fitInto(props.width, props.height, 28, 18);
      doc.addImage(logoSide, fmt, margin, margin, size.w, size.h);
    } catch { /* noop */ }
  }

  /* ---- header stacks ---- */
  const stackTop = margin + 20;
  const stackHeightTopBox = 14;
  const stackHeightGrid = 22;
  const leftStackW = fullWidth * 0.45;
  const rightStackW = fullWidth - leftStackW - gap;

  // RIGHT: Customer box (labels on right, VALUE centered in the remaining area)
  const rightX = margin + leftStackW + gap;
  const rightY = stackTop;
  box(doc, rightX, rightY, rightStackW, stackHeightTopBox);
  const labelPadRight = 6;
  tRight(doc, "Customer", rightX + rightStackW - labelPadRight, rightY + 5.3, "Helvetica", 7);
  tRight(doc, "اسم الزبون", rightX + rightStackW - labelPadRight, rightY + 10.2, "Amiri", 7);

  const customerName = extra?.from?.companyName ?? "";
  // center value between left edge and where labels start (~78mm from right)
  const labelsReserve = 78;
  const custRegionX = rightX + 6;
  const custRegionW = Math.max(20, rightStackW - labelsReserve - 12);
  const custCx = custRegionX + custRegionW / 2;
  tCenterWrapped(doc, customerName, custCx, rightY + 9.2, custRegionW, "Amiri", 8);

  // RIGHT grid (Account Number / Account Type)
  const rGridY = rightY + stackHeightTopBox + 6;
  const rCellH = stackHeightGrid / 2;
  const rCellW = rightStackW / 2;

  box(doc, rightX, rGridY, rCellW, rCellH); // value – Account Number
  box(doc, rightX + rCellW, rGridY, rCellW, rCellH); // label
  box(doc, rightX, rGridY + rCellH, rCellW, rCellH); // value – Account Type
  box(doc, rightX + rCellW, rGridY + rCellH, rCellW, rCellH); // label

  const r1Cy = rGridY + rCellH / 2;
  const r2Cy = rGridY + rCellH + rCellH / 2;

  tCenter(doc, "Account Number", rightX + rCellW + rCellW / 2, r1Cy - 1.3, "Helvetica", 6.5);
  tCenter(doc, "رقم الحساب",     rightX + rCellW + rCellW / 2, r1Cy + 2.6, "Amiri", 6.5);
  tCenter(doc, "Account Type",   rightX + rCellW + rCellW / 2, r2Cy - 1.3, "Helvetica", 6.5);
  tCenter(doc, "نوع الحساب",     rightX + rCellW + rCellW / 2, r2Cy + 2.6, "Amiri", 6.5);

  tCenter(doc, transfer.fromAccount ?? "", rightX + rCellW / 2, r1Cy + 1, "Helvetica", 8);
  tCenter(doc, "",                          rightX + rCellW / 2, r2Cy + 1, "Helvetica", 8);

  // LEFT: title + Date/Branch
  const leftX = margin;
  const leftY = stackTop;
  box(doc, leftX, leftY, leftStackW, stackHeightTopBox, { r: 19, g: 120, b: 67 });
  tCenter(doc, "Electronic internal transfer form", leftX + leftStackW / 2, leftY + 5.3, "Helvetica", 6.5, { r: 255, g: 255, b: 255 });
  tCenter(doc, "نموذج التحويل الداخلي الإلكتروني", leftX + leftStackW / 2, leftY + 10.2, "Amiri", 8.2, { r: 255, g: 255, b: 255 });

  const lGridY = leftY + stackHeightTopBox + 6;
  const lCellH = stackHeightGrid / 2;
  const lCellW = leftStackW / 2;

  box(doc, leftX, lGridY, lCellW, lCellH); // Date value
  box(doc, leftX + lCellW, lGridY, lCellW, lCellH); // Date label
  box(doc, leftX, lGridY + lCellH, lCellW, lCellH); // Branch value
  box(doc, leftX + lCellW, lGridY + lCellH, lCellW, lCellH); // Branch label

  const l1Cy = lGridY + lCellH / 2;
  const l2Cy = lGridY + lCellH + lCellH / 2;

  tCenter(doc, "Date", leftX + lCellW + lCellW / 2, l1Cy - 1.3, "Helvetica", 6.5);
  tCenter(doc, "التاريخ", leftX + lCellW + lCellW / 2, l1Cy + 2.6, "Amiri", 6.5);
  tCenter(doc, "Branch - Agency", leftX + lCellW + lCellW / 2, l2Cy - 1.3, "Helvetica", 6.5);
  tCenter(doc, "الفرع - الوكالة", leftX + lCellW + lCellW / 2, l2Cy + 2.6, "Amiri", 6.5);

  const dt = new Date(transfer.requestedAt || Date.now());
  const dateText = `${dt.toLocaleDateString("en-GB")} ${dt.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })}`;
  tCenter(doc, dateText, leftX + lCellW / 2, l1Cy + 1, "Helvetica", 8);

  // BRANCH (centered)
  const branchName = extra?.from?.branchName ?? "";
  tCenterWrapped(doc, branchName, leftX + lCellW / 2, l2Cy + 1, lCellW - 8, "Amiri", 8);

  /* ================= Clarifications table ================= */
  const tableTop = Math.max(lGridY + stackHeightGrid, rGridY + stackHeightGrid) + 10;
  const tableHeight = 56;
  const headerH = 14;
  const bodyH = tableHeight - headerH;

  const colNO = Math.round(fullWidth * 0.10);
  const colClar = Math.round(fullWidth * 0.54);
  const colDirhams = Math.round(fullWidth * 0.18);
  const colDinar = fullWidth - (colNO + colClar + colDirhams);

  const xDinar = margin;
  const xDirhams = xDinar + colDinar;
  const xClar = xDirhams + colDirhams;
  const xNO = xClar + colClar;

  box(doc, margin, tableTop, fullWidth, tableHeight);
  vline(doc, xDirhams, tableTop, tableTop + tableHeight);
  vline(doc, xClar,    tableTop, tableTop + tableHeight);
  vline(doc, xNO,      tableTop, tableTop + tableHeight);

  doc.setFillColor(235, 235, 235);
  doc.rect(margin, tableTop, fullWidth - colNO, headerH, "F");
  hline(doc, margin, xNO, tableTop + headerH);

  const hdrCy = tableTop + headerH / 2;
  tCenter(doc, "Dinar", xDinar + colDinar / 2, hdrCy - 2, "Helvetica", 7);
  tCenter(doc, "دينار", xDinar + colDinar / 2, hdrCy + 3, "Amiri", 7);
  tCenter(doc, "Dirhams", xDirhams + colDirhams / 2, hdrCy - 2, "Helvetica", 7);
  tCenter(doc, "دراهم", xDirhams + colDirhams / 2, hdrCy + 3, "Amiri", 7);
  tCenter(doc, "Clarifications", xClar + colClar / 2, hdrCy - 2, "Helvetica", 7);
  tCenter(doc, "التوضيحات", xClar + colClar / 2, hdrCy + 3, "Amiri", 7);

  box(doc, xNO, tableTop, colNO, headerH);
  tCenter(doc, "NO",  xNO + colNO / 2, hdrCy - 1, "Helvetica", 7);
  tCenter(doc, "رقم", xNO + colNO / 2, hdrCy + 3, "Amiri", 7);
  box(doc, xNO, tableTop + headerH, colNO, bodyH);

  const bodyTop = tableTop + headerH;

  const clarStampW = Math.round(colClar * 0.33);
  const clarContentW = colClar - clarStampW;
  const clarStampX = xClar;
  const clarContentX = xClar + clarStampW;

  vline(doc, clarContentX, bodyTop, bodyTop + bodyH);

  const r1H = Math.round(bodyH * 0.25);
  const r2H = Math.round(bodyH * 0.20);
  const r3H = Math.round(bodyH * 0.18);
  const r4H = Math.round(bodyH * 0.18);
  const r5H = bodyH - (r1H + r2H + r3H + r4H);

  const r1Y = bodyTop;
  const r2Y = r1Y + r1H;
  const r3Y = r2Y + r2H;
  const r4Y = r3Y + r3H;
  const r5Y = r4Y + r4H;

  const GREEN = { r: 19, g: 120, b: 67 };
  const WHITE = { r: 255, g: 255, b: 255 };

  box(doc, clarContentX, r1Y, clarContentW, r1H, GREEN);
  box(doc, clarContentX, r2Y, clarContentW, r2H);
  box(doc, clarContentX, r3Y, clarContentW, r3H);
  box(doc, clarContentX, r4Y, clarContentW, r4H, GREEN);
  box(doc, clarContentX, r5Y, clarContentW, r5H);

  tCenter(doc, "Recipient  :  المستفيد", clarContentX + clarContentW / 2, r1Y + r1H / 2 + 2, "Amiri", 8, WHITE);
  tCenter(doc, "purpose  :  الغرض",      clarContentX + clarContentW / 2, r4Y + r4H / 2 + 2, "Amiri", 8, WHITE);

  const toAccountStr: string =
    typeof transfer.toAccount === "string" ? transfer.toAccount : (transfer.toAccount?.[0] ?? "");

  // CENTER the recipient name, the to-account number, and the purpose
  const clarCx = clarContentX + clarContentW / 2;
  tCenterWrapped(doc, extra?.to?.companyName ?? "", clarCx, r2Y + r2H / 2, clarContentW - 12, "Amiri", 8);
  tCenterWrapped(doc, toAccountStr,                clarCx, r3Y + r3H / 2, clarContentW - 12, "Helvetica", 8);
  tCenterWrapped(doc, transfer.description ?? "",  clarCx, r5Y + r5H / 2, clarContentW - 12, "Amiri", 8);

  // Stamp column
  box(doc, clarStampX, bodyTop, clarStampW, bodyH);
  const stampData = await resolveStamp();
  if (stampData) {
    try {
      const props = doc.getImageProperties(stampData) as ImageProps;
      const fmt = detectImageFormat(stampData);
      const sPad = 6;
      const maxW = clarStampW - sPad * 2;
      const maxH = bodyH - sPad * 2;
      const size = fitInto(props.width, props.height, maxW, maxH);
      const sx = clarStampX + (clarStampW - size.w) / 2;
      const sy = bodyTop + (bodyH - size.h) / 2;
      doc.addImage(stampData, fmt, sx, sy, size.w, size.h);
    } catch { /* noop */ }
  }

  /* Dinar & Dirhams */
  const amt = Number(transfer.amount ?? 0);
  const dinars = Math.trunc(Math.floor(amt + 1e-9));
  const dirhams = Math.round((amt - dinars) * 1000);

  box(doc, xDinar,   bodyTop, colDinar,   bodyH);
  box(doc, xDirhams, bodyTop, colDirhams, bodyH);
  tCenter(doc, Intl.NumberFormat("en-US").format(dinars),  xDinar   + colDinar   / 2, bodyTop + bodyH / 2, "Helvetica", 11);
  tCenter(doc, Intl.NumberFormat("en-US").format(dirhams), xDirhams + colDirhams / 2, bodyTop + bodyH / 2, "Helvetica", 11);

  /* Yellow totals bar */
  const yellowH = 10;
  const yellowY = tableTop + tableHeight;
  doc.setFillColor(253, 216, 53);
  doc.rect(margin, yellowY, fullWidth, yellowH, "F");
  box(doc, margin, yellowY, fullWidth, yellowH);

  const tableBottomWithFooter = yellowY + yellowH;
  vline(doc, margin,             tableTop, tableBottomWithFooter);
  vline(doc, xDirhams,           tableTop, tableBottomWithFooter);
  vline(doc, xClar,              tableTop, tableBottomWithFooter);
  vline(doc, xNO,                tableTop, tableBottomWithFooter);
  vline(doc, margin + fullWidth, tableTop, tableBottomWithFooter);

  tCenter(doc, Intl.NumberFormat("en-US").format(dinars),  xDinar   + colDinar   / 2, yellowY + 6.6, "Helvetica", 8.5);
  tCenter(doc, Intl.NumberFormat("en-US").format(dirhams), xDirhams + colDirhams / 2, yellowY + 6.6, "Helvetica", 8.5);

  /* Signatures (2×2) */
  const signGap = 6;
  const signTop = tableBottomWithFooter + signGap;
  const signW = fullWidth;
  const signHHeader = 10;
  const signHBody = 16;
  const signColW = signW / 2;

  box(doc, margin,            signTop,               signColW, signHHeader, { r: 19, g: 120, b: 67 });
  box(doc, margin + signColW, signTop,               signColW, signHHeader, { r: 19, g: 120, b: 67 });
  tCenter(doc, "توقيع الزبون",  margin + signColW / 2,            signTop + 6.5, "Amiri", 8, { r: 255, g: 255, b: 255 });
  tCenter(doc, "توقيع الموظف",  margin + signColW + signColW / 2, signTop + 6.5, "Amiri", 8, { r: 255, g: 255, b: 255 });

  box(doc, margin,            signTop + signHHeader, signColW, signHBody);
  box(doc, margin + signColW, signTop + signHHeader, signColW, signHBody);

  const footerData = await resolveFooter();
  if (footerData) {
    try {
      const props = doc.getImageProperties(footerData) as ImageProps;
      const fmt = detectImageFormat(footerData);
      const size = fitInto(props.width, props.height, pageWidth - 20, 24);
      const fx = (pageWidth - size.w) / 2;
      const fy = signTop + signHHeader + signHBody + 8;
      doc.addImage(footerData, fmt, fx, fy, size.w, size.h);
    } catch { /* noop */ }
  }

  doc.save(`transfer_${transfer.id}_${new Date().toISOString().split("T")[0]}.pdf`);
};
