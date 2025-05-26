"use client";

import { Formik, Form } from "formik";
import * as Yup from "yup";

import type { EmployeesFormPayload } from "../types"; // Adjust path if needed
import FormInputIcon from "@/app/components/FormUI/FormInputIcon"; // Adjust if needed
import InputSelectCombo from "@/app/components/FormUI/InputSelectCombo"; // Adjust if needed
import BackButton from "@/app/components/reusable/BackButton"; // Import your new back button
import SubmitButton from "@/app/components/FormUI/SubmitButton"; // Import your revised SubmitButton

import { FaUser, FaKey, FaEnvelope, FaPhone } from "react-icons/fa";

interface EmployeeFormProps {
  initialValues?: EmployeesFormPayload;
  onSubmit: (values: EmployeesFormPayload) => void;
  onCancel?: () => void;
}

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
  // 1) Decide if this is ADD or EDIT mode
  const isEditMode = Boolean(initialValues);

  // 2) If no initialValues passed, use empty defaults
  const defaultValues: EmployeesFormPayload = {
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    roleId: undefined,
  };

  const formInitialValues = initialValues ?? defaultValues;

  // 3) Dummy role data
  const roleOptions = [
    { value: 1, label: "Manager" },
    { value: 2, label: "Assistant" },
    { value: 3, label: "Accountant" },
  ];

  return (
    <div className="rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl">
      {/* Header with back button (conditionally) + short height */}
      <div className="bg-info-dark py-8 h-10 flex items-center gap-4">
        {/* If edit => pass fallbackPath, else no path => refresh */}
        <BackButton fallbackPath={isEditMode ? "/employees" : undefined} />
      </div>

      <div className="p-6">
        <Formik
          initialValues={formInitialValues}
          validationSchema={EmployeeFormSchema}
          onSubmit={(values, { resetForm }) => {
            onSubmit(values);
            resetForm();
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-6">
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-3 border-b pb-2">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <FormInputIcon
                      name="firstName"
                      label="First Name"
                      startIcon={<FaUser className="text-info-dark" />}
                    />
                    <FormInputIcon
                      name="lastName"
                      label="Last Name"
                      startIcon={<FaUser className="text-info-dark" />}
                    />
                    <FormInputIcon
                      name="username"
                      label="Username"
                      startIcon={<FaUser className="text-info-dark" />}
                    />
                  </div>
                </div>

                {/* Account Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-3 border-b pb-2">
                    Account Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormInputIcon
                      name="email"
                      label="Email Address"
                      type="email"
                      startIcon={<FaEnvelope className="text-info-dark" />}
                    />
                    <FormInputIcon
                      name="password"
                      label="Password"
                      type="password"
                      startIcon={<FaKey className="text-info-dark" />}
                    />
                  </div>
                </div>

                {/* Contact & Role */}
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-3 border-b pb-2">
                    Contact & Role
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormInputIcon
                      name="phone"
                      label="Phone Number"
                      startIcon={<FaPhone className="text-info-dark" />}
                    />
                    <InputSelectCombo
                      name="roleId"
                      label="Employee Role"
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
                    Cancel
                  </button>
                )}

                <SubmitButton
                  title="Save Employee"
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
