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
