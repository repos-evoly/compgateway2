/* --------------------------------------------------------------------------
 * salaryTypes.ts
 * -------------------------------------------------------------------------- */

/**
 * Salary transaction type for previous salary transactions
 */
export type TSalaryTransaction = {
  id: number;
  genCode: string;
  amount: number;
  date: string;
  accounts: string[];
  employeeName: string;
  employeeId: string;
  status: "completed" | "pending" | "failed";
  transactionType: "salary" | "bonus" | "allowance";
};

/**
 * Salary record type for salaries module (existing)
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
