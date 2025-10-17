"use client";

import { useState, useEffect } from "react";

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

export const Dropdown = ({
  options,
  selectedValue,
  onSelect,
  isLoading = false,
  placeholder = "Select an option",
  className = "",
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(
    (option) => option.value === selectedValue
  );

  const handleSelect = (value: string) => {
    onSelect(value);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen) {
        const target = event.target as Element;
        if (!target.closest(".dropdown-container")) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative dropdown-container ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center justify-between w-full p-4 bg-background rounded-xl border border-slate-4 text-white text-lg hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span>
            {isLoading ? "Loading..." : selectedOption?.label || placeholder}
          </span>
        </div>
        {isLoading ? (
          <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
        ) : (
          <svg
            className={`w-4 h-4 text-secondary transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
      </button>

      {isOpen && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-[#474747] rounded-xl p-1 shadow-lg backdrop-blur-sm z-10">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className="flex items-center gap-2 w-full p-3 text-white text-lg hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
            >
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
