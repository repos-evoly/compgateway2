// types.ts

export interface Currency {
    id: number;
    code: string;
    rate: number;
    description: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface CurrenciesResponse {
    data: Currency[];
    totalPages: number;
  }
  