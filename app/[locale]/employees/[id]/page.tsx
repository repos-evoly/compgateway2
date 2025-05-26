"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Employee, EmployeesFormPayload } from "../types";
import EmployeeForm from "../components/EmployeesForm";

// Dummy data, matching your list
const DUMMY_EMPLOYEES: Employee[] = [
  {
    authUserId: 101,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 555-1234",
    roleId: 1,
  },
  {
    authUserId: 102,
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    phone: "+1 555-5678",
    roleId: 2,
  },
  // Add more...
];

export default function SingleEmployeePage() {
  const { id } = useParams();
  const router = useRouter();
  const numericId = Number(id);

  const [employee, setEmployee] = useState<Employee | null>(null);

  // On mount, find the employee in DUMMY_EMPLOYEES
  useEffect(() => {
    if (Number.isNaN(numericId)) return;
    const found = DUMMY_EMPLOYEES.find((e) => e.authUserId === numericId);
    setEmployee(found || null);
  }, [numericId]);

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

  // Transform the employee => EmployeesFormPayload shape
  // For fields not in Employee, we’ll pass empty or placeholders
  const initialValues: EmployeesFormPayload = {
    firstName: employee.firstName ?? "",
    lastName: employee.lastName ?? "",
    username: employee.username ?? "",
    email: employee.email ?? "",
    password: "", // We can’t retrieve the password from DB for security reasons
    phone: employee.phone ?? "",
    roleId: employee.roleId,
  };

  const handleSubmit = (values: EmployeesFormPayload) => {
    console.log("Updated Employee data:", values);
    // e.g. call your API to update the employee
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
