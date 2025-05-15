// /checkbook/types.ts

/**
 * The shape of a single checkbook record returned by the API.
 */
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
  

  /**
   * The shape of the API's paginated response.
   */
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
  };