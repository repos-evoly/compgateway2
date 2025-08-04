export type EmployeeFormValues = {
  id?: number;
  name: string;
  email: string;
  phone: string;
  salary: number;
  date: string;
  accountNumber: string;
  accountType: string;
  sendSalary: boolean;
  canPost: boolean;
};

export type EmployeeFormProps = {
  initialData?: Partial<EmployeeFormValues>;
  onSubmit?: (values: EmployeeFormValues) => void;
  viewOnly?: boolean;
  onSuccess?: () => void;
  onBack?: () => void;
};

export type EmployeePayload = EmployeeFormValues;

export type EmployeeResponse = {
  id: number;
  name: string;
  email: string;
  phone: string;
  salary: number;
  date: string;
  accountNumber: string;
  accountType: string;
  sendSalary: boolean;
  canPost: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export interface EmployeesApiResponse {
  data: EmployeeResponse[];
  page: number;
  limit: number;
  totalPages: number;
  totalRecords: number;
}
