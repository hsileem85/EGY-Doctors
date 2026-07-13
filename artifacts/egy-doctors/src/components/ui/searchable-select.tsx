import { useState, useRef } from "react";
import { ChevronDown, X } from "lucide-react";

export interface SearchableSelectOption {
  value: string | number;
  label: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string | number | null | undefined;
  onChange: (val: string | number | null) => void;
  placeholder: string;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  icon,
  className = "",
  disabled = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((o) => String(o.value) === String(value))?.label ?? "";

  const filtered = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  function open() {
    if (disabled) return;
    setIsOpen(true);
    setQuery("");
  }

  function close() {
    setIsOpen(false);
    setQuery("");
  }

  function handleBlur() {
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) close();
    }, 150);
  }

  function selectOption(val: string | number) {
    onChange(val);
    close();
    inputRef.current?.blur();
  }

  function clearSelection(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    onChange(null);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  const hasValue = value != null && value !== "";

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center h-9 px-3 border-t sm:border-t-0 border-gray-100 ${disabled ? "opacity-40 pointer-events-none" : ""} ${className}`}
    >
      {icon && <span className="shrink-0 flex items-center">{icon}</span>}

      <input
        ref={inputRef}
        type="text"
        readOnly={!isOpen}
        value={isOpen ? query : selectedLabel}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={open}
        onBlur={handleBlur}
        placeholder={isOpen ? (selectedLabel || placeholder) : placeholder}
        className={`flex-1 min-w-0 bg-transparent border-none outline-none text-[#0F172A] font-medium pl-2 text-sm truncate placeholder:font-normal placeholder:text-gray-400 ${
          isOpen ? "cursor-text" : "cursor-pointer"
        }`}
      />

      {hasValue && !disabled ? (
        <button
          type="button"
          onMouseDown={clearSelection}
          className="shrink-0 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors ml-0.5"
          tabIndex={-1}
        >
          <X className="w-3 h-3" />
        </button>
      ) : (
        <ChevronDown
          className={`w-3 h-3 shrink-0 text-gray-400 transition-transform ml-0.5 ${isOpen ? "rotate-180" : ""}`}
        />
      )}

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute top-full left-0 z-[200] mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-y-auto min-w-[180px] max-h-56 py-1"
          onMouseDown={(e) => e.preventDefault()}
        >
          {filtered.length === 0 ? (
            <div className="px-3 py-2.5 text-xs text-gray-400 text-center">No results</div>
          ) : (
            filtered.map((opt) => {
              const active = String(opt.value) === String(value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => selectOption(opt.value)}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-emerald-50 text-emerald-700 font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
