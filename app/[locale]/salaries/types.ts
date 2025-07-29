/* --------------------------------------------------------------------------
 * salaryTypes.ts
 * -------------------------------------------------------------------------- */

/**
 * Salary record type for salaries module
 */
export type TSalaryRecord = {
  id: number;
  name: string;
  email: string;
  phone: string;
  salary: number;
  date: string;
  accountNumber: string;
  accountType: "account" | "wallet";
  sendSalary: boolean;
  canPost: boolean;
};

/**
 * Form values type for salary forms (all fields optional except sendSalary and canPost)
 */
export type TSalaryFormValues = {
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
  salary?: number;
  date?: string;
  accountNumber?: string;
  accountType?: "account" | "wallet";
  sendSalary: boolean;
  canPost: boolean;
};
