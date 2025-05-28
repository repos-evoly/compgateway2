"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import type { EmployeesFormPayload } from "../types";
import EmployeeForm from "../components/EmployeesForm";
import { getEmployeeById } from "../services"; // Import your getEmployeeById function
import type { CompanyEmployee } from "../types";

export default function SingleEmployeePage() {
  const router = useRouter();
  const { id } = useParams(); // e.g. /employees/123
  const numericId = Number(id);

  const [employee, setEmployee] = useState<CompanyEmployee | null>(null);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    }

    fetchEmployee();
  }, [numericId]);

  if (loading) {
    return <div className="p-4">Loading employee...</div>;
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
  // For fields not in your API response, pass defaults
  const initialValues: EmployeesFormPayload = {
    firstName: employee.firstName || "",
    lastName: employee.lastName || "",
    username: employee.username || "", // if your API returns 'username' or else blank
    email: employee.email || "",
    password: "", // can't retrieve the password from DB
    phone: employee.phone || "",
    roleId: employee.roleId || 0,
  };

  // 3) On form submit => do an "updateEmployee" or temporarily log
  const handleSubmit = (values: EmployeesFormPayload) => {
    console.log("Updated Employee data:", values);
    // In a real app => call an update function, e.g. updateEmployee(numericId, values)
    // then router.push("/employees");
  };

  return (
    <div className="p-1 bg-white border border-gray-200 rounded">
      <EmployeeForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/employees")}
      />
    </div>
  );
}
