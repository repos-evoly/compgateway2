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
  
  // types.d.ts or wherever your types are:
export interface ConfirmationModalProps<T extends Record<string, unknown>> {
  isOpen: boolean;
  onClose: () => void;
  /** Add onConfirm so the parent can pass a callback */
  onConfirm?: () => void;

  // existing props:
  metadata: Record<string, any>;
  additionalData?: T;
  excludedFields?: string[];
}



  export type FormTypeSelectProps = {
    selectedFormType: string;
    onFormTypeChange: (formType: string) => void;
  };

  export type ContinueButtonProps = {
    onClick: (data: InternalFormValues) => void;
    touchedFields: { [key: string]: boolean }; // Object of fields to mark as touched
  };
  


  export type DropdownOption = {
    value: string ;
    label: string;
  };
  


export type CrudDataGridHeaderProps = {
  onSearch?: (value: string) => void;
  onDropdownSelect?: (value: string ) => void;
  dropdownOptions?: DropdownOption[];
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
      onDropdownSelect?: (optionValue: string ) => void;
      dropdownOptions?: DropdownOption[];
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
      onDropdownSelect?: (optionValue: string ) => void;
      dropdownOptions?: DropdownOption[];
      loading?: boolean;
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
    dropdownOptions: DropdownOption[];

    // changed from (value: string) to (value: string | number)
    onSearch: (value: string) => void;
    onDropdownSelect: (value: string ) => void;
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



/**
 * Represents the complete user object returned by /users/by-auth/{id}.
 * Adjust field types (string vs. string|null, etc.) if needed.
 */
export type DetailedUser = {
  companyCode?: string | null;
  userId: number;
  authUserId: number;
  username: string | null;
  companyId: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  roleId: number;
  areaId: number;
  isTwoFactorEnabled: boolean;
  passwordResetToken: string | null;
  permissions: string[];
  accounts: string[];
  servicePackageId: number;
  companyStatus?: string;
  companyStatusMessage?: string;
  isCompanyAdmin?: boolean;

  enabledTransactionCategories:string[];
  isActive?: boolean;

  /** The 'role' object from the API. */
  role: {
    id: number;
    nameAR: string;
    nameLT: string;
    description: string;
    /** The nested 'users' array. Each item is basically a "sub-user" object. */
    users: {
      id: number;
      authUserId: number;
      companyId: string | null;
      RegistrationStatus: string | null;
      kycBranchId: number | null;
      kycLegalCompanyName: string | null;
      kycLegalCompanyNameLt: string | null;
      kycMobile: string | null;
      kycNationality: string | null;
      kycCity: string | null;
      RegistrationStatusMessage: string | null;
      kycRequestedAt: string | null;
      kycReviewedAt: string | null;
      firstName: string | null;
      lastName: string | null;
      email: string | null;
      phone: string | null;
      roleId: number;
      role: unknown; // or null
      isCompanyAdmin: boolean;
      servicePackageId: number;
      servicePackage: unknown; // or null
      auditLogs: unknown[];
      bankAccounts: unknown[];
      userRolePermissions: unknown[];
      transferRequests: unknown[];
      createdAt: string;
      updatedAt: string;
    }[];
    rolePermissions: unknown[];
    userRolePermissions: unknown[];
    createdAt: string;
    updatedAt: string;
  };
};


