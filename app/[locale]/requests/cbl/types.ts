import { FormikHelpers } from "formik";

export type Attachment = {
  id: string;
  createdAt: string;
  updatedAt: string;
  cblRequestId: string | null;
  visaRequestId: string | null;
  attSubject: string;
  attFileName: string;
  attMime: string;
  attUrl: string;
  attOriginalFileName: string;
  createdBy: string;
  description: string;
  attSize: number;
  companyId: string;
  displayUrl?: string; // Added for display purposes
};

export type TCblRequestsResponse = {
    data: TCBLValues[];
    page: number;
    limit: number;
    totalPages: number;
    totalRecords: number;
  };

  /** The full shape of the form values, now including an 'id' field. */
export type TCBLValues = {
    id: number; // <-- ADDED ID FIELD
    partyName: string;
    capital: number;
    foundingDate: Date;
    legalForm: string;
    branchOrAgency: string;
    currentAccount: string;
    accountOpening: Date;
    commercialLicense: string;
    validatyLicense: Date;
    commercialRegistration: string;
    validatyRegister: Date;
    statisticalCode: string;
    validatyCode: Date;
    chamberNumber: string;
    validatyChamber: Date;
    taxNumber: string;
    office: string;
    legalRepresentative: string;
    representativeNumber: string;
    birthDate: Date;
    passportNumber: string;
    passportIssuance: Date;
    passportExpiry: Date;
    mobile: string;
    address: string;
    table1Data: { name: string; position: string }[];
    table2Data: { name: string; signature: string }[];
    packingDate: Date;
    specialistName: string;
    status?: string;
    files?: File[];
    newFiles?: File[]; // Added for new document uploads in edit mode
    attachmentUrls?: string[]; // Added for displaying existing attachments
    attachments?: Attachment[]; // Added for API response
  };
  
  /** Props for the CBLForm component */
  export type CBLFormProps = {
    /** An optional partial set of the form's values for editing. */
    initialValues?: Partial<TCBLValues>;
    /** Called on form submit. */
    onSubmit?: (values: TCBLValues, helpers: FormikHelpers<TCBLValues>) => void;
    /** If present, show a "Cancel" button that calls this. */
    onCancel?: () => void;
    /** If present, handle back button functionality. */
    onBack?: () => void;
    readOnly?: boolean; 
  };
  