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
    branchNum: string;
    date: string;        // API returns ISO string, e.g. 2025-05-13T12:59:08.36
    customerName: string;
    cardNum: string;
    accountNum: string;
    beneficiary: string;
    status?: string;
    lineItems: TCheckRequestLineItem[];
    createdAt?: string;
    updatedAt?: string;
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
  

  export type TCheckRequestFormValues = {
    branch: string;
    branchNum: string;
    date: Date; // as a real Date for the DatePicker
    customerName: string;
    cardNum: string;
    accountNum: string;
    beneficiary: string;
    /** We do not store `id` or `status` in the form. */
    lineItems: {
      dirham: string;
      lyd: string;
    }[];
    status?: string; 
  };