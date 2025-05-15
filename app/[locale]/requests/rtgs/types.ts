/**
 * Single RTGS request record (matching the API).
 */
export type TRTGSValues = {
    id?: number;
    userId?: number;
    refNum: string;            // The API returns ISO string date (e.g. "2025-05-14T06:53:05.526")
    date: string;             // Also an ISO string date
    paymentType: string;
    accountNo: string;
    applicantName: string;
    address: string;
    beneficiaryName: string;
    beneficiaryAccountNo: string;
    beneficiaryBank: string;
    branchName: string;
    amount: string;
    remittanceInfo: string;
    invoice: boolean;
    contract: boolean;
    claim: boolean;
    otherDoc: boolean;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  
  /**
   * Paginated response from GET /rtgsrequests
   */
  export type TRTGSResponse = {
    data: TRTGSValues[];
    page: number;
    limit: number;
    totalPages: number;
    totalRecords: number;
  };
  
  /**
   * The form type if you have a local "add" scenario
   * with date fields as Date, etc. 
   * But if you’re just testing, you can keep it all strings
   */
  export type TRTGSFormValues = {
    refNum: Date;
    date: Date;
    paymentType: string;
    accountNo: string;
    applicantName: string;
    address: string;
    beneficiaryName: string;
    beneficiaryAccountNo: string;
    beneficiaryBank: string;
    branchName: string;
    amount: string;
    remittanceInfo: string;
    invoice: boolean;
    contract: boolean;
    claim: boolean;
    otherDoc: boolean;
  };
  