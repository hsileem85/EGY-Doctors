import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SpecialtyOption {
  value: string;
  label: string;
}

interface SpecialtyComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SpecialtyOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  dark?: boolean;
  className?: string;
  "data-testid"?: string;
}

export function SpecialtyCombobox({
  value,
  onValueChange,
  options,
  placeholder = "Choose specialty",
  searchPlaceholder = "Search specialties…",
  emptyMessage = "No specialty found.",
  dark = false,
  className,
  "data-testid": testId,
}: SpecialtyComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          data-testid={testId}
          className={cn(
            "w-full justify-between font-normal",
            dark
              ? "bg-[#0F172A]/60 border-[#334155] text-white hover:bg-[#0F172A]/80 hover:text-white"
              : "bg-background border-input text-foreground hover:bg-accent",
            !value && (dark ? "text-gray-400" : "text-muted-foreground"),
            className,
          )}
        >
          <span className="truncate">{selected ? selected.label : placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className={cn(
          "w-[--radix-popover-trigger-width] p-0",
          dark && "bg-[#1E293B] border-[#334155]",
        )}
        align="start"
      >
        <Command
          className={cn(dark && "bg-[#1E293B] text-white")}
          filter={(itemValue, search) =>
            itemValue.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
          }
        >
          <CommandInput
            placeholder={searchPlaceholder}
            className={cn(dark && "text-white placeholder:text-gray-400")}
          />
          <CommandList className="max-h-[250px] overflow-y-auto">
            <CommandEmpty className={cn("py-4 text-center text-sm", dark && "text-gray-400")}>
              {emptyMessage}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(current) => {
                    onValueChange(current === value ? "" : current);
                    setOpen(false);
                  }}
                  className={cn(
                    dark &&
                      "text-white aria-selected:bg-[#D4A853]/10 aria-selected:text-[#D4A853] data-[selected=true]:bg-[#D4A853]/10 data-[selected=true]:text-[#D4A853]",
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
