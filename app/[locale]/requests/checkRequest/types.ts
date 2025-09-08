/**
 * Single line-item on a check request
 */
export type TCheckRequestLineItem = {
  id?: number;
  dirham: string;
  lyd: string;
};

/**
 * The shape of a single check request (GET/POST).
 */
export type TCheckRequestValues = {
  id?: number;
  userId?: number;
  branch: string;
  branchNum?: string;          // e.g. "0010"
  date: string;                // ISO string from API
  customerName: string;
  cardNum: string;
  accountNum: string;
  beneficiary: string;
  phone?: string;
  representativeId?: number;
  representativeName?: string;
  status?: string;
  lineItems: TCheckRequestLineItem[];
  createdAt?: string;
  updatedAt?: string;
  reason?: string;
};

/**
 * Paginated response from GET /checkrequests
 */
export type TCheckRequestsResponse = {
  data: TCheckRequestValues[];
  page: number;
  limit: number;
  totalPages: number;
  totalRecords: number;
};

/**
 * Form values for creating/updating check requests
 */
// types.ts (or wherever it's defined)
export type TCheckRequestFormValues = {
  branch: string;
  branchNum?: string;          // optional; set by BranchesSelect
  date: Date;                  // real Date for the DatePicker
  customerName: string;
  cardNum: string;
  accountNum: string;
  beneficiary: string;
  phone: string;               // ← added
  representativeId?: number;
  lineItems: {
    dirham: string;
    lyd: string;
  }[];
  status?: string;
  reason?: string;
};

/**
 * Props for the CheckRequestForm component
 */
export type TCheckRequestFormProps = {
  onSubmit: (values: TCheckRequestFormValues) => void;
  onCancel?: () => void;
  initialValues?: TCheckRequestFormValues | null;
  readOnly?: boolean;
  isSubmitting?: boolean;
};