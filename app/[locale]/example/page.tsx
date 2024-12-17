"use client";

import React from "react";
import CrudDataGrid from "../../components/CrudDataGrid/CrudDataGrid";
import { data, columns, actions, dropdownOptions } from "./data";

const Page = () => {

  const handleSearch = (value: string) => {
    console.log("Search:", value);
  };

  const handleDropdownSelect = (value: string) => {
    console.log("Dropdown Selected:", value);
  };

  const handleAddClick = () => {
    console.log("Add Button Clicked");
  };

  return (
    <div className="p-4">
      <CrudDataGrid
        onSearch={handleSearch}
        onDropdownSelect={handleDropdownSelect}
        dropdownOptions={dropdownOptions}
        showAddButton={true}
        onAddClick={handleAddClick}
        showSearchBar={true} // Toggle this to true/false
        showActions={true}
        actions={actions}
        columns={columns}
        data={data}
      />
    </div>
  );
};

export default Page;
