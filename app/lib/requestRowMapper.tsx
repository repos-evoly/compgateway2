/* ------------------------------------------------------------------
   Maps request objects to the rows that appear in the generated PDF.
   Supported kinds
     • letterOfGuarantee
     • creditFacility
     • visa
     • certifiedBankStatement
     • rtgs
     • check-book
     • certified-check / card (default)
   Strict TypeScript – no “any”, no interface, exact types only.
------------------------------------------------------------------- */

/* ---------- domain types ---------- */
export type Representative = {
  id?: number;
  name?: string;
  number?: string;
  [k: string]: unknown;
};

export type RequestData = {
  type?: string;

  /* universal */
  accountNumber?: string | number;
  accountNum?: string | number;
  date?: string;

  /* names */
  fullName?: string;
  customerName?: string;
  accountHolderName?: string;

  /* representative */
  representative?: Representative;
  representativeId?: string | number;
  representativeName?: string;

  /* check-book */
  branch?: string;
  address?: string;
  bookContaining?: string;

  /* certified-check / card */
  cardNum?: string;
  carNum?: string;
  beneficiary?: string;

  /* guarantee & credit-facility */
  amount?: number;
  referenceNumber?: string;
  purpose?: string;
  reason?: string;
  additionalInfo?: string;

  /* visa */
  cardMovementApproval?: string;
  cardUsingAcknowledgment?: string;
  cbl?: string;
  foreignAmount?: number;
  localAmount?: number;
  phoneNumberLinkedToNationalId?: string;
  pldedge?: string;

  /* certified bank-statement */
  newAccountNumber?: string | number;
  oldAccountNumber?: string | number;
  serviceRequests?: Record<string, boolean>;
  statementRequest?: Record<string, unknown>;

  /* rtgs */
  paymentType?: string;
  refNum?: string;
  accountNo?: string | number;
  applicantName?: string;
  beneficiaryAccountNo?: string | number;
  beneficiaryBank?: string;
  beneficiaryName?: string;
  branchName?: string;
  //   amount?: string | number;
  remittanceInfo?: string;
  claim?: boolean;
  contract?: boolean;
  invoice?: boolean;
  otherDoc?: boolean;

  [k: string]: unknown;
};

export type PdfRow = { data: string; label: string };

/* ---------- helpers ---------- */
const padRows = (r: PdfRow[], min = 6): PdfRow[] => {
  while (r.length < min) r.push({ data: "N/A", label: "N/A" });
  return r;
};

const dateOnly = (iso?: string): string => (iso ? iso.split("T")[0] : "N/A");

const trueFlagsToStr = (obj: Record<string, boolean>): string =>
  Object.entries(obj)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join(", ");

/* ------------------------------------------------------------------
     Main mapping function
  ------------------------------------------------------------------- */
