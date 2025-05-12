

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
  }