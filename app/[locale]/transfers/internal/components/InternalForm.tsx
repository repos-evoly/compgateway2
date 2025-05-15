"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import * as Yup from "yup";
import { useTranslations } from "next-intl";
import { FaTrash } from "react-icons/fa";
import { useFormikContext } from "formik";

import { getCurrencies } from "@/app/[locale]/currencies/services"; // Adjust path
import { createTransfer } from "../services"; // <-- Our new createTransfer function
import Form from "@/app/components/FormUI/Form";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import ResetButton from "@/app/components/FormUI/ResetButton";
import ConfirmationModal from "@/app/components/reusable/ConfirmationModal";
import ContinueButton from "./ContinueButton";
import EditButton from "@/app/components/FormUI/EditButton";
import InputSelectCombo, {
  InputSelectComboOption,
} from "@/app/components/FormUI/InputSelectCombo";

import type {
  InternalFormProps,
  InternalFormValues,
  AdditionalData,
} from "../types";

/** Ensures 'from' and 'to' share last 3 digits */
const FormValidator = () => {
  const { values, setFieldError, validateForm } =
    useFormikContext<InternalFormValues>();
  const [isValid, setIsValid] = useState(true);
  console.log("FormValidator =>", isValid);

  useEffect(() => {
    const validateCurrencyCodes = () => {
      const { from, to } = values;
      if (!from || !to) {
        setIsValid(true);
        return;
      }
      // Compare last 3 digits
      const fromCurrency = from.slice(-3);
      const toCurrency = to.slice(-3);

      if (fromCurrency !== toCurrency) {
        setFieldError("from", "Currency codes must match");
        setFieldError("to", "Currency codes must match");
        setIsValid(false);
      } else {
        // Clear errors if they match
        validateForm();
        setIsValid(true);
      }
    };

    validateCurrencyCodes();
  }, [values.from, values.to, setFieldError, validateForm, values]);

  return null;
};

const InternalForm = ({ initialData, onSubmit }: InternalFormProps) => {
  const t = useTranslations("internalTransferForm");

  // If new => fields enabled
  const isNewRecord = !initialData || Object.keys(initialData).length === 0;
  const [fieldsDisabled, setFieldsDisabled] = useState(!isNewRecord);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{
    formikData?: InternalFormValues;
    additionalData?: AdditionalData;
  }>({});

  // from-accounts from cookies
  const [accountOptions, setAccountOptions] = useState<
    InputSelectComboOption[]
  >([]);

  useEffect(() => {
    const rawCookie = Cookies.get("statementAccounts") || "[]";
    let accounts: string[] = [];
    try {
      accounts = JSON.parse(rawCookie);
    } catch {
      try {
        accounts = JSON.parse(decodeURIComponent(rawCookie));
      } catch {
        accounts = [];
      }
    }

    const opts = accounts.map((acct) => ({
      label: acct,
      value: acct,
    }));
    setAccountOptions(opts);
  }, []);

  // Default + merges with any initialData
  const defaultValues: InternalFormValues = {
    from: "",
    to: "",
    value: 0,
    description: "",
  };
  const transformedData = initialData
    ? { ...defaultValues, ...initialData }
    : defaultValues;
  const initialValues: InternalFormValues = { ...transformedData };

  // Yup => check currency
  const validationSchema = Yup.object({
    from: Yup.string().required(t("requiredFromAccount")),
    to: Yup.string()
      .required(t("requiredToAccount"))
      .test(
        "currency-match",
        t("currencyMismatch") || "Currency codes must match",
        function (value) {
          const { from } = this.parent;
          if (!from || !value) return true;
          return from.slice(-3) === value.slice(-3);
        }
      ),
    value: Yup.number()
      .typeError(t("valueMustBeNumber"))
      .required(t("requiredValue"))
      .positive(t("valueMustBePositive")),
    description: Yup.string().required(t("requiredDescription")),
  });

  // Called by Continue => store data => open modal
  const handleModalData = (formikData: InternalFormValues) => {
    let fromName: string | undefined;
    let toName: string | undefined;
    let fromBalance: string | undefined;

    if (formikData.from === "test") {
      fromName = "عصمت العياش";
      fromBalance = "1000";
    }
    if (formikData.to === "test") {
      toName = "نادر خداج";
    }

    setModalData({
      formikData,
      additionalData: { fromName, toName, fromBalance },
    });
    setIsModalOpen(true);
  };

  /**
   * Called from the modal "submit" => fetch currency => call createTransfer => log
   */
  const handleModalConfirm = async () => {
    if (!modalData?.formikData) {
      setIsModalOpen(false);
      return;
    }

    const { from, to, value, description } = modalData.formikData;
    const currencyCode = from.slice(-3);

    try {
      // get currency ID
      const response = await getCurrencies(1, 1, currencyCode, "code");
      const found = response.data[0];
      const currencyId = found?.id || 0;

      // final payload for /transfers
      const finalPayload = {
        transactionCategoryId: 1,
        fromAccount: from,
        toAccount: to,
        amount: value,
        currencyId,
        description,
      };

      // call the new createTransfer function
      const createdTransfer = await createTransfer(finalPayload);
      console.log("Created Transfer =>", createdTransfer);

      // Optionally call onSubmit to keep old local logic
      onSubmit({
        ...modalData.formikData,
        transactionCategoryId: 1,
        currencyId,
      });
    } catch (error) {
      console.error("Error creating transfer =>", error);

      // fallback
      onSubmit({
        ...modalData.formikData,
        transactionCategoryId: 1,
        currencyId: null,
      });
    }

    setIsModalOpen(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="p-6">
      <Form
        initialValues={initialValues}
        onSubmit={onSubmit} // possibly not used, but let's keep it
        validationSchema={validationSchema}
        enableReinitialize
      >
        <FormValidator />

        {/* Row 1: from, to, value */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputSelectCombo
            name="from"
            label={t("from")}
            options={accountOptions}
            disabled={fieldsDisabled}
            maskingFormat="0000-000000-000"
          />

          <FormInputIcon
            name="to"
            label={t("to")}
            type="text"
            maskingFormat="0000-000000-000"
            disabled={fieldsDisabled}
          />

          <FormInputIcon
            name="value"
            label={t("value")}
            type="number"
            disabled={fieldsDisabled}
          />
        </div>

        {/* Row 2: description */}
        <div className="grid grid-cols-1 gap-4 mt-4">
          <FormInputIcon
            name="description"
            label={t("description")}
            type="text"
            disabled={fieldsDisabled}
          />
        </div>

        {/* Bottom Buttons */}
        <div className="flex justify-center gap-4 mt-6">
          {!isNewRecord && (
            <>
              <EditButton
                fieldsDisabled={fieldsDisabled}
                setFieldsDisabled={setFieldsDisabled}
              />
              <ResetButton
                title={t("delete")}
                Icon={FaTrash}
                color="warning-light"
                fullWidth={false}
              />
            </>
          )}

          <ContinueButton
            onClick={handleModalData}
            touchedFields={{
              from: true,
              to: true,
              value: true,
              description: true,
            }}
          />
        </div>

        {/* Confirmation Modal */}
        {isModalOpen && (
          <ConfirmationModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            onConfirm={handleModalConfirm}
            formData={modalData.formikData || {}}
            additionalData={modalData.additionalData}
            metadata={{}}
            excludedFields={["someField", "anotherField"]}
          />
        )}
      </Form>
    </div>
  );
};

export default InternalForm;
