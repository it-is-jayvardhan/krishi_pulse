"use client";

import * as React from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectOption {
  label: string;
  value: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  icon,
  placeholder = "Select...",
  className,
  disabled = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  // Find the label for the currently selected value to display when closed
  const selectedLabel = options.find((opt) => opt.value === value)?.label || "";

  // Filter options based on search (case-insensitive)
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm(""); // Reset search when closing
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      {/* The main button/input area */}
      <div
        className={cn(
          "group/select relative flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-2.5 text-sm font-medium transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-muted"
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {icon && <span className="shrink-0 text-muted-foreground [&_svg]:size-4">{icon}</span>}
        
        {isOpen ? (
          <input
            autoFocus
            type="text"
            className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        ) : (
          <span className="w-full truncate text-left">
            {selectedLabel || placeholder}
          </span>
        )}
        
        <ChevronDown className="pointer-events-none shrink-0 h-3.5 w-3.5 text-muted-foreground" />
      </div>

      {/* The dropdown list */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md bg-card">
          {filteredOptions.length === 0 ? (
            <div className="py-2 px-2 text-sm text-muted-foreground text-center">
              No results found.
            </div>
          ) : (
            filteredOptions.map((opt) => (
              <div
                key={opt.value}
                className={cn(
                  "cursor-pointer rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted hover:text-foreground",
                  value === opt.value && "bg-primary/10 text-primary font-semibold"
                )}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                  setSearchTerm("");
                }}
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}