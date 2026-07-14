import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends Omit<React.ComponentProps<"select">, "onChange"> {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
}

export function Select({ options, value, onChange, icon, className, ...props }: SelectProps) {
  return (
    <div
      className={cn(
        "group/select relative flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        className
      )}
    >
      {icon && <span className="shrink-0 text-muted-foreground [&_svg]:size-4">{icon}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="peer w-full cursor-pointer appearance-none bg-transparent pr-5 outline-none"
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-muted-foreground" />
    </div>
  );
}
