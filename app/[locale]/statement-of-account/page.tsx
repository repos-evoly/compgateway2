"use client";

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Formik, Form as FormikForm, FormikProps } from "formik";
import * as Yup from "yup";
import { useTranslations } from "next-intl";

import { FaSearch, FaDownload } from "react-icons/fa";
import * as XLSX from "xlsx";

import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import InputSelectCombo, {
  InputSelectComboOption,
} from "@/app/components/FormUI/InputSelectCombo";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";
import SubmitButton from "@/app/components/FormUI/SubmitButton";

import { getStatement, StatementLine } from "./services";

// --------------------
// Types
// --------------------
type FilterValues = {
  account: string; // stores the accountNumber
  fromDate: string;
  toDate: string;
};

const defaultFilter: FilterValues = {
  account: "",
  fromDate: "",
  toDate: "",
};

const Page: React.FC = () => {
  const t = useTranslations("statementOfAccount");
  const [lines, setLines] = useState<StatementLine[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFetching, setIsFetching] = useState(false);

  // Load accounts from cookie
  const [accountOptions, setAccountOptions] = useState<
    InputSelectComboOption[]
  >([]);
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

  // Form validation
  const validationSchema = Yup.object({
    account: Yup.string().required(t("required")),
    fromDate: Yup.string().required(t("required")),
    toDate: Yup.string().required(t("required")),
  });

  // Fetch statement lines
  const handleFilter = async (values: FilterValues) => {
    setIsFetching(true);
    try {
      const data = await getStatement(values);
      setLines(data);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error fetching statement data:", err);
    } finally {
      setIsFetching(false);
    }
  };

  // Excel download
  const handleDownloadExcel = () => {
    if (!lines.length) return;
    const headerRow = [
      t("postingDate"),
      t("amount"),
      t("debit"),
      t("credit"),
      t("narrative"),
    ];
    const dataRows = lines.map((line) => {
      const narratives = [line.nr1, line.nr2, line.nr3].filter(n => n && n.trim() !== '').join(' ');
      const isDebit = line.drCr === 'DR';
      const isCredit = line.drCr === 'CR';
      return [
        line.postingDate,
        line.amount,
        isDebit ? line.amount : '',
        isCredit ? line.amount : '',
        narratives || '-',
      ];
    });
    const ws = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "StatementData");
    XLSX.writeFile(wb, "Statement.xlsx");
  };

  // Grid columns & pagination
  const columns = [
    { key: "postingDate", label: t("postingDate") },
    { key: "amount", label: t("amount") },
    { 
      key: "debit", 
      label: t("debit"),
      renderCell: (row: StatementLine) => {
        return row.drCr === 'DR' ? row.amount : '';
      }
    },
    { 
      key: "credit", 
      label: t("credit"),
      renderCell: (row: StatementLine) => {
        return row.drCr === 'CR' ? row.amount : '';
      }
    },
    { 
      key: "narrative", 
      label: t("narrative"),
      renderCell: (row: StatementLine) => {
        const narratives = [row.nr1, row.nr2, row.nr3].filter(n => n && n.trim() !== '').join(' ');
        return narratives || '-';
      }
    },
  ];
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(lines.length / pageSize));
  const pagedData = lines.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
                // Check if today's date is selected for export functionality
                const isTodaySelected = () => {
                  if (!values.toDate) return false;
                  const today = new Date();
                  const selectedDate = new Date(values.toDate);
                  today.setHours(0, 0, 0, 0);
                  selectedDate.setHours(0, 0, 0, 0);
                  return selectedDate.getTime() === today.getTime();
                };

                const isFormValid = isValid;
                
                return (
                <FormikForm className="flex flex-wrap w-full px-1 py-1">
                  <div className="flex flex-wrap items-center w-full gap-2">
                    {/* Account selector from cookie */}
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

                    {/* From Date */}
                    <div className="flex-grow min-w-[140px] max-w-xs">
                      <DatePickerValue
                        name="fromDate"
                        label={t("fromDate")}
                        width="w-full"
                        titlePosition="top"
                        textColor="text-white"
                      />
                    </div>

                    {/* To Date */}
                    <div className="flex-grow min-w-[140px] max-w-xs">
                      <DatePickerValue
                        name="toDate"
                        label={t("toDate")}
                        width="w-full"
                        titlePosition="top"
                        textColor="text-white"
                      />
                    </div>

                    {/* Buttons */}
                    <div className="flex items-end self-end mb-4 gap-2">
                      <SubmitButton
                        title=""
                        Icon={isFetching ? undefined : FaSearch}
                        disabled={!isFormValid || !dirty || isFetching}
                        isSubmitting={isFetching}
                      />
                      <button
                        type="button"
                        onClick={handleDownloadExcel}
                        disabled={!lines.length || isTodaySelected()}
                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition duration-300
                          ${
                            !lines.length || isTodaySelected()
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed border border-white"
                              : "border border-white bg-info-dark text-white hover:bg-warning-light hover:text-info-dark"
                          }`}
                        title={isTodaySelected() ? t("toDateCannotBeToday") : ""}
                      >
                        <FaDownload className="h-5 w-5" />
                      </button>
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
