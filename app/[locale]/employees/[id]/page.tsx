"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import { getEmployeeById } from "../services";
import { EmployeeResponse } from "../types";
import EmployeeForm from "../components/EmployeesForm";

const Page = () => {
  const t = useTranslations("employees");
  const params = useParams();
  const id = params.id as string;

  const [employee, setEmployee] = useState<EmployeeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    const fetchEmployee = async () => {
      if (!id) {
        console.log("No ID provided");
        return;
      }

      console.log("Fetching employee with ID:", id, "Type:", typeof id);
      setLoading(true);
      try {
        const data = await getEmployeeById(Number(id));
        console.log("Employee data received:", data);
        setEmployee(data);
      } catch (error) {
        console.error("Error fetching employee:", error);
        const errorMessage =
          error instanceof Error ? error.message : t("unknownError");
        setModalTitle(t("fetchErrorTitle"));
        setModalMessage(errorMessage);
        setModalSuccess(false);
        setModalOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id, t]);

  const handleFormSuccess = () => {
    setIsEditMode(false);
    // Refresh the employee data
    const fetchEmployee = async () => {
      try {
        const data = await getEmployeeById(Number(id));
        setEmployee(data);
      } catch (error) {
        console.error("Error refreshing employee:", error);
      }
    };
    fetchEmployee();

    setModalTitle(t("updateSuccessTitle"));
    setModalMessage(t("updateSuccessMsg"));
    setModalSuccess(true);
    setModalOpen(true);
  };

  const handleFormBack = () => {
    setIsEditMode(false);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Employee not found</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Employee Form in view mode */}
      <EmployeeForm
        initialData={employee}
        viewOnly={!isEditMode}
        onSuccess={handleFormSuccess}
        onBack={handleFormBack}
      />

      <ErrorOrSuccessModal
        isOpen={modalOpen}
        isSuccess={modalSuccess}
        title={modalTitle}
        message={modalMessage}
        onClose={handleModalClose}
        onConfirm={handleModalClose}
      />
    </div>
  );
};

export default Page;
