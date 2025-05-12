"use client";
import { SearchWithDropdownProps } from "@/types";
import React, { useState, useEffect } from "react";
import { FiX, FiSearch, FiChevronDown } from "react-icons/fi";

const SearchWithDropdown: React.FC<SearchWithDropdownProps> = ({
  placeholder = "ابحث من خلال",
  dropdownOptions,
  onSearch,
  onDropdownSelect,
  showDropdown,
  showSearchInput,
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [selectedOption, setSelectedOption] = useState(dropdownOptions[0]); // Set initial value to the first option

  useEffect(() => {
    if (showDropdown && onDropdownSelect) {
      onDropdownSelect(selectedOption); // Trigger onDropdownSelect with initial value
    }
  }, [showDropdown, onDropdownSelect, selectedOption]);

  const handleClear = () => setSearchValue("");
  const handleSearch = () => onSearch(searchValue);

  return (
    <div className="flex items-center h-12 w-max bg-white/30 rounded px-1 text-gray-600">
      {showDropdown && (
        <div className="relative flex items-center h-full">
          <select
            value={selectedOption}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedOption(value);
              onDropdownSelect(value);
            }}
            className="appearance-none bg-transparent text-sm outline-none cursor-pointer pr-6 pl-2 h-full"
          >
            {dropdownOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
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
            type="button" // Ensure this button doesn't submit a form
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
