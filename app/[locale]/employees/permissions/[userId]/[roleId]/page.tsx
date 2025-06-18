"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // useParams hook
import { Formik, Form } from "formik";
import {
  getPermissionsByUserId,
  getCompanyPermissions,
  updateEmployeePermissions,
} from "../../../services";
import type { CompanyPermissions, UserPermissions } from "../../../types";
import SettingsBox from "@/app/components/reusable/SettingsBox";
import SwitchWrapper from "@/app/components/FormUI/Switch";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import FormHeader from "@/app/components/reusable/FormHeader";
import {
  FaLock,
  FaEye,
  FaUserShield,
  FaCog,
  FaTrashAlt,
  FaChartPie,
} from "react-icons/fa";
import BackButton from "@/app/components/reusable/BackButton";
import { useTranslations } from "next-intl";

export default function PermissionsPage() {
  // Read the dynamic route segments from the URL
  const { userId, roleId } = useParams() as { userId: string; roleId: string };
  const numericRoleId = Number(roleId);

  const [companyPerms, setCompanyPerms] = useState<CompanyPermissions[]>([]);
  const [userPerms, setUserPerms] = useState<UserPermissions[]>([]);
  const [loading, setLoading] = useState(true);

  const t = useTranslations("employees.permissionsPage");

  console.log("PermissionsPage route params:", { userId, roleId });

  // Fetch master list + user's current perms
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

    if (userId) {
      fetchAll();
    }
  }, [userId]);

  if (loading) {
    return <div className="p-4">Loading permissions…</div>;
  }

  // Prepare Formik initial values
  const initialValues: Record<string, boolean> = {};
  companyPerms.forEach((cp) => {
    const assigned = userPerms.find((u) => u.permissionId === cp.id);
    initialValues[`perm_${cp.id}`] = Boolean(assigned?.hasPermission);
  });

  // Icon mapping
  const iconMap: Record<string, React.ReactNode> = {
    CompanyCanViewDashboard: <FaEye />,
    CompanyCanStatementOfAccounts: <FaCog />,
    CompanyCanTransfer: <FaChartPie />,
    CompanyCanRequest: <FaCog />,
    CompanyCanCurrency: <FaLock />,
    CompanyCanInternalTransfer: <FaCog />,
    CompanyCanExternalTransfer: <FaTrashAlt />,
    CompanyCanAddEmployee: <FaUserShield />,
    CompanyCanEditEmployee: <FaCog />,
  };

  return (
    <div className="p-4">
      <Formik
        initialValues={initialValues}
        enableReinitialize
        onSubmit={async (values) => {
          const enabledPermissions = Object.entries(values)
            .filter(([, isEnabled]) => isEnabled)
            .map(([key]) => ({
              permissionId: Number(key.replace("perm_", "")),
              roleId: numericRoleId,
            }));

          if (enabledPermissions.length === 0) {
            console.log("No permissions to update.");
            return;
          }

          try {
            await updateEmployeePermissions(userId, enabledPermissions);
            console.log("Updated permissions:", enabledPermissions);
          } catch (err) {
            console.error("Failed to update permissions:", err);
          }
        }}
      >
        {({ isSubmitting }) => (
          <>
            <FormHeader>
              <div className="flex">
                <BackButton fallbackPath="/employees" isEditing />
                <SubmitButton
                  title={t("save")}
                  color="info-dark"
                  fullWidth={false}
                  isSubmitting={isSubmitting}
                />
              </div>
            </FormHeader>

            <Form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              {companyPerms.map((cp) => (
                <SettingsBox
                  key={cp.id}
                  title={t(cp.name)}
                  description=""
                  icon={iconMap[cp.name] ?? <FaLock />}
                  controlType="switch"
                  control={<SwitchWrapper name={`perm_${cp.id}`} label="" />}
                />
              ))}
            </Form>
          </>
        )}
      </Formik>
    </div>
  );
}
