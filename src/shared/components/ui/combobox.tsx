"use client";

import { ChevronDown, Check } from "lucide-react";
import { Combobox } from "@base-ui/react/combobox";
import { useId } from "react";

export type ComboboxOption = { value: string; label: string };

type AppComboboxProps = {
  label: string;
  options: ComboboxOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
};

export function AppCombobox({
  label,
  options,
  value,
  onValueChange,
  placeholder = "Choose an option",
  emptyMessage = "No options found.",
  disabled = false,
}: AppComboboxProps) {
  const inputId = useId();
  const selectedOption = options.find((option) => option.value === value) ?? null;

  return (
    <Combobox.Root
      items={options}
      value={selectedOption}
      onValueChange={(option) => onValueChange(option?.value ?? "")}
      itemToStringLabel={(option) => option.label}
      autoHighlight
      disabled={disabled}
    >
      <div className="grid w-full min-w-0 gap-1.5 text-sm font-medium">
        <label htmlFor={inputId}>{label}</label>
        <Combobox.InputGroup className="relative flex min-h-11 w-full min-w-0 items-center rounded-lg border border-input bg-background transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring data-[disabled]:opacity-60">
          <Combobox.Input
            id={inputId}
            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
            placeholder={placeholder}
          />
          <Combobox.Trigger
            aria-label={`Show ${label.toLowerCase()} options`}
            className="grid size-11 shrink-0 place-items-center rounded-r-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            <ChevronDown aria-hidden="true" className="size-4" />
          </Combobox.Trigger>
        </Combobox.InputGroup>
      </div>
      <Combobox.Portal>
        <Combobox.Positioner sideOffset={6} align="start" className="z-50 w-[var(--anchor-width)] outline-none">
          <Combobox.Popup className="max-h-64 overflow-hidden rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg outline-none data-[open]:animate-in data-[open]:fade-in-0 data-[open]:zoom-in-95">
            <Combobox.Empty className="px-3 py-2 text-sm text-muted-foreground">{emptyMessage}</Combobox.Empty>
            <Combobox.List className="max-h-60 overflow-y-auto">
              {(option: ComboboxOption) => (
                <Combobox.Item
                  key={option.value}
                  value={option}
                  className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                >
                  <span>{option.label}</span>
                  <Combobox.ItemIndicator>
                    <Check aria-hidden="true" className="size-4 text-brand-primary" />
                  </Combobox.ItemIndicator>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
