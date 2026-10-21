"use client";

import { ChevronDown, Check } from "lucide-react";
import { Combobox } from "@base-ui/react/combobox";
import { useId } from "react";
import { interpolate } from "@/shared/i18n/format";
import { useI18n } from "@/shared/i18n/locale-provider";

export type ComboboxOption = { value: string; label: string };

type AppComboboxProps = {
  label: string;
  options: ComboboxOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  hideLabel?: boolean;
  readOnly?: boolean;
  className?: string;
};

export function AppCombobox({
  label,
  options,
  value,
  onValueChange,
  placeholder,
  emptyMessage,
  disabled = false,
  hideLabel = false,
  readOnly = false,
  className,
}: AppComboboxProps) {
  const inputId = useId();
  const { t } = useI18n();
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
      <div className={`grid min-w-0 gap-1.5 text-sm font-medium ${className ?? "w-full"}`}>
        <label className={hideLabel ? "sr-only" : undefined} htmlFor={inputId}>{label}</label>
        <Combobox.InputGroup className="relative flex min-h-11 w-full min-w-0 items-center rounded-lg border border-input bg-background transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring data-[disabled]:opacity-60">
          <Combobox.Input
            id={inputId}
            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
            placeholder={placeholder ?? t.combobox.choose}
            readOnly={readOnly}
          />
          <Combobox.Trigger
            aria-label={interpolate(t.combobox.show, { label: label.toLowerCase() })}
            className="grid size-11 shrink-0 place-items-center rounded-e-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            <ChevronDown aria-hidden="true" className="size-4" />
          </Combobox.Trigger>
        </Combobox.InputGroup>
      </div>
      <Combobox.Portal>
        <Combobox.Positioner sideOffset={6} align="start" className="z-[70] w-[var(--anchor-width)] outline-none">
          <Combobox.Popup className="max-h-64 overflow-hidden rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg outline-none data-[open]:animate-in data-[open]:fade-in-0 data-[open]:zoom-in-95">
            <Combobox.Empty><span className="block px-3 py-2 text-sm text-muted-foreground">{emptyMessage ?? t.combobox.none}</span></Combobox.Empty>
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
