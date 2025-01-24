export type MainHeaderProps = {
    title: string;
    logoUrl: string | StaticImageData;  // Now accepts both string URLs and StaticImageData
    isRtl: boolean;
};


export type FormItemsProps = {
    label?: string;
    inputType: string;
    inputID?: string;
    inputName?: string;
    inputValue: string | number;
    disable?: boolean;
    readOnly?: boolean;
    onChange?: (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
      ) => void; // Allow both input and select elements
    error?: string[];
    selectOptions?: { value: string; label: string }[];
    isDatalist?: boolean;
    datalistOptions?: { value: string }[];
    required?: boolean;
    className?: string;
    onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => void; // Add this line
  
  };

  export type FormInputIconProps = {
    name: string;
    label: string;
    type?: string;
    startIcon?: ReactNode; // ReactNode for the start icon
    children?: ReactNode; // ReactNode for the end icon or actions
    onClick?: () => void; // Handler for the end icon click
    onMouseDown?: (event: React.MouseEvent<HTMLButtonElement>) => void; // Handler for mouse down event
    helpertext?: string; // Optional helper text
    width?: string; // Optional custom width property

  };


  type DropdownType = { value: string | number; label: string };


  export type SpecialFieldWrapperProps = {
    field: FormInputIconProps;
    t: (key: string) => string;
  };
  
  export type InternalFormValues = {
    from: string;
    to: string;
    value: number;
    commision: number;
    description: string;
    selectField: string;
    recurring: boolean;
    date?: string | null;
    receiverOrSender: string;
  };
  
  export type InternalFormProps = {
    initialData?: Partial<InternalFormValues>;
    onSubmit: (values: InternalFormValues) => void;
  };
  
  export type RecurringDateDisplayProps = {
    t: (key: string) => string;
    isEditing: boolean;
    ends?: string | null;
  };

  export type AdditionalData = {
    fromName?: string;
    toName?: string;
    fromBalance?: string;
  };

  export type Metadata = {
    [key: string]: {
      label: string;
      type?: string;
      options?: { value: string | number; label: string }[];
      value?: string;
    };
  };
  
  export type ConfirmationModalProps<T extends Record<string, unknown>> = {
    isOpen: boolean;
    onClose: () => void;
    metadata: Metadata;
    additionalData?: T; // Accepts any shape dynamically
  };


  export type SpecialFieldsDisplayProps = {
    field: {
      name: string;
      startIcon?: JSX.Element;
      type: string;
      width?: string;
    };
    displayType: "account" | "commission";
    t: (key: string) => string;
    disabled?:boolean;
  };

  export type FormTypeSelectProps = {
    selectedFormType: string;
    onFormTypeChange: (formType: string) => void;
  };

  export type ContinueButtonProps = {
    onClick: (data: InternalFormValues) => void;
    touchedFields: { [key: string]: boolean }; // Object of fields to mark as touched
  };
  