export type TKycResponse = {
    hasKyc: boolean;
    data?: {
      companyId: string;
      branchId: string;
      legalCompanyName: string;
      legalCompanyNameLT: string;
      mobile: string;
      nationality: string;
      nationalityEN: string;
      nationalityCode: string;
      street: string | null;
      district: string | null;
      buildingNumber: string | null;
      city: string;
      branchName: string;
    };
  };
  

  export type RegisterFormProps = {
    /** Possibly undefined, so we check before showing data. */
    kycData: TKycResponse["data"] | undefined;
  };
  
  /**
   * The shape of our form fields
   */
  export type TRegisterFields = {
    companyCode: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    roleId: number | "";
  };


  export type TRegisterResponse = {
    success: boolean;
    companyCode: string;
    location: string;
    message: string;
  }


  export type TCompanyRegistrationInfo = {
    code: string;
    name: string;
    isActive: boolean;
    registrationStatus: string;
    registrationStatusMessage: string | null;
    kycRequestedAt: string | null;
    kycReviewedAt: string | null;
    kycBranchId: string | null;
    kycLegalCompanyName: string | null;
    kycLegalCompanyNameLt: string | null;
    kycMobile: string | null;
    kycNationality: string | null;
    kycCity: string | null;
    attachments: TAttachment[];
    adminContact: TAdminContact;
  };
  
  export type TAttachment = {
    id: string;
    createdAt: string;
    updatedAt: string;
    attSubject: string;
    attFileName: string;
    attMime: string;
    attUrl: string;
    attOriginalFileName: string;
    createdBy: string;
    description: string;
    attSize: number;
    companyId: string;
  };
  
  export type TAdminContact = {
    firstName: string;
    lastName: string;
    phone: string;
  };
  
  export type TEditCompanyInfoPayload = {
    firstName: string;
    lastName: string;
    phone: string;
  };
  