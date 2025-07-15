

export type Attachment = {
  id: string;
  createdAt: string;
  updatedAt: string;
  cblRequestId: string | null;
  visaRequestId: string | null;
  attSubject: string;
  attFileName: string;
  attMime: string;
  attUrl: string;
  attOriginalFileName: string;
  createdBy: string;
  description: string;
  attSize: number;
  companyId: string;
  displayUrl?: string; // Added for display purposes
};

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
    status?: string;
    files?: File[]; // Added for document uploads
    newFiles?: File[]; // Added for new document uploads in edit mode
    attachmentUrls?: string[]; // Added for displaying existing attachments
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
    reason: string | null;
    attachmentId: string | null;
    attachments: Attachment[];
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
  