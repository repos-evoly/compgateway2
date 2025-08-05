"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Formik, Form } from "formik";
import {
  getPermissionsByUserId,
  getCompanyPermissions,
  updateEmployeePermissions,
} from "../../../services";
import type { CompanyPermissions, UserPermissions } from "../../../types";
import { useLocale } from "next-intl";
import LoadingPage from "@/app/components/reusable/Loading";
import PermissionsContainer from "../../../components/PermissionsContainer";
import BackButton from "@/app/components/reusable/BackButton";

import {
  FiSave,
  FiShield,
  FiEye,
  FiSettings,
  FiUsers,
  FiCreditCard,
  FiFileText,
  FiDatabase,
  FiLock,
  FiBarChart2,
} from "react-icons/fi";
import SubmitButton from "@/app/components/FormUI/SubmitButton";

/* ---------- util types ---------- */
type GroupKey = "dashboard" | "financial" | "employees" | "requests" | "system";

export default function PermissionsPage() {
  /* ---------- route params ---------- */
  const { userId, roleId } = useParams() as { userId: string; roleId: string };
  const numericRoleId = Number(roleId);

  /* ---------- locale ---------- */
  const locale = useLocale();
  const isArabic = locale === "ar";

  /* ---------- data state ---------- */
  const [companyPerms, setCompanyPerms] = useState<CompanyPermissions[]>([]);
  const [userPerms, setUserPerms] = useState<UserPermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ---------- data fetch ---------- */
  useEffect(() => {
    async function fetchAll() {
      try {
        const [companyList, userList] = await Promise.all([
          getCompanyPermissions(),
          getPermissionsByUserId(userId),
        ]);
        setCompanyPerms(companyList);
        setUserPerms(userList);
      } catch (err) {
        console.error("Error loading permissions:", err);
      } finally {
        setLoading(false);
      }
    }
    if (userId) void fetchAll();
  }, [userId]);

  if (loading) return <LoadingPage />;

  /* ---------- Formik initial values ---------- */
  const initialValues: Record<string, boolean> = {};
  companyPerms.forEach((cp) => {
    const assigned = userPerms.find((u) => u.permissionId === cp.id);
    initialValues[`perm_${cp.id}`] = Boolean(assigned?.hasPermission);
  });

  /* ---------- grouping ---------- */
  const groupPermissions = (perms: CompanyPermissions[]) => {
    const groups: Record<GroupKey, CompanyPermissions[]> = {
      dashboard: [],
      financial: [],
      employees: [],
      requests: [],
      system: [],
    };

    perms.forEach((perm) => {
      const name = perm.nameEn.toLowerCase();
      if (name.includes("dashboard") || name.includes("view")) {
        groups.dashboard.push(perm);
      } else if (
        name.includes("transfer") ||
        name.includes("currency") ||
        name.includes("statement")
      ) {
        groups.financial.push(perm);
      } else if (name.includes("employee") || name.includes("representative")) {
        groups.employees.push(perm);
      } else if (name.includes("request")) {
        groups.requests.push(perm);
      } else {
        groups.system.push(perm);
      }
    });

    return groups;
  };

  const grouped = groupPermissions(companyPerms);

  /* ---------- icons ---------- */
  const groupIcons: Record<GroupKey, React.ReactNode> = {
    dashboard: <FiBarChart2 className="h-5 w-5" />,
    financial: <FiCreditCard className="h-5 w-5" />,
    employees: <FiUsers className="h-5 w-5" />,
    requests: <FiFileText className="h-5 w-5" />,
    system: <FiSettings className="h-5 w-5" />,
  };

  const groupTitles: Record<GroupKey, string> = {
    dashboard: isArabic ? "لوحة التحكم" : "Dashboard",
    financial: isArabic ? "العمليات المالية" : "Financial Operations",
    employees: isArabic ? "إدارة الموظفين" : "Employee Management",
    requests: isArabic ? "الطلبات" : "Requests",
    system: isArabic ? "النظام" : "System",
  };

  const iconMap: Record<string, React.ReactNode> = {
    CompanyCanViewDashboard: <FiEye className="h-4 w-4" />,
    CompanyCanStatementOfAccounts: <FiFileText className="h-4 w-4" />,
    CompanyCanTransfer: <FiCreditCard className="h-4 w-4" />,
    CompanyCanRequest: <FiFileText className="h-4 w-4" />,
    CompanyCanCurrency: <FiDatabase className="h-4 w-4" />,
    CompanyCanInternalTransfer: <FiCreditCard className="h-4 w-4" />,
    CompanyCanExternalTransfer: <FiCreditCard className="h-4 w-4" />,
    CompanyCanAddEmployee: <FiUsers className="h-4 w-4" />,
    CompanyCanEditEmployee: <FiUsers className="h-4 w-4" />,
    CompanyCanRepresentatives: <FiShield className="h-4 w-4" />,
    default: <FiLock className="h-4 w-4" />,
  };

  /* ---------- submit ---------- */
  const onSubmit = async (values: Record<string, boolean>) => {
    setIsSubmitting(true);
    const enabled = Object.entries(values)
      .filter(([, v]) => v)
      .map(([k]) => ({
        permissionId: Number(k.replace("perm_", "")),
        roleId: numericRoleId,
      }));

    try {
      await updateEmployeePermissions(userId, enabled);
    } catch (err) {
      console.error("Failed to update permissions:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <BackButton isEditing fallbackPath="/users" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isArabic ? "صلاحيات الموظف" : "Employee Permissions"}
            </h1>
            <p className="text-sm text-gray-600">
              {isArabic
                ? "إدارة صلاحيات الوصول للموظف"
                : "Manage employee access permissions"}
            </p>
          </div>
        </div>

        <Formik initialValues={initialValues} onSubmit={onSubmit}>
          {({ values, setFieldValue }) => (
            <Form>
              <div className="grid gap-6 lg:grid-cols-2">
                {(
                  Object.entries(grouped) as [GroupKey, CompanyPermissions[]][]
                ).map(([key, perms]) =>
                  perms.length ? (
                    <PermissionsContainer
                      key={key}
                      title={groupTitles[key]}
                      icon={groupIcons[key]}
                      permissions={perms}
                      values={values}
                      setFieldValue={setFieldValue}
                      isArabic={isArabic}
                      iconMap={iconMap}
                      search={perms.length >= 25}
                    />
                  ) : null
                )}
              </div>

              {/* Footer */}
              <div className="mt-8 flex justify-end">
                <SubmitButton
                  title={isArabic ? "حفظ الصلاحيات" : "Save Permissions"}
                  Icon={FiSave}
                  color="success-main"
                  isSubmitting={isSubmitting}
                  disabled={false}
                />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