export const mapRequestToRows = (req: RequestData, minRows = 6): PdfRow[] => {
  const rows: PdfRow[] = [];

  /* ===== Letter of Guarantee / Credit-Facility ===== */
  if (req.type === "letterOfGuarantee" || req.type === "creditFacility") {
    rows.push({
      data: String(req.accountNumber ?? req.accountNum ?? "N/A"),
      label: "رقم الحساب",
    });
    rows.push({
      data: req.amount !== undefined ? req.amount.toString() : "N/A",
      label: "المبلغ",
    });
    rows.push({ data: req.referenceNumber ?? "N/A", label: "رقم المرجع" });
    rows.push({ data: req.purpose ?? "N/A", label: "الغرض" });
    rows.push({ data: req.reason ?? "N/A", label: "السبب" });
    rows.push({ data: req.additionalInfo ?? "N/A", label: "معلومات إضافية" });
    rows.push({ data: dateOnly(req.date), label: "التاريخ" });
    return padRows(rows, minRows);
  }

  /* ===== Visa ===== */
  if (
    req.type === "visa" ||
    req.foreignAmount !== undefined ||
    req.localAmount !== undefined
  ) {
    rows.push({
      data: String(req.accountNumber ?? req.accountNum ?? "N/A"),
      label: "رقم الحساب",
    });
    rows.push({
      data: req.accountHolderName ?? "N/A",
      label: "اسم صاحب الحساب",
    });
    rows.push({ data: req.branch ?? "N/A", label: "الفرع" });
    rows.push({
      data: req.cardMovementApproval ?? "N/A",
      label: "موافقة حركة البطاقة",
    });
    rows.push({
      data: req.cardUsingAcknowledgment ?? "N/A",
      label: "إقرار استخدام البطاقة",
    });
    rows.push({ data: req.cbl ?? "N/A", label: "CBL" });
    rows.push({
      data:
        req.foreignAmount !== undefined ? req.foreignAmount.toString() : "N/A",
      label: "المبلغ الأجنبي",
    });
    rows.push({
      data: req.localAmount !== undefined ? req.localAmount.toString() : "N/A",
      label: "المبلغ المحلي",
    });
    rows.push({
      data: req.phoneNumberLinkedToNationalId ?? "N/A",
      label: "هاتف مرتبط بالهوية",
    });
    rows.push({ data: req.pldedge ?? "N/A", label: "التعهد" });
    rows.push({ data: req.reason ?? "N/A", label: "السبب" });
    rows.push({ data: dateOnly(req.date), label: "التاريخ" });
    return padRows(rows, minRows);
  }

  /* ===== Certified Bank-Statement ===== */
  if (
    req.type === "certifiedBankStatement" ||
    req.newAccountNumber !== undefined ||
    req.oldAccountNumber !== undefined ||
    req.serviceRequests !== undefined ||
    req.statementRequest !== undefined
  ) {
    rows.push({
      data: String(req.accountNumber ?? "N/A"),
      label: "رقم الحساب",
    });
    rows.push({
      data: req.accountHolderName ?? "N/A",
      label: "اسم صاحب الحساب",
    });
    rows.push({
      data: String(req.newAccountNumber ?? "N/A"),
      label: "رقم الحساب الجديد",
    });
    rows.push({
      data: String(req.oldAccountNumber ?? "N/A"),
      label: "رقم الحساب القديم",
    });

    const services = trueFlagsToStr(req.serviceRequests ?? {});
    if (services) rows.push({ data: services, label: "طلبات الخدمة" });

    const statements = trueFlagsToStr(
      (req.statementRequest ?? {}) as Record<string, boolean>
    );
    if (statements) rows.push({ data: statements, label: "طلبات كشف الحساب" });

    return rows; // no date, no padding
  }

  /* ===== RTGS ===== */
  if (req.type === "rtgs" || req.paymentType === "rtgs") {
    rows.push({ data: String(req.accountNo ?? "N/A"), label: "رقم الحساب" });
    rows.push({ data: req.applicantName ?? "N/A", label: "اسم مقدم الطلب" });
    rows.push({ data: req.branchName ?? "N/A", label: "الفرع" });
    rows.push({ data: req.beneficiaryName ?? "N/A", label: "اسم المستفيد" });
    rows.push({
      data: String(req.beneficiaryAccountNo ?? "N/A"),
      label: "حساب المستفيد",
    });
    rows.push({ data: req.beneficiaryBank ?? "N/A", label: "بنك المستفيد" });
    rows.push({ data: String(req.amount ?? "N/A"), label: "المبلغ" });
    rows.push({ data: req.address ?? "N/A", label: "العنوان" });
    rows.push({ data: req.paymentType ?? "N/A", label: "نوع الدفع" });
    rows.push({ data: dateOnly(req.refNum), label: "المرجع" });
    rows.push({ data: req.remittanceInfo ?? "N/A", label: "معلومات الحوالة" });

    const docs = trueFlagsToStr({
      claim: !!req.claim,
      contract: !!req.contract,
      invoice: !!req.invoice,
      otherDoc: !!req.otherDoc,
    });
    if (docs) rows.push({ data: docs, label: "المستندات" });

    return rows; // exact rows, no padding
  }

  /* ===== Check-Book ===== */
  if (req.bookContaining !== undefined) {
    rows.push({
      data: String(req.accountNumber ?? req.accountNum ?? "N/A"),
      label: "رقم الحساب",
    });
    rows.push({
      data: req.fullName ?? req.customerName ?? req.accountHolderName ?? "N/A",
      label: "اسم العميل",
    });
    rows.push({ data: req.branch ?? "N/A", label: "الفرع" });
    const repName =
      req.representative?.name ??
      req.representativeName ??
      (req.representativeId ? `ID: ${String(req.representativeId)}` : "");
    rows.push({ data: repName || "N/A", label: "المندوب" });
    rows.push({ data: req.address ?? "N/A", label: "العنوان" });
    rows.push({ data: req.bookContaining ?? "N/A", label: "عدد الصفحات" });
    rows.push({ data: dateOnly(req.date), label: "التاريخ" });
    return padRows(rows, minRows);
  }

  /* ===== Default – Certified Check / Card ===== */
  rows.push({
    data: String(req.accountNumber ?? req.accountNum ?? "N/A"),
    label: "رقم الحساب",
  });
  rows.push({ data: req.customerName ?? "N/A", label: "اسم العميل" });
  rows.push({ data: req.branch ?? "N/A", label: "الفرع" });
  const rep =
    req.representative?.name ??
    req.representativeName ??
    (req.representativeId ? `ID: ${String(req.representativeId)}` : "");
  rows.push({ data: rep || "N/A", label: "المندوب" });
  rows.push({ data: req.cardNum ?? req.carNum ?? "N/A", label: "رقم البطاقة" });
  rows.push({ data: req.beneficiary ?? "N/A", label: "المستفيد" });
  rows.push({ data: dateOnly(req.date), label: "التاريخ" });

  return padRows(rows, minRows);
};
