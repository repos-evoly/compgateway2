"use client";
import React, { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import Form from "@/app/components/FormUI/Form";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import * as Yup from "yup";
import { FaArrowRight } from "react-icons/fa";
import { useFormikContext } from "formik";
import ConfirmationDialog from "@/app/components/reusable/ConfirmationDialog";

// Define the type for form values
type StatementFormValues = {
  accountNumber: string;
  fromDate: string;
  toDate: string;
};

type TableRow = {
  date: string;
  description: string;
  transactionNumber: string;
  debit: number;
  credit: number;
  balance: number;
};

const Page = () => {
  const locale = useLocale();
  const t = useTranslations("statementOfAccount");
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const handleDialogClose = (confirmed: boolean) => {
    setIsDialogOpen(false);
    if (confirmed) {
      console.log(
        locale === "ar"
          ? "هذا الزر مسؤول عن توليد ملف pdf وسيتم برمجته لاحقًا"
          : "This button is responsible for generating a PDF and will be implemented later."
      );
    }
  };
  const withCurrencyColumns =
    locale === "ar"
      ? [
          { key: "date", label: "التاريخ" },
          { key: "description", label: "الشرح" },
          { key: "transactionNumber", label: "رقم العملية" },
          { key: "credit", label: "دائن" },
          { key: "debit", label: "مدين" },
          { key: "balance", label: "الرصيد" },
        ]
      : [
          { key: "date", label: "Date" },
          { key: "description", label: "Description" },
          { key: "transactionNumber", label: "Transaction Number" },
          { key: "credit", label: "Credit" },
          { key: "debit", label: "Debit" },
          { key: "balance", label: "Balance" },
        ];

  const handleFormSubmit = (values: StatementFormValues) => {
    console.log("Form Submitted:", values);

    // Simulate fetching data based on form inputs
    const fetchedData: TableRow[] = [
      {
        date: "2024-12-01",
        description: "شرح 1",
        transactionNumber: "T001",
        credit: 1000,
        debit: 0,
        balance: 2000,
      },
      {
        date: "2024-12-02",
        description: "شرح 2",
        transactionNumber: "T002",
        credit: 500,
        debit: 0,
        balance: 2500,
      },
      {
        date: "2024-12-03",
        description: "شرح 3",
        transactionNumber: "T003",
        credit: 0,
        debit: 100,
        balance: 2400,
      },
    ];

    setTableData(fetchedData);
  };

  // Component to display account name beside input
  const AccountNameDisplay = () => {
    const { values } = useFormikContext<StatementFormValues>();
    const [accountName, setAccountName] = useState("");

    React.useEffect(() => {
      if (values.accountNumber === "0015978000001") {
        setAccountName(locale === "ar" ? "عصمت العياش" : "Ismat Alayash");
      } else {
        setAccountName("");
      }
    }, [values.accountNumber]); // Removed 'locale' from the dependency array

    return accountName ? (
      <div className="text-white text-sm font-semibold whitespace-nowrap mb-3">
        {accountName}
      </div>
    ) : null;
  };

  const initialValues: StatementFormValues = {
    accountNumber: "",
    fromDate: "",
    toDate: "",
  };

  const validationSchema = Yup.object({
    accountNumber: Yup.string().required(t("account") + " is required"),
    fromDate: Yup.string().required(t("from") + " is required"),
    toDate: Yup.string().required(t("to") + " is required"),
  });

  return (
    <div className=" flex flex-col items-center space-y-12">
      <div className="bg-white rounded-md w-full space-y-6">
        <CrudDataGrid
          data={tableData}
          columns={withCurrencyColumns}
          showSearchBar={false}
          showAddButton={false}
          haveChildrens={true}
          childrens={
            <Form
              initialValues={initialValues}
              onSubmit={handleFormSubmit}
              validationSchema={validationSchema}
            >
              <div className="flex items-center gap-2 w-full">
                <div className=" w-1/4">
                  <FormInputIcon
                    name="accountNumber"
                    label={t("account")}
                    type="text"
                    // titlePosition="side"
                    textColor=" text-white"
                  />
                </div>
                <AccountNameDisplay />

                <div className="w-1/4">
                  <DatePickerValue
                    name="fromDate"
                    label={t("from")}
                    // titlePosition="side"
                    textColor=" text-white"
                  />
                </div>

                <div className="w-1/5">
                  <DatePickerValue
                    name="toDate"
                    label={t("to")}
                    // titlePosition="side"
                    textColor=" text-white"
                  />
                </div>

                <div className="m-auto mb-4">
                  <SubmitButton
                    title={t("continue")}
                    Icon={FaArrowRight}
                    color="info-dark"
                    fullWidth={false}
                  />
                </div>
              </div>
            </Form>
          }
        />

        <ConfirmationDialog
          openDialog={isDialogOpen}
          message={
            locale === "ar"
              ? "هذا الزر مسؤول عن توليد ملف pdf وسيتم برمجته لاحقًا"
              : "This button is responsible for generating a PDF and will be implemented later."
          }
          onClose={handleDialogClose}
        />

        {tableData.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={() => setIsDialogOpen(true)}
              className="bg-info-dark hover:bg-warning-light text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-300"
            >
              {locale === "ar" ? "طباعة PDF" : "Print PDF"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
