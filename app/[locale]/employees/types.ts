
export type EmployeesFormPayload = {
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    password?: string;
    roleId?: number;
    branchId?: number;
    phone?: string;
  };


export type Employee = {
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
  

  export type Role = {
    id?: number;
    nameAR?: string;
    nameLT?: string;
    description?: string;
    users?: unknown[];
    rolePermissions?: unknown[];
    userRolePermissions?: unknown[];
  };

  
  export type Branch = {
    id?: number;
    name?: string;
    address?: string;
    phone?: string;
    cabbn?: string; // new field from the API
    areaId?: number | null; // can be null or a number
  };
  