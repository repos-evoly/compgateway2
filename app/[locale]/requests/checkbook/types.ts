export type TCheckbookValues = {
  id?: number;
  userId?: number;
  fullName: string;
  address: string;
  phoneNumber?: string; // ← added
  accountNumber: string;
  representativeId: string;
  branch: string;
  date: string;
  bookContaining: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  reason?: string;
};

export type TCheckbookResponse = {
  data: TCheckbookValues[];
  page: number;
  limit: number;
  totalPages: number;
  totalRecords: number;
};

export type TCheckbookFormValues = {
  fullName: string;
  address: string;
  phoneNumber: string; // ← added
  accountNumber: string;
  representativeId: string;
  branch: string;
  date: string;
  bookContaining: string;
  status?: string;
  id?: number;
  reason?: string;
};

/** Props for our CheckbookForm component */
export type TCheckbookFormProps = {
  onSubmit: (newItem: TCheckbookFormValues) => void;
  onCancel?: () => void; // Made optional since it might not always be provided
  initialData?: TCheckbookFormValues | null;
  /** 
   * If true, all inputs are disabled and no submit button is shown. 
   * Used when displaying a record in read-only mode.
   */
  readOnly?: boolean;
  /** 
   * External submitting state for update operations 
   */
  isSubmitting?: boolean;
};