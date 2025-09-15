// app/employees/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import UsersForm from "./components/UsersForm";
import { getEmployees, createEmployee } from "./services";
import type { EmployeesFormPayload, CompanyEmployee } from "./types";
import { FaLock } from "react-icons/fa";
import type { Action } from "@/types";
import { useRouter } from "next/navigation";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import { useTranslations } from "next-intl";

/* --------------------------------------------------
 * Helpers: read & normalize permissions from cookies
 * + isCompanyAdmin override for showing the Lock action
 * -------------------------------------------------- */
const COOKIE_CANDIDATES: ReadonlyArray<string> = [
  "permissions",
  "userPermissions",
  "claims",
  "scopes",
  "perms",
];

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function tryParseStringArray(value: string): string[] | null {
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed) && parsed.every((v) => typeof v === "string")) {
      return parsed as string[];
    }
  } catch {
    // ignore parse errors
  }
  return null;
}

function readPermissionsFromCookies(): Set<string> {
  for (const key of COOKIE_CANDIDATES) {
    const raw = Cookies.get(key);
    if (!raw) continue;

    const decoded = safeDecodeURIComponent(raw);

    const parsed = tryParseStringArray(decoded);
    if (parsed) return new Set(parsed.map((p) => p.toLowerCase()));

    // Fallback: handle CSV-ish or bracketed ["A","B"] forms
    const cleaned = decoded.replace(/^\s*\[|\]\s*$/g, "");
    const csv = cleaned
      .split(",")
      .map((s) => s.trim().replace(/^"+|"+$/g, ""))
      .filter((s) => s.length > 0);
    if (csv.length > 0) return new Set(csv.map((p) => p.toLowerCase()));
  }
  return new Set<string>();
}

/** Robust boolean cookie reader for isCompanyAdmin */
function readIsCompanyAdminFromCookie(): boolean {
  const raw = Cookies.get("isCompanyAdmin");
  if (!raw) return false;
  const decoded = safeDecodeURIComponent(raw).trim().toLowerCase();

  if (decoded === "true" || decoded === "1") return true;
  if (decoded === "false" || decoded === "0") return false;

  try {
    const parsed: unknown = JSON.parse(decoded);
    if (typeof parsed === "boolean") return parsed;
    if (typeof parsed === "string") {
      const s = parsed.trim().toLowerCase();
      if (s === "true" || s === "1") return true;
      if (s === "false" || s === "0") return false;
    }
  } catch {
    // ignore parse errors
  }
  return false;
}

export default function EmployeesPage() {
  /* --------------------------------------------------
   * Local state
   * -------------------------------------------------- */
  const [employees, setEmployees] = useState<CompanyEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // Permission flags
  const [canAddUser, setCanAddUser] = useState(false);
  const [canEditUser, setCanEditUser] = useState(false);
  const [isCompanyAdmin, setIsCompanyAdmin] = useState(false); // NEW

  /* Modal state */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const t = useTranslations("employees");
  const router = useRouter();

  /* --------------------------------------------------
   * Permissions bootstrap
   * -------------------------------------------------- */
  useEffect(() => {
    const perms = readPermissionsFromCookies();
    setCanAddUser(perms.has("companycanadduser"));
    setCanEditUser(perms.has("companycanedituser"));
    setIsCompanyAdmin(readIsCompanyAdminFromCookie()); // NEW
  }, []);

  /* --------------------------------------------------
   * Data helpers
   * -------------------------------------------------- */
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const allEmployees = await getEmployees();
      setEmployees(allEmployees);
      setTotalPages(Math.max(1, Math.ceil(allEmployees.length / pageSize)));
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "An unknown error occurred.";
      setModalTitle("Fetch Error");
      setModalMessage(msg);
      setModalSuccess(false);
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Compute the data for the current page
  const pagedEmployees = employees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const rowData = pagedEmployees.map((emp) => ({
    ...emp,
    permissions: emp.permissions.join(", "),
  }));

  const columns = [
    { key: "id", label: t("id") },
    { key: "firstName", label: t("firstName") },
    { key: "lastName", label: t("lastName") },
    { key: "email", label: t("email") },
    { key: "phone", label: t("phone") },
    { key: "roleId", label: t("role") },
    { key: "permissions", label: t("permissions") },
    {
      key: "isActive",
      label: t("status"),
      renderCell: (row: unknown) => {
        const r = row as CompanyEmployee;
        const isActive = r.isActive !== undefined ? r.isActive : true;
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              isActive
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {isActive ? t("active") : t("inactive")}
          </span>
        );
      },
    },
  ];

  const actions: Action[] = useMemo(
    () => [
      {
        name: "permissions",
        tip: t("editPermissions"),
        icon: <FaLock />,
        onClick: (row) => {
          const r = row as CompanyEmployee;
          router.push(`/users/permissions/${r.id}/${r.roleId}`);
        },
      },
    ],
    [router, t]
  );

  /* --------------------------------------------------
   * Handlers
   * -------------------------------------------------- */
  const handleAddClick = () => {
    setShowForm(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFormSubmit = async (values: EmployeesFormPayload) => {
    try {
      const newEmployee = await createEmployee({
        username: values.username || "",
        firstName: values.firstName || "",
        lastName: values.lastName || "",
        email: values.email || "",
        password: values.password || "",
        phone: values.phone || "",
        roleId: values.roleId || 0,
      });

      setEmployees((prev) => [...prev, newEmployee]);

      setModalTitle("Employee Created");
      setModalMessage("The employee was created successfully.");
      setModalSuccess(true);
      setModalOpen(true);

      setShowForm(false);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "An unknown error occurred.";
      setModalTitle("Creation Error");
      setModalMessage(errorMsg);
      setModalSuccess(false);
      setModalOpen(true);
    }
  };

  const handleModalClose = () => setModalOpen(false);
  const handleModalConfirm = () => setModalOpen(false);

  /* --------------------------------------------------
   * Derived props for CrudDataGrid
   * If isCompanyAdmin === true → force-show the actions column
   * (only for the Edit Permissions button appearance).
   * Other conditions remain as-is.
   * -------------------------------------------------- */
  const shouldShowActions = isCompanyAdmin || canEditUser;

  const gridBaseProps = {
    data: rowData,
    columns,
    currentPage,
    totalPages,
    onPageChange: handlePageChange,
    showSearchBar: false,
    showSearchInput: false,
    showDropdown: false,
    loading,
    canEdit: canEditUser, // unchanged
  } as const;

  const gridAddProps = canAddUser
    ? ({ showAddButton: true as const, onAddClick: handleAddClick } as const)
    : ({ showAddButton: false as const } as const);

  const gridActionProps = shouldShowActions
    ? ({ showActions: true as const, actions } as const)
    : ({ showActions: false as const } as const);

  /* --------------------------------------------------
   * JSX
   * -------------------------------------------------- */
  return (
    <div className="p-4 space-y-8">
      {!showForm && (
        <CrudDataGrid
          {...gridBaseProps}
          {...gridAddProps}
          {...gridActionProps}
        />
      )}

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl w-1/2 mx-auto">
          <UsersForm
            onSubmit={handleFormSubmit}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <ErrorOrSuccessModal
        isOpen={modalOpen}
        isSuccess={modalSuccess}
        title={modalTitle}
        message={modalMessage}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
      />
    </div>
  );
}
