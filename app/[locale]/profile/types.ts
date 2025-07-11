export type Attachment = {
    id: string;
    attSubject: string;
    attUrl: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
    attFileName?: string;
    attMime?: string;
    attOriginalFileName?: string;
    createdBy?: string;
    attSize?: number;
    companyId?: string;
  };
  
  export type Company = {
    id?: string; // This is the company code
    code: string;
    name: string;
    isActive: boolean;
    registrationStatus: string;
    RegistrationStatusMessage?: string;
    kycRequestedAt: string;     // ISO date string
    kycReviewedAt?: string;     // ISO date string
    kycBranchId?: string;
    kycLegalCompanyName?: string;
    kycLegalCompanyNameLt?: string;
    kycMobile?: string;
    kycNationality?: string;
    kycCity?: string;
    attachments?: Attachment[];
    servicePackageId?: number; // ID of the service package
    servicePackageName?: string; // Name of the service package
    commissionOnReceiver?: boolean; 
  };
  
  // The response for the /companies/admin endpoint
  export type GetCompaniesResponse = {
    data: Company[];
    page: number;
    limit: number;
    totalPages: number;
    totalRecords: number;
  };