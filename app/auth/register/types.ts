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