//
// types.ts
//

/**
 * The shape of data used to submit a new employee form, e.g. a "create" payload.
 */
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

/**
 * The main "Employee" shape used previously in your code.
 */
export type Employee = {
  authUserId?: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  phone?: string;
  role?: Role; 
  roleId?: number;
  branch?: Branch; 
  branchId?: number;
  isTwoFactorEnabled?: boolean;
  passwordResetToken?: string;
  userId?: number;
  permissions?: string[];
  areaId?: number;
};

/**
 * A "Role" definition used with the older Employee shape.
 */
export type Role = {
  id?: number;
  nameAR?: string;
  nameLT?: string;
  description?: string;
  users?: unknown[];
  rolePermissions?: unknown[];
  userRolePermissions?: unknown[];
};

/**
 * A "Branch" definition used with the older Employee shape.
 */
export type Branch = {
  id?: number;
  name?: string;
  address?: string;
  phone?: string;
  cabbn?: string; // new field from the API
  areaId?: number | null; // can be null or a number
};


export type CompanyEmployee = {
  id: number;
  authUserId: number;
  companyCode: string;
  firstName: string;
  lastName: string;
  username?: string;
  email: string;
  phone: string;
  roleId: number;
  permissions: string[];

};


export type CreateEmployeePayload = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  roleId: number;
};
