

export type VisaRequestFormValues = {
    branch?: string;
    date?: string;
    accountHolderName?: string;
    accountNumber?: string;
    nationalId?: number;
    phoneNumberLinkedToNationalId?: string;
    cbl?: string;
    cardMovementApproval?: string;
    cardUsingAcknowledgment?: string;
    foreignAmount?: number;
    localAmount?: number;
    pldedge?: string;
  }


  export type VisaRequestApiItem = {
    id: number;
    userId: number;
    branch: string;
    date: string; // e.g. "2025-05-16T08:02:58.776"
    accountHolderName: string;
    accountNumber: string;
    nationalId: number;
    phoneNumberLinkedToNationalId: string;
    cbl: string;
    cardMovementApproval: string;
    cardUsingAcknowledgment: string;
    foreignAmount: number;
    localAmount: number;
    pldedge: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  
  /** The overall shape of your API response. */
  export type VisaRequestApiResponse = {
    data: VisaRequestApiItem[];
    page: number;
    limit: number;
    totalPages: number;
    totalRecords: number;
  };
  