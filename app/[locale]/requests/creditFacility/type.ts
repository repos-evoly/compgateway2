
export type CreditFacilityType = 
    | "currentAccountDebit"
    | "DocumentaryCredit"
    | "LetterOfGuarantee"
    | "discountBills"
    | "temporaryLoan"
    | "other"

export type CreditFacilityRow = {
    facilityType?: CreditFacilityType;
    granted?: boolean;
    requested?: boolean;
    proposedGuarantee?:string;
}

export type ProposedWarrantyType =
    | "mortgage"
    | "personalSponsorship"
    | "transferOfRights"
    | "insurancePolicy"
    | string;

export type ProposedWarrantyRow = {
    type?: ProposedWarrantyType;
    details?: string;
}

export type CreditFacilityFormValues = {
    applicationSubmittedFromBranch?: string;
    date?: string;
    fullLegalName?: string;
    address?: string;
    phoneNumber?: number;
    commercialRegistrationNumber?: number;
    dateOfCommercialRegistration?: string;
    chamberOfCommerceNumber?: number;
    dateOfChamberOfCommerceRegistration?: string;
    legalForm?: string;
    foundationDate?: string;
    capital?: number;
    typeOfActivity?: string;
    accountNumber?: number;
    transactionStartDate?: string;
    generalManagerName?: string;
    generalManagerNationalId?: number;
    generalManagerTransportNumber?: number;
    nameOfAuthorizedSignatory1?: string;
    authorizedSignatoryNationalId1?: number;
    authorizedSignatoryTransportNumber1?: number;
    nameOfAuthorizedSignatory2?: string;
    authorizedSignatoryNationalId2?: number;
    authorizedSignatoryTransportNumber2?: number;
    nameOfAuthorizedSignatory3?: string;
    authorizedSignatoryNationalId3?: number;
    authorizedSignatoryTransportNumber3?: number;
    nameOfBoardMember1?: string;
    boardMemberNationalId1?: number;
    boardMemberTransportNumber1?: number;
    nameOfBoardMember2?: string;
    boardMemberNationalId2?: number;
    boardMemberTransportNumber2?: number;
    nameOfBoardMember3?: string;
    boardMemberNationalId3?: number;
    boardMemberTransportNumber3?: number;
    otherDealingBankName1?: string;
    debtValue1?: number;
    otherDealingBankName2?: string;
    debtValue2?: number;
    facilitiesTable?: CreditFacilityRow[];
    natureOfActivityFacilitation?: string;
    purposeOfRequestFacilitation?: string;
    howToPayFacilitation?: string;
    proposedWarrantyTable?: ProposedWarrantyRow[];
    capitalAtStartOfActivity?: number;
    capitalAtPresentTime?: number;
    totalWorkingCapitalAtPresentTime?: number;
    valueOfGoodsInStock?: number;
    typeOfGoodsInStock?: string;
    sharesInCompaniesOrBanks?: string;

     // applicationSubmittedFromBranch + date just to display from above 
    nameOfClient?: string;

    // check the attachemnts no upload they will be submitted in person at the bank




}

