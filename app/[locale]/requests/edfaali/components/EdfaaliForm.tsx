"use client";

import React, { ReactNode, useEffect, useMemo, useState } from "react";
import { useTranslations } from "use-intl";
import { FormikHelpers, useField, useFormikContext } from "formik";

import Form from "@/app/components/FormUI/Form";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import InputSelectCombo from "@/app/components/FormUI/InputSelectCombo";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import BackButton from "@/app/components/reusable/BackButton";

import {
  initialValues as defaultValues,
  validationSchema,
  identificationTypeOptions,
  composedAccountNumber,
  pluckMiddleDigits,
  buildSectionConfigs,
} from "../data";
import {
  ACCOUNT_NUMBER_PREFIX,
  ACCOUNT_NUMBER_SUFFIX,
  FieldConfig,
  EdfaaliFormProps,
  TEdfaaliFormValues,
} from "../types";
import DocumentUploadFields from "./DocumentUploadFields";

import { getRepresentatives } from "@/app/[locale]/representatives/services";

type RepresentativeOption = {
  label: string;
  value: string;
};

type AccountNumberFieldProps = {
  name: keyof TEdfaaliFormValues;
  label: string;
  helperText?: string;
  disabled?: boolean;
};

const AccountNumberField: React.FC<AccountNumberFieldProps> = ({
  name,
  label,
  helperText,
  disabled = false,
}) => {
  const [field, meta, helpers] = useField<string>(name);
  const middleDigits = useMemo(() => pluckMiddleDigits(field.value ?? ""), [
    field.value,
  ]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const digitsOnly = event.target.value.replace(/\D/g, "").slice(0, 6);
    if (digitsOnly.length === 0) {
      helpers.setValue("");
      return;
    }
    helpers.setValue(composedAccountNumber(digitsOnly));
  };

  const handleBlur = () => {
    helpers.setTouched(true, true);
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700" htmlFor={name}>
        {label}
      </label>
      <div
        className={`flex items-center gap-2 rounded-md border bg-white px-3 py-2 ${
          disabled ? "bg-gray-100" : ""
        }`}
      >
        <span className="font-mono text-sm text-gray-500">
          {ACCOUNT_NUMBER_PREFIX}
        </span>
        <span className="text-gray-400">-</span>
        <input
          id={name}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={middleDigits}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          className="w-24 border-none bg-transparent text-center font-mono text-sm outline-none focus:ring-0"
          placeholder="000000"
        />
        <span className="text-gray-400">-</span>
        <span className="font-mono text-sm text-gray-500">
          {ACCOUNT_NUMBER_SUFFIX}
        </span>
      </div>
      {helperText && (
        <p className="text-xs text-gray-500" role="note">
          {helperText}
        </p>
      )}
      {meta.touched && meta.error ? (
        <p className="text-xs text-red-600" role="alert">
          {meta.error}
        </p>
      ) : null}
    </div>
  );
};

type ButtonsRowProps = {
  submitLabel: string;
  onBack?: () => void;
  isEdit: boolean;
  showSubmit: boolean;
};

const ButtonsRow: React.FC<ButtonsRowProps> = ({
  submitLabel,
  onBack,
  isEdit,
  showSubmit,
}) => {
  const { isSubmitting } = useFormikContext<TEdfaaliFormValues>();

  return (
    <div className="mt-10 flex items-center justify-center gap-3 border-t border-gray-200 px-6 pb-6 pt-6">
      <BackButton
        fallbackPath="/requests/edfaali"
        onBack={onBack}
        isEditing={isEdit}
        className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-info-dark hover:text-info-dark"
      />
      {showSubmit && (
        <SubmitButton
          title={submitLabel}
          color="info-dark"
          isSubmitting={isSubmitting}
          disabled={isSubmitting}
          fullWidth={false}
        />
      )}
    </div>
  );
};

type SectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

const Section: React.FC<SectionProps> = ({ title, description, children }) => (
  <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
    <div className="border-b border-gray-200 bg-gray-50 px-5 py-4">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      ) : null}
    </div>
    <div className="flex-1 px-5 py-5">{children}</div>
  </section>
);

