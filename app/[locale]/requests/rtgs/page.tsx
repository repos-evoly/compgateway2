"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import RTGSForm from "./components/RTGSForm";

// Types & services
import { TRTGSValues, TRTGSFormValues } from "./types";
import { getRtgsRequests } from "./services";

const RTGSListPage: React.FC = () => {
  const t = useTranslations("RTGSForm");

  // Data from the API
  const [data, setData] = useState<TRTGSValues[]>([]);
  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const limit = 10;

  // Toggle to show/hide local "Add" form
  const [showForm, setShowForm] = useState(false);

  // Fetch /rtgsrequests on mount / page changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getRtgsRequests(currentPage, limit);
        // { data, page, limit, totalPages, totalRecords }
        setData(response.data);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error("Failed to fetch RTGS requests:", error);
      }
    };

    fetchData();
  }, [currentPage, limit]);

  // Columns we want to display in the grid
  const columns = [
    { key: "refNum", label: t("refNum") },
    { key: "date", label: t("date") },
    { key: "paymentType", label: t("payType") },
    { key: "applicantName", label: t("name") },
    { key: "beneficiaryName", label: t("benName") },
    { key: "amount", label: t("amount") },
  ];

  /**
   * Build row data:
   *  - Copy all fields from the API item (so we keep `id`, etc.)
   *  - Overwrite `refNum` and `date` with a user-friendly string
   */
  const rowData = data.map((item) => ({
    ...item, // keeps id, userId, address, etc.
    refNum: new Date(item.refNum).toLocaleDateString(), // display string
    date: new Date(item.date).toLocaleDateString(), // display string
    // paymentType, applicantName, beneficiaryName, amount, etc. remain as is
  }));

  // Show local RTGS form
  const handleAddClick = () => {
    setShowForm(true);
  };

  // Handle form submit => local add
  const handleFormSubmit = (values: TRTGSFormValues) => {
    console.log("RTGS form submitted locally:", values);

    // Convert from form's Date => API string
    const newRecord: TRTGSValues = {
      // You may generate a dummy ID or leave undefined
      id: Math.floor(Math.random() * 100000),
      refNum: values.refNum.toISOString(),
      date: values.date.toISOString(),
      paymentType: values.paymentType,
      accountNo: values.accountNo,
      applicantName: values.applicantName,
      address: values.address,
      beneficiaryName: values.beneficiaryName,
      beneficiaryAccountNo: values.beneficiaryAccountNo,
      beneficiaryBank: values.beneficiaryBank,
      branchName: values.branchName,
      amount: values.amount,
      remittanceInfo: values.remittanceInfo,
      invoice: values.invoice,
      contract: values.contract,
      claim: values.claim,
      otherDoc: values.otherDoc,
    };

    // Just prepend to local array
    setData((prev) => [newRecord, ...prev]);
    setShowForm(false);
  };

  // Cancel => hide form
  const handleFormCancel = () => {
    setShowForm(false);
  };

  // Example double-click (if your CrudDataGrid calls an onRowDoubleClick):
  // const handleRowDoubleClick = (rowIndex: number) => {
  //   const row = rowData[rowIndex];
  //   console.log("Double-clicked row with ID:", row.id);
  //   // router.push(`/rtgs/${row.id}`);
  // };

  return (
    <div className="p-4">
      {showForm ? (
        <RTGSForm onSubmit={handleFormSubmit} onCancel={handleFormCancel} />
      ) : (
        <CrudDataGrid
          data={rowData} // includes all fields, only columns are displayed
          columns={columns}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          showAddButton
          onAddClick={handleAddClick}
        />
      )}
    </div>
  );
};

export default RTGSListPage;
