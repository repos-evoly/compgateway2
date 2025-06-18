"use client";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FaUser, FaKey, FaEnvelope, FaPhone } from "react-icons/fa";

import type { EmployeesFormPayload, RoleOption } from "../types";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import InputSelectCombo from "@/app/components/FormUI/InputSelectCombo";
import BackButton from "@/app/components/reusable/BackButton";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import { getRoles } from "../services";

type EmployeeFormProps = {
  initialValues?: EmployeesFormPayload;
  onSubmit: (values: EmployeesFormPayload) => Promise<void>;
  onCancel?: () => void;
};

const EmployeeFormSchema = Yup.object().shape({
  firstName: Yup.string().required("Required"),
  lastName: Yup.string().required("Required"),
  username: Yup.string().required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().required("Required"),
  phone: Yup.string().required("Required"),
  roleId: Yup.number().required("Please select a role"),
});

export default function EmployeeForm({
  initialValues,
  onSubmit,
  onCancel,
}: EmployeeFormProps) {
  // Check if we're editing
  const isEditMode = Boolean(initialValues);

  // Default form values if none provided
  const defaultValues: EmployeesFormPayload = {
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    roleId: 0,
  };
  const formInitialValues = initialValues ?? defaultValues;

  const locale = useLocale(); // "en" or "ar"
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const t = useTranslations("employees.form");

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await getRoles();
        setRoles(data);
      } catch (err) {
        console.error("Failed to fetch roles:", err);
      }
    };

    fetchRoles();
  }, []);

  const roleOptions = roles.map((role) => ({
    value: role.id,
    label: locale === "ar" ? role.nameAR : role.nameLT,
  }));

  console.log("roles fetched in the create employee ", roles);

  return (
    <div className="rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl">
      {/* Header with back button */}
      <div className="bg-info-dark py-8 h-10 flex items-center gap-4">
        <BackButton
          fallbackPath={isEditMode ? "/employees" : undefined}
          isEditing={isEditMode}
        />
      </div>

      <div className="p-6">
        <Formik
          initialValues={formInitialValues}
          validationSchema={EmployeeFormSchema}
          // Call parent onSubmit => manage loading state with setSubmitting
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await onSubmit(values);
            } finally {
              // Ensure loading is turned off even if there's an error
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-6">
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-3 border-b pb-2">
                    {t("personalInformation")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <FormInputIcon
                      name="firstName"
                      label={t("firstName")}
                      startIcon={<FaUser className="text-info-dark" />}
                    />
                    <FormInputIcon
                      name="lastName"
                      label={t("lastName")}
                      startIcon={<FaUser className="text-info-dark" />}
                    />
                    <FormInputIcon
                      name="username"
                      label={t("username")}
                      startIcon={<FaUser className="text-info-dark" />}
                      disabled={isEditMode}
                    />
                  </div>
                </div>

                {/* Account Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-3 border-b pb-2">
                    {t("accountInformation")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormInputIcon
                      name="email"
                      label={t("email")}
                      type="email"
                      startIcon={<FaEnvelope className="text-info-dark" />}
                      disabled={isEditMode}
                    />
                    <FormInputIcon
                      name="password"
                      label={t("password")}
                      type="password"
                      startIcon={<FaKey className="text-info-dark" />}
                      disabled={isEditMode}
                    />
                  </div>
                </div>

                {/* Contact & Role */}
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-3 border-b pb-2">
                    {t("contactAndRole")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormInputIcon
                      name="phone"
                      label={t("phone")}
                      startIcon={<FaPhone className="text-info-dark" />}
                    />
                    <InputSelectCombo
                      name="roleId"
                      label={t("role")}
                      options={roleOptions}
                      placeholder="Select a role"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-4 flex items-center justify-end gap-3">
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    {t("cancel")}
                  </button>
                )}

                <SubmitButton
                  title={t("save")}
                  color="info-dark"
                  isSubmitting={isSubmitting}
                  fullWidth={false}
                />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
