"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import * as Yup from "yup";
import { useTranslations } from "next-intl";
import { FaTrash } from "react-icons/fa";
import { useFormikContext } from "formik";

import { getCurrencies } from "@/app/[locale]/currencies/services";
import { createTransfer } from "../services";
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

/**
 * A small helper that ensures 'from' and 'to' have matching last 3 digits
 * (matching currency codes).
 */
const FormValidator = () => {
  const { values, setFieldError, validateForm } =
    useFormikContext<InternalFormValues>();
  // const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    const validateCurrencyCodes = () => {
      const { from, to } = values;
      if (!from || !to) {
        // setIsValid(true);
        return;
      }
      // Compare last 3 digits
      const fromCurrency = from.slice(-3);
      const toCurrency = to.slice(-3);

      if (fromCurrency !== toCurrency) {
        setFieldError("from", "Currency codes must match");
        setFieldError("to", "Currency codes must match");
        // setIsValid(false);
      } else {
        // Clear errors if they match
        validateForm();
        // setIsValid(true);
      }
    };

    validateCurrencyCodes();
  }, [values.from, values.to, setFieldError, validateForm, values]);

  return null;
};

type InternalFormExtendedProps = InternalFormProps & {
  /** Called by the form after a successful creation so the parent can refetch. */
  onSuccess?: () => void;
};

const InternalForm = ({
  initialData,
  onSuccess,
}: InternalFormExtendedProps) => {
  const t = useTranslations("internalTransferForm");

  // If new => fields enabled
  const isNewRecord = !initialData || Object.keys(initialData).length === 0;
  const [fieldsDisabled, setFieldsDisabled] = useState(!isNewRecord);

  // Confirmation Modal
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

  // Called by "Continue" => fill modalData => show modal
  const handleModalData = (formikData: InternalFormValues) => {
    let fromName: string | undefined;
    let toName: string | undefined;
    let fromBalance: string | undefined;

    // Example: if certain account === "test"
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
   * Called from the modal "Confirm" => fetch currency => create transfer => if success => onSuccess
   */
  const handleModalConfirm = async () => {
    if (!modalData?.formikData) {
      setIsModalOpen(false);
      return;
    }

    const { from, to, value, description } = modalData.formikData;
    const currencyCode = from.slice(-3);
    console.log("Fetching currency for code =>", currencyCode);

    try {
      // get currency ID from getCurrencies
      const response = await getCurrencies(1, 1, currencyCode, "code");
      console.log("Received currency response =>", response);

      const found = response.data[0];
      const currencyId = found?.id || 0;
      console.log("Using currencyId =>", currencyId);

      // final payload for /transfers
      const finalPayload = {
        transactionCategoryId: 1,
        fromAccount: from,
        toAccount: to,
        amount: value,
        currencyId,
        description,
      };
      console.log("Creating transfer with payload =>", finalPayload);

      // call createTransfer function
      const createdTransfer = await createTransfer(finalPayload);
      console.log("Created Transfer =>", createdTransfer);

      // If successful => call parent's onSuccess() to re-fetch & hide form
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating transfer =>", error);
      // Optionally show an error message or modal
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
        onSubmit={() => {}}
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
