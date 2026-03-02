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
import { addDays, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { type DateRange } from "react-day-picker";

type DatePickerWithRangeProps = {
  value?: DateRange;
  onChange?: (value: DateRange | undefined) => void;
  id?: string;
  className?: string;
  label?: string;
};

function buildDefaultRange(): DateRange {
  const today = new Date();

  return {
    from: today,
    to: addDays(today, 30),
  };
}

export function DatePickerWithRange({
  value,
  onChange,
  id = "date-picker-range",
  className,
  label = "Período",
}: DatePickerWithRangeProps) {
  const [internalDate, setInternalDate] = React.useState<DateRange | undefined>(
    value ?? buildDefaultRange(),
  );

  React.useEffect(() => {
    if (!value) {
      return;
    }

    setInternalDate(value);
  }, [value]);

  const selectedDate = value ?? internalDate;

  const handleSelect = (nextDate: DateRange | undefined) => {
    setInternalDate(nextDate);
    onChange?.(nextDate);
  };

  return (
    <Field className={className ?? "w-72"}>
      <FieldLabel htmlFor={id} className="sr-only">
        {label}
      </FieldLabel>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id={id}
            className="justify-start px-2.5 font-normal"
          >
            <CalendarIcon className="size-4" />
            {selectedDate?.from ? (
              selectedDate.to ? (
                <>
                  {format(selectedDate.from, "dd/MM/yyyy")} -{" "}
                  {format(selectedDate.to, "dd/MM/yyyy")}
                </>
              ) : (
                format(selectedDate.from, "dd/MM/yyyy")
              )
            ) : (
              <span>Escolha um período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={selectedDate?.from}
            selected={selectedDate}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
}

