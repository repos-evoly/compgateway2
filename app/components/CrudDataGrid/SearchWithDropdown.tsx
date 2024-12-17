import React, { useState } from "react";
import { FiX, FiSearch, FiChevronDown } from "react-icons/fi";

type SearchWithDropdownProps = {
  placeholder?: string;
  dropdownOptions: string[];
  onSearch: (value: string) => void;
  onDropdownSelect: (value: string) => void;
};

const SearchWithDropdown: React.FC<SearchWithDropdownProps> = ({
  placeholder = "ابحث من خلال",
  dropdownOptions,
  onSearch,
  onDropdownSelect,
}) => {
  const [searchValue, setSearchValue] = useState("");

  const handleClear = () => setSearchValue("");
  const handleSearch = () => onSearch(searchValue);

  return (
    <div className="flex items-center h-full w-max bg-white/30 rounded px-1 text-gray-600">
      {/* Dropdown */}
      <div className="relative flex items-center h-full">
        <select
          onChange={(e) => onDropdownSelect(e.target.value)}
          className="appearance-none bg-transparent text-sm outline-none cursor-pointer pr-6 pl-2 h-full"
        >
          <option value="" className="text-gray-400">
            {dropdownOptions[0]}
          </option>
          {dropdownOptions.slice(1).map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
        {/* Dropdown Arrow Icon */}
        <FiChevronDown
          size={18}
          className="absolute right-2 text-gray-500 pointer-events-none"
        />
      </div>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-300 mx-2" />

      {/* Search Input and Icon */}
      <div className="flex items-center flex-1 h-full">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={placeholder}
          className="bg-transparent outline-none flex-1 text-sm placeholder-gray-500 py-0 h-full"
        />
        <button
          onClick={handleSearch}
          className="p-1 text-gray-500 hover:text-gray-700"
          aria-label="Search"
        >
          <FiSearch size={18} />
        </button>
      </div>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-300 mx-2" />

      {/* X Icon to clear input */}
      <button
        onClick={handleClear}
        className="p-1 text-gray-500 hover:text-gray-700"
        aria-label="Clear search"
      >
        <FiX size={18} />
      </button>
    </div>
  );
};

export default SearchWithDropdown;
