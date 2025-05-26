// types.ts

/** The shape used for the letterOfGuarantee form. */
export type TLetterOfGuarantee = {
  id?: number; 
  accountNumber: string;
  date: string; 
  amount: number;
  purpose: string;
  additionalInfo: string;
  curr: string;
  refferenceNumber: string;
  // We always set type="letterOfGuarantee"
  type: string; 
};

/** The shape of an API item returned by GET /creditfacilities/{id} when type=letterOfGuarantee. */
export type LetterOfGuaranteeApiItem = {
  id: number;
  userId: number;
  accountNumber: string;
  date: string;
  amount: number;
  purpose: string;
  additionalInfo: string;
  curr: string;
  referenceNumber: string;
  type: string; // "letterOfGuarantee"
  status: string;
  reason: string;
  createdAt: string;
  updatedAt: string;
};

/** The shape returned by GET /creditfacilities with multiple items. */
export type LetterOfGuaranteeApiResponse = {
  data: LetterOfGuaranteeApiItem[];
  page: number;
  limit: number;
  totalPages: number;
  totalRecords: number;
};
