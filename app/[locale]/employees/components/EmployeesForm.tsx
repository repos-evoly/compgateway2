"use client";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FaUser, FaKey, FaEnvelope, FaPhone } from "react-icons/fa";

import type { EmployeesFormPayload, RoleOption } from "../types";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import InputSelectCombo from "@/app/components/FormUI/InputSelectCombo";
import RadiobuttonWrapper from "@/app/components/FormUI/Radio";
import BackButton from "@/app/components/reusable/BackButton";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import { getRoles } from "../services";

type EmployeeFormProps = {
  initialValues?: EmployeesFormPayload;
  onSubmit: (values: EmployeesFormPayload) => Promise<void>;
  onCancel?: () => void;
  employeeStatus?: boolean;
  onStatusChange?: (newStatus: boolean) => void;
};

export default function EmployeeForm({
  initialValues,
  onSubmit,
  onCancel,
  employeeStatus = true,
  onStatusChange,
}: EmployeeFormProps) {
  // Check if we're editing
  const isEditMode = Boolean(initialValues);

  // Validation schema - different rules for edit vs create mode
  const EmployeeFormSchema = Yup.object().shape({
    firstName: Yup.string().required("Required"),
    lastName: Yup.string().required("Required"),
    username: isEditMode ? Yup.string() : Yup.string().required("Required"),
    email: isEditMode ? Yup.string().email("Invalid email") : Yup.string().email("Invalid email").required("Required"),
    password: isEditMode ? Yup.string() : Yup.string()
      .required("كلمة المرور مطلوبة")
      .min(6, "يجب أن تكون كلمة المرور 6 أحرف على الأقل")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{6,}$/,
        "يجب أن تحتوي كلمة المرور على حرف صغير، حرف كبير، رقم، ورمز خاص"
      ),
    phone: Yup.string().required("Required").min(8, "رقم الهاتف قصير جداً"),
    roleId: Yup.number().required("Please select a role"),
  });

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
    <div className="rounded-xl overflow-visible transition-all duration-300 hover:shadow-xl">
      {/* Header with back button */}
      <div className="bg-info-dark py-8 h-10 flex items-center gap-4">
        <BackButton
          fallbackPath={isEditMode ? "/employees" : undefined}
        />
      </div>

      <div className="p-6">
        <Formik
          initialValues={{
            ...formInitialValues,
            isActive: employeeStatus
          }}
          validationSchema={EmployeeFormSchema}
          // Call parent onSubmit => manage loading state with setSubmitting
          onSubmit={async (values, { setSubmitting }) => {
            try {
              // Call onStatusChange if the status changed
              if (onStatusChange && values.isActive !== employeeStatus) {
                onStatusChange(values.isActive);
              }
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
                  {isEditMode && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700">
                        {t("editModeNote")}
                      </p>
                    </div>
                  )}
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

                {/* Status Section - Only show in edit mode */}
                {isEditMode && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-3 border-b pb-2">
                      {t("status")}
                    </h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <RadiobuttonWrapper
                        name="isActive"
                        label={t("status")}
                        options={[
                          { value: true, label: "active" },
                          { value: false, label: "inactive" }
                        ]}
                        flexDir={["row", "row"]}
                        t={(key) => t(key)}
                        disabled={false}
                      />
                    </div>
                  </div>
                )}
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
