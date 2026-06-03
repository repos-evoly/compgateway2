export type EmployeeFormValues = {
  id?: number;
  name?: string;
  email?: string | null;
  phone?: string | null;
  salary?: number;
  date?: string;
  accountNumber?: string;
  accountType?: string;
  evoWallet?: string | null;
  bcdWallet?: string | null;
  accountAllocationAmount?: number;
  evoAllocationAmount?: number;
  bcdAllocationAmount?: number;
  sendSalary?: boolean;
  canPost?: boolean;
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
  email: string | null;
  phone: string | null;
  salary: number;
  date: string;
  accountNumber: string;
  accountType: string;
  evoWallet?: string | null;
  bcdWallet?: string | null;
  accountAllocationAmount?: number;
  evoAllocationAmount?: number;
  bcdAllocationAmount?: number;
  sendSalary: boolean;
  canPost: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type EmployeesApiResponse = {
  data: EmployeeResponse[];
  page: number;
  limit: number;
  totalPages: number;
  totalRecords: number;
}

export type EmployeeExcelImportRowError = {
  rowNumber: number;
  message: string;
};

export type EmployeeExcelImportResult = {
  totalRows: number;
  createdCount: number;
  updatedCount: number;
  deletedCount: number;
  skippedCount: number;
  errors: EmployeeExcelImportRowError[];
};
