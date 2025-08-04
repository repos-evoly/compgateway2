/* --------------------------------------------------------------------------
   CBLForm – copy-paste ready, no `any` usage
   -------------------------------------------------------------------------- */
"use client";

import React, {
  ElementType,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Cookies from "js-cookie";
import { FormikHelpers, useField, useFormikContext } from "formik";
import { useTranslations } from "use-intl";

import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import Form from "@/app/components/FormUI/Form";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import InputSelectCombo, {
  InputSelectComboOption,
} from "@/app/components/FormUI/InputSelectCombo";
import { DocumentUploader } from "@/app/components/reusable/DocumentUploader";
import InfoBox from "@/app/[locale]/requests/cbl/components/InfoBox";
import { FaUser } from "react-icons/fa";

import { fields, initialValues as defaultVals } from "../data";
import { CBLFormProps, TCBLValues } from "../types";
import { addCblRequest, getKycByCode, updateCblRequest } from "../service";
import BackButton from "@/app/components/reusable/BackButton";
import FormHeader from "@/app/components/reusable/FormHeader";
import { validationSchema as makeSchema } from "../data";

/* ---------- helper types ---------- */
type FieldMeta = {
  name: string;
  label: string;
  component: ElementType;
  type?: string;
  icon?: ReactNode;
};

/* ---------- dropdown component ---------- */
type AccountDropdownProps = {
  name: string;
  label: string;
  options: InputSelectComboOption[];
  placeholder: string;
  width: string;
  maskingFormat: string;
  disabled: boolean;
  onAccountChange: (
    acc: string,
    setFieldValue: (field: string, value: unknown) => void
  ) => void;
  loading: boolean;
};

const AccountNumberDropdown: React.FC<AccountDropdownProps> = ({
  onAccountChange,
  loading,
  name,
  ...rest
}) => {
  const { setFieldValue } = useFormikContext();
  const [field] = useField(name);

  useEffect(() => {
    if (field.value) {
      onAccountChange(field.value as string, setFieldValue);
    }
  }, [field.value, onAccountChange, setFieldValue]);

  return (
    <div className="relative">
      <InputSelectCombo name={name} {...rest} />
      {loading && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600" />
        </div>
      )}
    </div>
  );
};

