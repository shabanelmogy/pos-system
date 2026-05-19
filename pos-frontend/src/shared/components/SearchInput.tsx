import React from "react";
import { FaSearch, FaTimesCircle } from "react-icons/fa";

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  iconSize?: number;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  inputClassName = "",
  iconSize = 12,
}) => {
  return (
    <div className={`relative w-full group ${className}`}>
      <FaSearch
        className="absolute start-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)] group-focus-within:text-[var(--primary)] transition-colors duration-250"
        size={iconSize}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-[var(--bg-main)]/90 border border-[var(--border-main)] focus:border-[var(--primary)]/60 focus:ring-4 focus:ring-[var(--primary)]/10 rounded-2xl py-2.5 ps-10 pe-9 text-[11px] font-black uppercase tracking-wider outline-none text-[var(--text-main)] placeholder-[var(--text-muted)] transition-all duration-250 ${inputClassName}`}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute end-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)] hover:text-[var(--status-error)] active:scale-90 transition-all p-1.5 rounded-full flex items-center justify-center"
          title="Clear search"
        >
          <FaTimesCircle size={iconSize} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