const EdfaaliForm: React.FC<EdfaaliFormProps> = ({
  initialValues,
  onSubmit,
  onBack,
  readOnly = false,
}) => {
  const t = useTranslations("edfaaliForm");

  const mergedValues: TEdfaaliFormValues = {
    ...defaultValues,
    ...initialValues,
  };

  const [representativeOptions, setRepresentativeOptions] = useState<
    RepresentativeOption[]
  >([]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const response = await getRepresentatives(1, 10_000);
        if (!mounted) return;

        const options = response.data
          .map<RepresentativeOption | null>((rep) => {
            if (rep.id == null) return null;
            const value = String(rep.id);
            const label = rep.name?.trim() || `#${rep.id}`;
            return { label, value };
          })
          .filter((option): option is RepresentativeOption =>
            Boolean(option && option.value.length > 0)
          );

        const currentId = (mergedValues.representativeId ?? "").trim();
        const hasCurrent = options.some((option) => option.value === currentId);

        setRepresentativeOptions(
          hasCurrent || currentId.length === 0
            ? options
            : [...options, { label: currentId, value: currentId }]
        );
      } catch (error) {
        console.error("Failed to fetch representatives:", error);
        const currentId = (mergedValues.representativeId ?? "").trim();
        setRepresentativeOptions(
          currentId.length > 0
            ? [{ label: currentId, value: currentId }]
            : []
        );
      }
    })();

    return () => {
      mounted = false;
    };
  }, [mergedValues.representativeId]);

  const schema = useMemo(() => validationSchema(t), [t]);
  const isEdit = Boolean(initialValues);

  const idTypeOptions = useMemo(
    () =>
      identificationTypeOptions.map((option) => ({
        label: t(option.labelKey),
        value: option.value,
      })),
    [t]
  );

  const sections = useMemo(
    () =>
      buildSectionConfigs({
        t,
        representativeOptions,
        idTypeOptions,
      }),
    [idTypeOptions, representativeOptions, t]
  );

  const handleSubmit = async (
    values: TEdfaaliFormValues,
    helpers: FormikHelpers<TEdfaaliFormValues>
  ) => {
    if (readOnly) return;
    return onSubmit?.(values, helpers);
  };

  const renderField = (field: FieldConfig) => {
    if (field.component === "select") {
      return (
        <InputSelectCombo
          name={field.name}
          label={field.label}
          options={field.options}
          placeholder={field.placeholder}
          width="w-full"
          disabled={readOnly}
        />
      );
    }

    if (field.component === "accountNumber") {
      return (
        <AccountNumberField
          name={field.name}
          label={field.label}
          helperText={field.helperText}
          disabled={readOnly}
        />
      );
    }

    return (
      <FormInputIcon
        name={field.name}
        label={field.label}
        type={field.type}
        inputMode={field.inputMode}
        width="w-full"
        disabled={readOnly}
      />
    );
  };

  return (
    <div className="bg-gray-100 px-6 py-6">
      <Form
        initialValues={mergedValues}
        validationSchema={schema}
        onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {sections.map((section) => (
            <Section
              key={section.key}
              title={section.title}
              description={section.description}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {section.fields.map((field) => (
                  <div
                    key={field.name}
                    className={field.colSpan === "full" ? "md:col-span-2" : ""}
                  >
                    {renderField(field)}
                  </div>
                ))}
              </div>
            </Section>
          ))}
          <Section
            title={t("sections.documents")}
            description={t("sections.documentsDescription")}
          >
            <DocumentUploadFields readOnly={readOnly} />
          </Section>
        </div>

        {(!readOnly || onBack) && (
          <ButtonsRow
            submitLabel={t(isEdit ? "update" : "submit")}
            onBack={onBack}
            isEdit={isEdit}
            showSubmit={!readOnly}
          />
        )}
      </Form>
    </div>
  );
};

export default EdfaaliForm;
