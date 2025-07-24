/**
 * Salary record type for salaries module
 */
export type TSalaryRecord = {
  name: string;
  email: string;
  phone: string;
  salary: number;
  date: string;
  accountNumber: string;
  sendSalary: boolean;
  canPost: boolean;
};

/**
 * Form values type for salary forms (all fields optional except sendSalary and canPost)
 */
export type TSalaryFormValues = {
  name?: string;
  email?: string;
  phone?: string;
  salary?: number;
  date?: string;
  accountNumber?: string;
  sendSalary: boolean;
  canPost: boolean;
};
