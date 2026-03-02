"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type DatePickerSimpleProps = {
  id?: string;
  label?: string;
  labelClassName?: string;
  placeholder?: string;
  className?: string;
  value?: Date;
  onChange?: (value: Date | undefined) => void;
  disabled?: boolean;
};

export function DatePickerSimple({
  id = "date-picker-simple",
  label = "Data",
  labelClassName,
  placeholder = "Selecione uma data",
  className,
  value,
  onChange,
  disabled = false,
}: DatePickerSimpleProps) {
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(value);

  React.useEffect(() => {
    setInternalDate(value);
  }, [value]);

  const selectedDate = value ?? internalDate;

  const handleSelect = (nextDate: Date | undefined) => {
    setInternalDate(nextDate);
    onChange?.(nextDate);
  };

  return (
    <Field className={className ?? "w-44"}>
      <FieldLabel htmlFor={id} className={labelClassName}>
        {label}
      </FieldLabel>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id={id}
            className="w-full justify-start overflow-hidden text-left font-normal text-ellipsis whitespace-nowrap"
            disabled={disabled}
          >
            {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            defaultMonth={selectedDate}
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
}
