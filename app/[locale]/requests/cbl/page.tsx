"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import CBLForm from "./components/CBLForm";
import { getCblRequests } from "./service";
import { TCBLValues } from "./types";

const CBLListPage: React.FC = () => {
  const t = useTranslations("cblForm");

  /* ------------ state ------------ */
  const [rows, setRows] = useState<TCBLValues[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState("partyName");
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);

  /* ------------ fetch list ------------ */
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getCblRequests(page, limit, searchTerm, searchBy);
        setRows(res.data);
        setTotalPages(res.totalPages);
      } catch (e) {
        console.error("fetch CBLs", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [page, limit, searchTerm, searchBy]);

  /* ------------ form callbacks ------------ */
  const onFormSave = (created: TCBLValues) => {
    // add new row on top and close form
    setRows((prev) => [created, ...prev]);
    setShowForm(false);
  };
  const onFormCancel = () => setShowForm(false);

  /* ------------ grid columns ------------ */
  const cols = [
    { key: "partyName", label: t("partyName") },
    { key: "legalRepresentative", label: t("legalRepresentative") },
    { key: "mobile", label: t("mobile") },
    { key: "address", label: t("address") },
    { key: "status", label: t("status") },
  ];

  const dropdownOptions = [
    { value: "partyName", label: t("partyName") },
    { value: "status", label: t("status") },
  ];

  /* ------------ render ------------ */
  return (
    <div className="p-4">
      {showForm ? (
        <CBLForm onSubmit={onFormSave} onCancel={onFormCancel} />
      ) : (
        <CrudDataGrid
          data={rows}
          columns={cols}
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          showSearchInput
          showDropdown
          showSearchBar
          dropdownOptions={dropdownOptions}
          onDropdownSelect={(v) => {
            setSearchBy(v);
            setPage(1);
          }}
          onSearch={(term) => {
            setSearchTerm(term);
            setPage(1);
          }}
          showAddButton
          onAddClick={() => setShowForm(true)}
          loading={loading}
        />
      )}
    </div>
  );
};

export default CBLListPage;
