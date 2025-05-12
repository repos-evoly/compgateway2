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
    startIcon?: ReactNode;
    children?: ReactNode;
    onClick?: () => void;
    onMouseDown?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    helpertext?: string;
    width?: string;
  
    /** New optional props */
    errorMessage?: string; // For API-based or custom error display
    onBlurAdditional?: OnBlurAdditionalCallback; // Extra logic onBlur
    titlePosition?: "top" | "side";
    textColor?: string;
    disabled?: boolean;
    maskingFormat?: string;
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
  





export type CrudDataGridHeaderProps = {
  onSearch?: (value: string) => void;
  onDropdownSelect?: (value: string) => void;
  dropdownOptions?: string[];
  showAddButton?: boolean;
  onAddClick?: () => void;
  showSearchBar?: boolean;
  haveChildrens?: boolean;
  childrens?: React.ReactNode;
  showSearchInput?: boolean; // Add this
  showDropdown?: boolean; // Add this
  addButtonLabel?: string; // Optional label for the add button
};


export type CrudDataGridBodyProps = {
  columns: DataGridColumn[];
  data: T[];
  showActions?: boolean;
  actions?: Action[];
  onActionClick?: (actionName: string, row: T, rowIndex: number) => void;
  isModal?: boolean;
  modalComponent?: React.ReactNode;
  onModalOpen?: (rowIndex: number, row: T) => void;
  isComponent?: boolean;
  componentToRender?: React.ReactNode;
  onComponentRender?: (rowIndex: number, row: T) => void;
  actionsPosition?:string
};

export type Action = {
  name: string;                  // Unique name for the action
  tip: string;                   // Tooltip text
  icon?: React.ReactNode;        // Optional icon for a button action
  component?: React.ReactNode;   // Optional custom component to render
  selectProps?: SelectWrapperType; // Optional: if provided, a select is rendered
  onClick?: (row: T, rowIndex: number) => void; // Optional onClick handler
};

// In your types file:
export type DataGridColumn = {
  key: string;
  label: string;
  renderCell?: (row: any, rowIndex: number) => React.ReactNode; 
  // ^ or (row: T, rowIndex: number) => React.ReactNode but using "any" is more permissive
}


export type BaseProps = {
  data: T[];
  columns: { key: string; label: string }[];
  showSearchBar?: boolean;
  showActions?: boolean;
  showAddButton?: boolean;
  haveChildrens?: boolean;
  childrens?: React.ReactNode;
  isModal?: boolean;
  modalComponent?: React.ReactNode;
  isComponent?: boolean;
  componentToRender?: React.ReactNode;
};

export type SearchBarProps =
  | {
      showSearchBar?: true;
      onSearch?: (value: string) => void;
      onDropdownSelect?: (value: string) => void;
      dropdownOptions?: string[];
    }
  | {
      showSearchBar?: false;
      onSearch?: never;
      onDropdownSelect?: never;
      dropdownOptions?: never;
    };

    export type ActionsProps =
    | {
        showActions: true;
        actions: Action[];
      }
    | {
        showActions?: false;
        actions?: never;
      };
  
export type AddButtonProps =
  | {
      showAddButton: true;
      onAddClick: () => void;
    }
  | {
      showAddButton?: false;
      onAddClick?: never;
    };

    export type CrudDataGridProps = {
      data: T[];
      columns: DataGridColumn<T>[];
      showSearchBar?: boolean;
      haveChildrens?: boolean;
      childrens?: React.ReactNode;
      showAddButton?: boolean;
      onAddClick?: () => void;
      onSearch?: (searchValue: string) => void;
      onDropdownSelect?: (optionValue: string) => void;
      dropdownOptions?: string[];
    } & ActionsProps & {
      isModal?: boolean;
      modalComponent?: React.ReactNode;
      onModalOpen?: (rowIndex: number, row: T) => void;
      isComponent?: boolean;
      componentToRender?: React.ReactNode;
      onComponentRender?: (rowIndex: number, row: T) => void;
      showSearchInput?: boolean;
      showDropdown?: boolean;
      totalPages: number;
      currentPage: number;
      onPageChange: (page: number) => void;
      pageSize?: number;
      actionsPosition?: string; // New prop to choose where "actions" go
      addButtonLabel?: string; // Optional label for the add button
    };

  export type SearchWithDropdownProps = {
    placeholder?: string;
    dropdownOptions: string[];
    onSearch: (value: string) => void;
    onDropdownSelect: (value: string) => void;
    showSearchInput?: boolean; // Add this
    showDropdown?: boolean; // Add this
  };


// After (added "component?: React.ReactNode; icon is optional if you pass component)
export type ActionButtonsProps = {
  actions: Action[];
  // Notice how onActionClick has the `action: string` signature
  onActionClick?: (action: string, rowIndex?: number) => void;
};

export type T = {
  [key: string]: string | number | boolean | null | object;
};
/**
 * An Option type for the select
 */
export type OptionType = {
  value: string | number;
  label: string;
};


export type User = {
  authUserId?: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  phone?: string;
  role?: Role; 
  roleId?:number;
  branch?: Branch; 
  branchId?:number;
  isTwoFactorEnabled?: boolean;
  passwordResetToken?: string;
  userId?: number;
  permissions?: string[];
  areaId?: number;
};


