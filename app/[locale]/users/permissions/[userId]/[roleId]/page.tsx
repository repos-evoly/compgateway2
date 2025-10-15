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
  FiSearch,
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
  const [searchTerm, setSearchTerm] = useState("");

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

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filterBySearch = (perm: CompanyPermissions) => {
    if (!normalizedSearch) return true;

    const nameEn = perm.nameEn?.toLowerCase() ?? "";
    const nameAr = perm.nameAr?.toLowerCase() ?? "";
    const description = perm.description?.toLowerCase() ?? "";

    return (
      nameEn.includes(normalizedSearch) ||
      nameAr.includes(normalizedSearch) ||
      description.includes(normalizedSearch)
    );
  };

  const groupedEntries = Object.entries(grouped) as [
    GroupKey,
    CompanyPermissions[],
  ][];

  const filteredGroups: Array<{
    key: GroupKey;
    perms: CompanyPermissions[];
    visible: CompanyPermissions[];
  }> = groupedEntries.map(([key, perms]) => ({
    key,
    perms,
    visible: perms.filter(filterBySearch),
  }));

  const isSearching = normalizedSearch.length > 0;
  const hasVisiblePermissions = filteredGroups.some(
    ({ visible }) => visible.length > 0
  );

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
    /* ---------- SCROLLABLE WRAPPER (added overflow-y-auto) ---------- */
    <div className="min-h-screen overflow-y-auto bg-gray-50/50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <BackButton isEditing fallbackPath={`/${locale}/users`} />
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
              <div className="mb-6 flex justify-between">
                <div
                  className={`relative w-full md:w-96 ${
                    isArabic ? "md:ml-auto" : ""
                  }`}
                >
                  <FiSearch
                    className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 ${
                      isArabic ? "right-3" : "left-3"
                    }`}
                  />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") event.preventDefault();
                    }}
                    placeholder={
                      isArabic
                        ? "ابحث عن صلاحية..."
                        : "Search permissions..."
                    }
                    className={`w-full rounded-md border border-gray-300 bg-white py-2 ${
                      isArabic ? "pr-9 pl-3 text-right" : "pl-9 pr-3"
                    } text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    dir={isArabic ? "rtl" : "ltr"}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {filteredGroups.map(({ key, perms, visible }) => {
                  const displayPermissions = isSearching ? visible : perms;
                  if (!displayPermissions.length) return null;

                  const enabledCount = perms.reduce(
                    (acc, perm) =>
                      values[`perm_${perm.id}`] ? acc + 1 : acc,
                    0
                  );

                  return (
                    <PermissionsContainer
                      key={key}
                      title={groupTitles[key]}
                      icon={groupIcons[key]}
                      permissions={displayPermissions}
                      values={values}
                      setFieldValue={setFieldValue}
                      isArabic={isArabic}
                      iconMap={iconMap}
                      totalCount={perms.length}
                      enabledCount={enabledCount}
                    />
                  );
                })}
              </div>

              {isSearching && !hasVisiblePermissions && (
                <p className="mt-6 text-center text-sm text-gray-500">
                  {isArabic
                    ? "لم يتم العثور على صلاحيات مطابقة"
                    : "No permissions match your search."}
                </p>
              )}

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
