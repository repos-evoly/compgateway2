"use client";
import React, { useEffect, useState } from "react";
import { FiX, FiSearch, FiChevronDown } from "react-icons/fi";
import type { SearchWithDropdownProps, DropdownOption } from "@/types";

const SearchWithDropdown: React.FC<SearchWithDropdownProps> = ({
  placeholder = "ابحث من خلال",
  dropdownOptions,
  onSearch,
  onDropdownSelect,
  showDropdown,
  showSearchInput,
}) => {
  const [searchValue, setSearchValue] = useState("");
  // We'll store just the selected *value* (string | number) here
  const [selectedValue, setSelectedValue] = useState<string>(
    dropdownOptions?.[0]?.value ?? ""
  );

  // On mount or if `dropdownOptions` changes, we can notify parent about the default
  useEffect(() => {
    if (showDropdown && onDropdownSelect && dropdownOptions?.length) {
      onDropdownSelect(selectedValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDropdown]);

  const handleClear = () => setSearchValue("");

  const handleSearch = () => {
    onSearch(searchValue);
  };

  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedValue(value);
    onDropdownSelect(value);
  };

  return (
    <div className="flex items-center h-12 w-max bg-white/30 rounded px-1 text-gray-600">
      {showDropdown && (
        <div className="relative flex items-center h-full">
          <select
            value={selectedValue}
            onChange={handleDropdownChange}
            className="appearance-none bg-transparent text-sm outline-none cursor-pointer pr-6 pl-2 h-full"
          >
            {dropdownOptions.map((option: DropdownOption, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FiChevronDown
            size={18}
            className="absolute right-2 text-gray-500 pointer-events-none"
          />
        </div>
      )}

      {showDropdown && showSearchInput && (
        <div className="h-6 w-px bg-gray-300 mx-2" />
      )}

      {showSearchInput && (
        <div className="flex items-center flex-1 h-full">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault(); // Prevent form submission on Enter
                handleSearch();
              }
            }}
            placeholder={placeholder}
            className="bg-transparent outline-none flex-1 text-sm placeholder-gray-500 py-0 h-full"
          />

          <button
            type="button"
            onClick={handleSearch}
            className="p-1 text-gray-500 hover:text-gray-700"
            aria-label="Search"
          >
            <FiSearch size={18} />
          </button>
        </div>
      )}

      {showSearchInput && <div className="h-6 w-px bg-gray-300 mx-2" />}

      {showSearchInput && (
        <button
          type="button"
          onClick={handleClear}
          className="p-1 text-gray-500 hover:text-gray-700"
          aria-label="Clear search"
        >
          <FiX size={18} />
        </button>
      )}
    </div>
  );
};

export default SearchWithDropdown;
