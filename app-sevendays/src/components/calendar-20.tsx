"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ConfirmationDateModal } from "./ConfirmationDateModal";

const partner = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "1234567890",
  address: "123 Main St, Anytown, USA",
  city: "Anytown",
  state: "CA",
  zip: "12345",
  country: "USA",
  partner: true,
  partner_id: "1234567890",
  ListDates: [
    {
      date: "2025-05-12",
      time: "09:00",
      status: "booked",
    },
    {
      date: "2025-05-13",
      time: "10:00",
      status: "booked",
    },
    {
      date: "2025-05-14",
      time: "11:00",
      status: "available",
    },
    {
      date: "2025-05-15",
      time: "12:00",
      status: "available",
    },
    {
      date: "2025-05-16",
      time: "13:00",
      status: "available",
    },
    {
      date: "2025-05-17",
      time: "14:00",
      status: "booked",
    },
    {
      date: "2025-05-18",
      time: "15:00",
      status: "available",
    },
    {
      date: "2025-05-19",
      time: "16:00",
      status: "available",
    },
    {
      date: "2025-05-20",
      time: "17:00",
      status: "booked",
    },
  ],
};

export default function Calendar20() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = React.useState<string | null>(
    "10:00"
  );

  const modifiers = {
    weekend: { dayOfWeek: [0, 6] }, // Match weekends'
    before: new Date(),
  };

  return (
    <Card className="gap-0 p-0">
      <CardContent className="relative p-0 md:pr-48">
        <div className="p-6">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            defaultMonth={date}
            disabled={[
              {
                before: new Date(),
              },
              {
                dayOfWeek: [0, 6],
              },
            ]}
            modifiers={modifiers}
            modifiersClassNames={{
              weekend: "[&>button]:line-through opacity-100 cursor-not-allowed",
              before: "[&>button]:line-through opacity-100 cursor-not-allowed",
            }}
            className="bg-transparent p-0 [--cell-size:--spacing(10)] md:[--cell-size:--spacing(12)]"
            formatters={{
              formatWeekdayName: (date) => {
                return date.toLocaleString("pt-BR", { weekday: "short" });
              },
            }}
          />
        </div>
        <div
          className="no-scrollbar inset-y-0 right-0 flex max-h-72 w-full scroll-pb-6 flex-col gap-4 overflow-y-auto border-t p-6 md:absolute md:max-h-none md:w-48 md:border-t-0 md:border-l"
          style={{ scrollbarWidth: "thin" }}
        >
          <div className="grid gap-2">
            {partner.ListDates.map((time, index) => (
              <Button
                key={index}
                variant={selectedTime === time.time ? "default" : "outline"}
                disabled={time.status === "booked"}
                onClick={() => setSelectedTime(time.time)}
                className="w-full shadow-none disabled:opacity-70"
              >
                {time.time}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 border-t px-6 !py-5 md:flex-row">
        <div className="text-sm">
          {date && selectedTime ? (
            <>
              Your meeting is booked for{" "}
              <span className="font-medium">
                {" "}
                {date?.toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}{" "}
              </span>
              ás <span className="font-medium">{selectedTime}</span>.
            </>
          ) : (
            <>Selecione uma data e hora para seu agendamento.</>
          )}
        </div>

        <ConfirmationDateModal date={date} selectedTime={selectedTime} />
      </CardFooter>
    </Card>
  );
}
