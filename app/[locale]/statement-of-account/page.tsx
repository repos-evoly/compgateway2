"use client";

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Formik, Form as FormikForm, FormikProps } from "formik";
import * as Yup from "yup";
import { useLocale, useTranslations } from "next-intl";
import { FaSearch, FaDownload } from "react-icons/fa";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import InputSelectCombo, {
  InputSelectComboOption,
} from "@/app/components/FormUI/InputSelectCombo";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";
import SubmitButton from "@/app/components/FormUI/SubmitButton";

import { getStatement, StatementLine } from "./services";
import PdfDownloadButton from "./PdfDownloadButton";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
type FilterValues = {
  account: string;
  fromDate: string;
  toDate: string;
};

const defaultFilter: FilterValues = {
  account: "",
  fromDate: "",
  toDate: "",
};

/** Safely convert string | number | undefined to `number` */
const toNumber = (
  val: number | string | null | undefined
): number | undefined => {
  if (val === null || val === undefined) return undefined;
  if (typeof val === "number") return val;
  const parsed = parseFloat(val);
  return Number.isNaN(parsed) ? undefined : parsed;
};

/** Format numbers with 2-decimal precision + thousand-separators */
const fmt = (n: number | undefined): string =>
  n !== undefined
    ? n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    : "";

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */
const Page: React.FC = () => {
  const t = useTranslations("statementOfAccount");
  const locale = useLocale();

  /* ---------------- State ---------------- */
  const [lines, setLines] = useState<StatementLine[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [accountOptions, setAccountOptions] = useState<InputSelectComboOption[]>([]);

  /* ---------------- Load accounts ---------------- */
  useEffect(() => {
    const raw = Cookies.get("statementAccounts") || "[]";
    let list: string[] = [];
    try {
      list = JSON.parse(raw);
    } catch {
      try {
        list = JSON.parse(decodeURIComponent(raw));
      } catch {
        list = [];
      }
    }
    setAccountOptions(list.map((acct) => ({ label: acct, value: acct })));
  }, []);

  /* ---------------- Validation ---------------- */
  const validationSchema = Yup.object({
    account: Yup.string().required(t("required")),
    fromDate: Yup.string().required(t("required")),
    toDate: Yup.string().required(t("required")),
  });

  /* ---------------- Fetch data ---------------- */
  const handleFilter = async (values: FilterValues) => {
    setIsFetching(true);
    try {
      const data = await getStatement(values);
      // Add balance and reference fields required for PDF
      const processedData = data.map((line, index) => {
        const fallbackBalance = calculateBalance(data, index);
        const balanceValue =
          line.balance !== undefined && line.balance !== null
            ? Number(line.balance)
            : fallbackBalance;

        return {
          ...line,
          balance: balanceValue,
          reference: line.nr1 || "",
        };
      });
      setLines(processedData);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  // Helper function to calculate running balance
  const calculateBalance = (data: StatementLine[], currentIndex: number): number => {
    return data
      .slice(0, currentIndex + 1)
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);
  };

  /* ---------------- Excel export ---------------- */
  const handleDownloadExcel = async () => {
    if (!lines.length) return;

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("StatementData");

    ws.mergeCells("A1:E1");
    ws.getCell("A1").value = t("statementOfAccount");
    ws.getCell("A1").font = { size: 18, bold: true };
    ws.getCell("A1").alignment = { horizontal: "center" };

    ws.mergeCells("A2:E2");
    ws.getCell("A2").value = `Exported on: ${new Date().toLocaleDateString()}`;
    ws.getCell("A2").font = { italic: true, size: 12 };
    ws.getCell("A2").alignment = { horizontal: "center" };

    ws.addRow([]);

    const headers = [
      t("postingDate"),
      t("narrative"),
      t("debit"),
      t("credit"),
      t("balance"),
    ];
    const hdrRow = ws.addRow(headers);
    headers.forEach((_, i) => {
      const c = hdrRow.getCell(i + 1);
      c.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
      c.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF145A32" },
      };
      c.alignment = { horizontal: "center" };
    });

    lines.forEach((ln, idx) => {
      const narrative = [ln.nr1, ln.nr2, ln.nr3]
        .filter((n) => n && n.trim() !== "")
        .join(" ");
      const debit = ln.amount < 0 ? ln.amount : toNumber(ln.debit) ?? "";

      const credit = ln.amount > 0 ? ln.amount : toNumber(ln.credit) ?? "";
      const dateOnly = ln.postingDate.split("T")[0];
      const balanceValue =
        ln.balance !== undefined && ln.balance !== null
          ? Number(ln.balance)
          : calculateBalance(lines, idx);
      ws.addRow([dateOnly, narrative || "-", debit, credit, balanceValue]);
    });

    ws.addRow([]);
    const foot = ws.addRow(["Thank you for your business!"]);
    ws.mergeCells(`A${foot.number}:E${foot.number}`);
    foot.getCell(1).font = { italic: true, color: { argb: "FF305496" } };
    foot.getCell(1).alignment = { horizontal: "center" };

    ws.columns = [
      { width: 16 },
      { width: 40 },
      { width: 14 },
      { width: 14 },
      { width: 18 },
    ];

    const buf = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buf]), "Statement.xlsx");
  };

  /* ---------------- Grid columns ---------------- */
  const columns = [
    { key: "postingDate", label: t("postingDate") },
    {
      key: "narrative",
      label: t("narrative"),
      renderCell: (row: StatementLine) => {
        const narrative = [row.nr1, row.nr2, row.nr3]
          .filter((n): n is string => typeof n === 'string' && n.trim() !== "")
          .join(" ");
        return narrative || "-";
      },
    },
    {
      key: "debit",
      label: t("debit"),
      renderCell: (row: StatementLine) => {
        const val = row.amount < 0 ? row.amount : toNumber(row.debit);
        return fmt(val);
      },
    },
    {
      key: "credit",
      label: t("credit"),
      renderCell: (row: StatementLine) => {
        const val = row.amount > 0 ? row.amount : toNumber(row.credit);
        return fmt(val);
      },
    },
    {
      key: "balance",
      label: t("balance"),
      renderCell: (row: StatementLine) => fmt(toNumber(row.balance)),
    },
    { key: "trxCode", label: t("trxCode") },

  ] as Array<{
    key: string;
    label: string;
    renderCell?: (row: StatementLine) => React.ReactNode;
  }>;

  /* ---------------- Pagination ---------------- */
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(lines.length / pageSize));
  const pagedData = lines.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  ).map(line => ({
    ...line,
    [Symbol.toPrimitive]: function () { return JSON.stringify(this); }
  }));

  /* ---------------- Render ---------------- */
  return (
    <div className="p-1 overflow-visible">
      <CrudDataGrid
        data={pagedData}
        columns={columns}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        showSearchBar={false}
        haveChildrens
        childrens={
          <div className="w-full">
            <Formik
              initialValues={defaultFilter}
              validationSchema={validationSchema}
              onSubmit={handleFilter}
              validateOnMount
              validateOnChange
              validateOnBlur
            >
              {({ isValid, dirty, values }: FormikProps<FilterValues>) => {
                const isTodaySelected = () => {
                  if (!values.toDate) return false;
                  const today = new Date();
                  const sel = new Date(values.toDate);
                  today.setHours(0, 0, 0, 0);
                  sel.setHours(0, 0, 0, 0);
                  return sel.getTime() === today.getTime();
                };
                const todaySelected = isTodaySelected();
                const printDisabled = !lines.length || todaySelected;
                const downloadNote = t("toDateTodayPrintNote");
                const isRtl = locale === "ar";

                return (
                  <FormikForm className="flex flex-wrap w-full px-1 py-1">
                    <div className="flex flex-wrap items-center w-full gap-2">
                      <div className="flex-grow min-w-[200px] max-w-xs">
                        <InputSelectCombo
                          name="account"
                          label={t("account")}
                          options={accountOptions}
                          placeholder={t("selectAccount")}
                          width="w-full"
                          titleColor="text-white"
                        />
                      </div>

                      <div className="flex-grow min-w-[140px] max-w-xs">
                        <DatePickerValue
                          name="fromDate"
                          label={t("fromDate")}
                          width="w-full"
                          titlePosition="top"
                          textColor="text-white"
                        />
                      </div>

                      <div className="flex-grow min-w-[140px] max-w-xs">
                        <DatePickerValue
                          name="toDate"
                          label={t("toDate")}
                          width="w-full"
                          titlePosition="top"
                          textColor="text-white"
                        />
                      </div>

                      <div className="flex items-end self-end mb-4 gap-2">
                        <SubmitButton
                          title=""
                          Icon={isFetching ? undefined : FaSearch}
                          disabled={!isValid || !dirty || isFetching}
                          isSubmitting={isFetching}
                        />
                        <div
                          className={`relative inline-flex ${printDisabled ? "group" : ""
                            } ${isRtl ? "rtl" : "ltr"}`}
                          aria-disabled={printDisabled}
                        >
                          <button
                            type="button"
                            onClick={handleDownloadExcel}
                            disabled={printDisabled}
                            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition duration-300 ${printDisabled
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed border border-white"
                                : "border border-white bg-info-dark text-white hover:bg-warning-light hover:text-info-dark"
                              }`}
                            title={!printDisabled ? downloadNote : undefined}
                          >
                            <FaDownload className="h-5 w-5" />
                          </button>
                          {printDisabled && (
                            <>
                              <span
                                className="absolute inset-0"
                                style={{ pointerEvents: "auto" }}
                              />
                              <div
                                className={`pointer-events-none absolute top-full mt-1 w-[180px] whitespace-normal break-words rounded border border-gray-300 bg-white px-2 py-0.5 text-[10px] leading-tight text-gray-800 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-75 ${isRtl
                                    ? "left-0 text-right"
                                    : "left-1/2 -translate-x-1/2"
                                  }`}
                                role="tooltip"
                              >
                                {t("toDateTodayPrintNote")}
                              </div>
                            </>
                          )}
                        </div>
                        <PdfDownloadButton
                          lines={lines}
                          disabled={printDisabled}
                          values={values}
                          title={downloadNote}
                        />
                      </div>
                      <div className="w-full text-xs font-semibold text-warning-light">
                        {downloadNote}
                      </div>
                    </div>
                  </FormikForm>
                );
              }}
            </Formik>
          </div>
        }
      />
    </div>
  );
};

export default Page;
