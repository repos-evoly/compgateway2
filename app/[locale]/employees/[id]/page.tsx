"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import type { EmployeesFormPayload } from "../types";
import EmployeeForm from "../components/EmployeesForm";
import { getEmployeeById, editEmployee } from "../services";
import type { CompanyEmployee } from "../types";
import LoadingPage from "@/app/components/reusable/Loading";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
// import { useTranslations } from "next-intl"; // Removed unused import

export default function SingleEmployeePage() {
  const router = useRouter();
  const { id } = useParams(); // e.g. /employees/123
  const numericId = Number(id);
  // const t = useTranslations("employees"); // Removed unused variable

  const [employee, setEmployee] = useState<CompanyEmployee | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  // 1) On mount => fetch the employee by ID from the API
  useEffect(() => {
    if (Number.isNaN(numericId)) {
      setLoading(false);
      return;
    }

    async function fetchEmployee() {
      try {
        const data = await getEmployeeById(numericId);
        setEmployee(data);
      } catch (err) {
        console.error("Failed to fetch employee by ID:", err);
        setModalOpen(true);
        setModalSuccess(false);
        setModalTitle("Error");
        setModalMessage(err instanceof Error ? err.message : "Failed to fetch employee");
      } finally {
        setLoading(false);
      }
    }

    fetchEmployee();
  }, [numericId]);

  if (loading) {
    return <LoadingPage />;
  }

  if (!employee) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold text-red-500 mb-2">Not Found</h2>
        <p className="text-gray-700">No employee found with ID: {id}</p>
        <button
          onClick={() => router.push("/employees")}
          className="mt-4 px-4 py-2 bg-gray-900 text-white rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  // 2) Convert the API shape => EmployeesFormPayload
  // The API doesn't return a password, so default it to "" for the form.
  const initialValues: EmployeesFormPayload = {
    firstName: employee.firstName || "",
    lastName: employee.lastName || "",
    username: employee.username || "",
    email: employee.email || "",
    password: "",
    phone: employee.phone || "",
    roleId: employee.roleId || 0,
  };

  // Ensure employee has isActive field, default to true if not present
  const employeeWithStatus = {
    ...employee,
    isActive: employee.isActive !== undefined ? employee.isActive : true
  };

  // 3) On form submit => call editEmployee, then redirect
  const handleSubmit = async (values: EmployeesFormPayload) => {
    try {
      // The API requires only these fields in the body
      await editEmployee(numericId, {
        firstName: values.firstName!,
        lastName: values.lastName!,
        email: values.email!,
        phone: values.phone!,
        roleId: values.roleId!,
        isActive: values.isActive !== undefined ? values.isActive : employeeWithStatus.isActive, // Use form value or current status
      });
      router.push("/employees");
    } catch (error) {
      console.error("Error updating employee:", error);
      setModalOpen(true);
      setModalSuccess(false);
      setModalTitle("Error");
      setModalMessage(error instanceof Error ? error.message : "Failed to update employee");
    }
  };

  // Handle status change
  const handleStatusChange = (newStatus: boolean) => {
    setEmployee(prev => prev ? { ...prev, isActive: newStatus } : null);
  };

  return (
    <div className="p-1 bg-white border border-gray-200 rounded">
      <EmployeeForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/employees")}
        employeeStatus={employeeWithStatus.isActive}
        onStatusChange={handleStatusChange}
      />

      <ErrorOrSuccessModal
        isOpen={modalOpen}
        isSuccess={modalSuccess}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
        onConfirm={() => setModalOpen(false)}
      />
    </div>
  );
}
