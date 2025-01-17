// InternalForm.tsx

import React, { useState } from "react";
import * as Yup from "yup";
import Form from "@/app/components/FormUI/Form";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import CheckboxWrapper from "@/app/components/FormUI/CheckboxWrapper";
import ResetButton from "@/app/components/FormUI/ResetButton";
import SelectWrapper from "@/app/components/FormUI/Select";
import { formFields } from "./internalFormFields";
import { FaTrash } from "react-icons/fa";
import { useTranslations } from "next-intl";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";
import {
  InternalFormValues,
  InternalFormProps,
  RecurringDateDisplayProps,
  AdditionalData,
} from "@/types";
import RadiobuttonWrapper from "@/app/components/FormUI/Radio";
import ConfirmationModal from "@/app/components/reusable/ConfirmationModal";
import ContinueButton from "./ContinueButton"; // Adjust path as necessary
import { useFormikContext } from "formik";
import SpecialFieldsDisplay from "./SpecialFieldsDisplay"; // Adjust path as necessary

interface ModalDataType {
  formikData?: InternalFormValues; // Ensure this is optional since initial state may not have it
  additionalData?: AdditionalData; // Ensure this is optional for the same reason
}

const RecurringDateDisplay = ({
  t,
  isEditing,
  ends,
}: RecurringDateDisplayProps) => {
  const { values } = useFormikContext<InternalFormValues>();
  console.log("is it editing: ", isEditing);

  if (isEditing) {
    return values.recurring ? (
      <span className="text-sm mb-4 mx-4 text-gray-700">
        {t("ends")}: {ends || ""}
      </span>
    ) : null;
  } else {
    return values.recurring ? (
      <div className="w-1/3">
        <DatePickerValue name="date" label={t("ends")} titlePosition="side" />
      </div>
    ) : null;
  }
};

const InternalForm = ({ initialData, onSubmit }: InternalFormProps) => {
  const isEditing = !initialData;
  const defaultValues: InternalFormValues = {
    from: "",
    to: "",
    value: 0,
    commision: 0,
    description: "",
    selectField: "",
    recurring: false,
    date: "",
    receiverOrSender: "sender",
  };

  const [modalData, setModalData] = useState<ModalDataType>({
    additionalData: { fromName: "", toName: "", fromBalance: "" }, // Default empty strings or appropriate defaults
  });

  // Define the handleModalData function here
  const handleModalData = (formikData: InternalFormValues) => {
    // Compute additional data based on formikData conditions
    const additionalData: AdditionalData = {
      fromName: formikData.from === "test" ? "عصمت العياش" : undefined,
      toName: formikData.to === "test" ? "نادر خداج" : undefined,
      fromBalance: formikData.from === "test" ? "1000" : undefined,
    };

    // Always include additional data, default to undefined if conditions aren't met
    setModalData({ formikData, additionalData });
    setIsModalOpen(true);
  };

  const transformedData = initialData
    ? {
        ...initialData,
        recurring: initialData.recurring,
        date: initialData.date,
      }
    : {};

  const [isModalOpen, setIsModalOpen] = useState(false);
  const initialValues = { ...defaultValues, ...transformedData };

  const validationSchema = Yup.object({
    from: Yup.string().required("From account is required"),
    to: Yup.string().required("To account is required"),
    value: Yup.number()
      .typeError("Value must be a number")
      .required("Value is required")
      .positive("Value must be greater than 0"),
    commision: Yup.number()
      .typeError("Value must be a number")
      .required("Value is required")
      .positive("Value must be greater than 0"),
    description: Yup.string().required("Description is required"),
    selectField: Yup.string().required("Please select an option"),
    recurring: Yup.boolean().default(false),
    receiverOrSender: Yup.string()
      .oneOf(["sender", "receiver"])
      .required("Please select Sender or Receiver"),
    date: Yup.string().nullable().notRequired(),
  });

  const t = useTranslations("internalTransferForm");

  const selectOptions = [
    { value: "onhold", label: t("onhold") },
    { value: "inactive", label: t("inactive") },
  ];

  const metadata = {
    ...formFields.reduce(
      (acc, field) => ({
        ...acc,
        [field.name]: {
          label: t(field.name),
          type: field.type,
          options: field.options,
        },
      }),
      {}
    ),
    // recurring: { label: t("rec"), type: "checkbox" },
    // date: { label: t("ends"), type: "date" },
    // selectField: { label: t("status"), type: "select", options: selectOptions },
    fromName: { label: "from account name", type: "text" },
    fromBalance: { label: t("balance"), type: "text" },
    toName: { label: "to account name" },
  };

  return (
    <div className="p-6 bg-gray-100">
      <Form
        initialValues={initialValues}
        onSubmit={onSubmit}
        validationSchema={validationSchema}
        enableReinitialize
      >
        <div className="grid grid-cols-1 gap-y-6">
          {formFields.map((field) => (
            <div key={field.name}>
              {field.name === "receiverOrSender" && field.options ? (
                <RadiobuttonWrapper
                  name={field.name}
                  label={t(field.label)}
                  options={field.options}
                  flexDir={["row", "row"]}
                  t={t}
                />
              ) : ["from", "to"].includes(field.name) ? (
                <SpecialFieldsDisplay
                  field={field}
                  displayType="account"
                  t={t}
                />
              ) : field.name === "commision" ? (
                <SpecialFieldsDisplay
                  field={field}
                  displayType="commission"
                  t={t}
                />
              ) : field.type === "checkbox" ? (
                <CheckboxWrapper name="recurring" label={t(field.name)} />
              ) : field.type === "date" ? (
                <DatePickerValue name={field.name} label={t(field.name)} />
              ) : (
                <div className={`${field.width || "w-full"}`}>
                  <FormInputIcon
                    name={field.name}
                    label={t(field.name)}
                    startIcon={field.startIcon}
                    type={field.type}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 mt-4">
          <div>
            <CheckboxWrapper name="recurring" label={t("rec")} />
          </div>
          <RecurringDateDisplay
            t={t}
            isEditing={isEditing}
            ends={initialData?.date}
          />
        </div>

        <div className="w-1/3 mt-4">
          <SelectWrapper
            name="selectField"
            label={t("status")}
            options={selectOptions}
          />
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <ContinueButton
            onClick={handleModalData}
            touchedFields={{
              from: true,
              to: true,
              value: true,
              commision: true,
              description: true,
              selectField: true,
              recurring: true,
              date: true,
              receiverOrSender: true,
            }}
          />

          <ResetButton
            title={t("delete")}
            Icon={FaTrash}
            color="warning-light"
            fullWidth={false}
          />
        </div>

        {isModalOpen && (
          <ConfirmationModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            metadata={metadata}
            additionalData={modalData.additionalData} // Make sure this matches state structure
            excludedFields={["recurring", "date", "selectField"]} // Fields to exclude
          />
        )}
      </Form>
    </div>
  );
};

export default InternalForm;
