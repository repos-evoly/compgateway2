import { FormikHelpers } from "formik";

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
  };
  
  /** Props for the CBLForm component */
  export type CBLFormProps = {
    /** An optional partial set of the form's values for editing. */
    initialValues?: Partial<TCBLValues>;
    /** Called on form submit. */
    onSubmit: (values: TCBLValues, helpers: FormikHelpers<TCBLValues>) => void;
    /** If present, show a "Cancel" button that calls this. */
    onCancel?: () => void;
  };
  