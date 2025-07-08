export type TCheckbookValues = {
  id?: number;
  userId?: number;
  fullName: string;
  address: string;
  accountNumber: string;
  pleaseSend: string;
  branch: string;
  date: string;
  bookContaining: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
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
  accountNumber: string;
  pleaseSend: string;
  branch: string;
  date: string;
  bookContaining: string;
  status?: string; 
};

/** Props for our CheckbookForm component */
export type TCheckbookFormProps = {
  onSubmit: (newItem: TCheckbookFormValues) => void;
  onCancel: () => void;
  initialData?: TCheckbookFormValues | null;
  /** 
   * If true, all inputs are disabled and no submit button is shown. 
   * Used when displaying a record in read-only mode.
   */
  readOnly?: boolean;
};