/* ---------- main form ---------- */
const CBLForm: React.FC<CBLFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  onBack,
  readOnly = false,
}) => {
  const t = useTranslations("cblForm");

  console.log(
    "CBLForm rendered with initialValues:",
    initialValues?.attachmentUrls
  );

  /* UI state */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modal, setModal] = useState({
    open: false,
    success: false,
    title: "",
    msg: "",
  });

  /* account options from cookie */
  const [accountOptions, setAccountOptions] = useState<
    InputSelectComboOption[]
  >([]);
  useEffect(() => {
    const raw = Cookies.get("statementAccounts") ?? "[]";
    let arr: string[] = [];
    try {
      arr = JSON.parse(raw);
    } catch {
      try {
        arr = JSON.parse(decodeURIComponent(raw));
      } catch {
        arr = [];
      }
    }
    setAccountOptions(arr.map((v) => ({ label: v, value: v })));
  }, []);

  /* initial values */
  const mergedValues: TCBLValues & { files: File[]; newFiles: File[] } = {
    id: 0,
    ...defaultVals,
    ...initialValues,
    files: (initialValues as { files?: File[] })?.files ?? [],
    newFiles: (initialValues as { newFiles?: File[] })?.newFiles ?? [],
  };
  const isEdit = Boolean(initialValues?.id);

  /* KYC autofill */
  const [kycBusy, setKycBusy] = useState(false);
  const lastCodeRef = useRef<string | null>(null);
  const extractCode = (acc: string) => acc.replace(/\D/g, "").substring(4, 10);
  const handleAccChange = useCallback(
    async (acc: string, setField: (field: string, value: unknown) => void) => {
      if (!acc || acc === lastCodeRef.current) return;
      const code = extractCode(acc);
      if (!code) return;

      setKycBusy(true);
      try {
        const kyc = await getKycByCode(code);
        if (kyc.hasKyc && kyc.data) {
          lastCodeRef.current = acc;
          setField(
            "partyName",
            kyc.data.legalCompanyNameLT || kyc.data.legalCompanyName
          );
          setField("branchOrAgency", kyc.data.branchName);
          setField(
            "address",
            [kyc.data.street, kyc.data.district, kyc.data.city]
              .filter(Boolean)
              .join(", ")
          );
        }
      } finally {
        setKycBusy(false);
      }
    },
    []
  );

  /* submit */
  const handleSubmit = async (
    values: TCBLValues & { files: File[]; newFiles: File[] },
    helpers: FormikHelpers<TCBLValues & { files: File[]; newFiles: File[] }>
  ) => {
    if (readOnly || isSubmitting) return;
    setIsSubmitting(true);
    try {
      // Merge existing files with new files
      const allFiles = [...(values.files || []), ...(values.newFiles || [])];

      const submitValues = {
        ...values,
        files: allFiles,
      };

      const result: TCBLValues = isEdit
        ? await updateCblRequest(values.id, submitValues)
        : await addCblRequest(submitValues);

      setModal({
        open: true,
        success: true,
        title: t(isEdit ? "updateSuccessTitle" : "createSuccessTitle"),
        msg: t(isEdit ? "updateSuccessMessage" : "createSuccessMessage"),
      });

      /* propagate to parent */
      onSubmit?.(result, helpers as unknown as FormikHelpers<TCBLValues>);
    } catch (e) {
      setModal({
        open: true,
        success: false,
        title: t(isEdit ? "updateErrorTitle" : "createErrorTitle"),
        msg: e instanceof Error ? e.message : t("unknownError"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* field metadata */
  const formFields: FieldMeta[] = fields(t);
  const sections = [
    { title: t("generalInformation"), start: 0, end: 6, grid: 3 },
    { title: t("financialInformation"), start: 6, end: 16, grid: 4 },
  ];
  const repGroups = [
    { start: 16, end: 18, grid: 2 },
    { start: 18, end: 21, grid: 3 },
    { start: 21, end: 24, grid: 3 },
    { start: 24, end: formFields.length, grid: 2 },
  ];

  const schema = useMemo(() => makeSchema(t), [t]);

  /* render */
  return (
    <>
      <FormHeader status={initialValues?.status}>
        <div className="pb-5">
          <BackButton
            fallbackPath="/requests/cbl"
            onBack={onBack}
            isEditing={true}
          />
        </div>
      </FormHeader>

      <div className="-mt-6 bg-gray-100 px-6 py-2">
        <Form
          initialValues={mergedValues}
          onSubmit={handleSubmit}
          validationSchema={schema}
        >
          {/* sections */}
          {sections.map((sec) => (
            <Section
              key={sec.title}
              title={sec.title}
              fields={formFields.slice(sec.start, sec.end)}
              grid={sec.grid}
              accountOptions={accountOptions}
              onAccChange={handleAccChange}
              kycBusy={kycBusy}
              readOnly={readOnly}
              t={t}
            />
          ))}

          {/* representative groups */}
          <div className="mt-6">
            <h2 className="text-lg font-bold text-gray-800">
              {t("representativeInformation")}
            </h2>
            {repGroups.map((g, idx) => (
              <FieldGrid
                key={idx}
                fields={formFields.slice(g.start, g.end)}
                grid={g.grid}
                accountOptions={accountOptions}
                onAccChange={handleAccChange}
                kycBusy={kycBusy}
                readOnly={readOnly}
                t={t}
              />
            ))}
          </div>

          {/* documents + info */}
          <div className="mt-6 flex w-full gap-6">
            <div className="flex flex-1 flex-col">
              <DocumentUploader
                name="files"
                maxFiles={9}
                label={t("documents")}
                className="w-full"
                canView={true}
                canEdit={false}
                canDelete={false}
                canDownload={true}
                disabled={readOnly}
                initialPreviewUrls={initialValues?.attachmentUrls}
              />
            </div>
            <div className="flex-1">
              <InfoBox />
            </div>
          </div>

          {/* New Document Uploader Section - Only in edit mode */}
          {!readOnly && isEdit && (
            <div className="mt-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                {t("addNewDocuments")}
              </h2>
              <DocumentUploader
                name="newFiles"
                maxFiles={9}
                label={t("addNewDocuments")}
                className="w-full"
                canView={true}
                canEdit={true}
                canDelete={true}
                canDownload={true}
                disabled={false}
              />
            </div>
          )}

          {/* additional */}
          <div className="mt-6">
            <h2 className="text-lg font-bold text-gray-800">
              {t("additionalInformation")}
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <DatePickerValue
                name="packingDate"
                label={t("packingDate")}
                textColor="text-gray-700"
                disabled={readOnly}
              />
              <FormInputIcon
                name="specialistName"
                label={t("specialistName")}
                type="text"
                textColor="text-gray-700"
                startIcon={<FaUser />}
                disabled={readOnly}
              />
            </div>
          </div>

          {/* buttons */}
          {!readOnly && (
            <div className="flex gap-2 px-6 pb-6">
              <SubmitButton
                title={t(isEdit ? "update" : "submit")}
                color="info-dark"
                isSubmitting={isSubmitting}
                disabled={isSubmitting}
              />
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                >
                  {t("cancel")}
                </button>
              )}
            </div>
          )}
        </Form>
      </div>

      <ErrorOrSuccessModal
        isOpen={modal.open}
        isSuccess={modal.success}
        title={modal.title}
        message={modal.msg}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
        onConfirm={() => setModal((m) => ({ ...m, open: false }))}
      />
    </>
  );
};

/* ---------- helpers ---------- */
type SectionProps = {
  title: string;
  fields: FieldMeta[];
  grid: number;
  accountOptions: InputSelectComboOption[];
  onAccChange: (
    acc: string,
    setField: (field: string, value: unknown) => void
  ) => void;
  kycBusy: boolean;
  readOnly: boolean;
  t: (k: string) => string;
};

const Section: React.FC<SectionProps> = (p) => (
  <div className="mt-6">
    <h2 className="text-lg font-bold text-gray-800">{p.title}</h2>
    <FieldGrid {...p} />
  </div>
);

type FieldGridProps = Omit<SectionProps, "title">;

const FieldGrid: React.FC<FieldGridProps> = ({
  fields,
  grid,
  accountOptions,
  onAccChange,
  kycBusy,
  readOnly,
  t,
}) => (
  <div className={`grid grid-cols-1 md:grid-cols-${grid} gap-4 mt-4`}>
    {fields.map((f) => {
      const Comp = f.component;
      const commonProps = {
        name: f.name,
        label: f.label,
        disabled: readOnly,
        textColor: "text-gray-700",
        titlePosition: f.component === DatePickerValue ? "top" : undefined,
      };

      if (f.name === "currentAccount")
        return (
          <AccountNumberDropdown
            key={f.name}
            {...commonProps}
            options={accountOptions}
            width="w-full"
            maskingFormat="0000-000000-000"
            placeholder={t("currentAccount")}
            onAccountChange={onAccChange}
            loading={kycBusy}
          />
        );

      return (
        <Comp
          key={f.name}
          {...commonProps}
          {...(f.type ? { type: f.type } : {})}
          {...(f.icon ? { startIcon: f.icon } : {})}
        />
      );
    })}
  </div>
);

export default CBLForm;
