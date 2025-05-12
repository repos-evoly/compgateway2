export type ServicesOptions = 
    | "reactivateIdfaali"
    | "deactivateIdfaali"
    | "resetDigitalBankPassword"
    | "resendMobileBankingPin"
    | "changePhoneNumber"

export type ServicesRequest = {
    [K in ServicesOptions]: boolean;
};

export type StatementRequest = {
    currentAccountStatement?: {
        arabic?: boolean;
        english?: boolean;
    };
    visaAccountStatement?: boolean;
    fromDate?: string;
    toDate?: string;
    accountStatement?: boolean;
    journalMovement?: boolean;
    nonFinancialCommitment?: boolean;
}

export type CertifiedBankStatementRequest = {
    accountHolderName?: string;
    authorizedOnTheAccountName?: string;
    accountNumber?: number;
    serviceRequests?: ServicesRequest;
    oldAccountNumber?: number;
    newAccountNumber?: number;
    statementRequest?: StatementRequest;
}