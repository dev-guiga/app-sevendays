"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sevendaysapi } from "@/lib/sevendaysapi";
import { format } from "date-fns";
import { toast } from "sonner";

type AvailableSlot = {
  start_time?: string;
  end_time?: string;
};

type OwnerDiaryDaysResponse = {
  success?: boolean;
  date?: string;
  available_slots?: AvailableSlot[];
};

type OwnerCreateSchedulingResponse = {
  success?: boolean;
  user_email?: string;
  date?: string;
  time?: string;
};

type OwnerCreateSchedulingPayload = {
  scheduling: {
    user_email: string;
    date: string;
    time: string;
  };
};

function formatDateForApi(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function extractApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  if (error && typeof error === "object") {
    const candidate = error as {
      error?: {
        message?: string;
      };
      message?: string;
    };

    if (
      typeof candidate.error?.message === "string" &&
      candidate.error.message.trim().length > 0
    ) {
      return candidate.error.message;
    }

    if (typeof candidate.message === "string" && candidate.message.trim().length > 0) {
      return candidate.message;
    }
  }

  return fallback;
}

interface OwnerCreateSchedulingModalProps {
  onCreated?: () => void;
}

export function OwnerCreateSchedulingModal({
  onCreated,
}: OwnerCreateSchedulingModalProps) {
  const [open, setOpen] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState("");
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = React.useState<AvailableSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const selectedDateApi = React.useMemo(
    () => (date ? formatDateForApi(date) : null),
    [date],
  );

  const loadAvailableSlots = React.useCallback(async () => {
    if (!open || !selectedDateApi) {
      setAvailableSlots([]);
      setSelectedTime(null);
      return;
    }

    setIsLoadingSlots(true);

    const result = await sevendaysapi.get<OwnerDiaryDaysResponse>(
      "/owner/diary/schedulings/days",
      {
        withCredentials: true,
        params: {
          date: selectedDateApi,
        },
      },
    );

    if (
      result.error ||
      result.statusCode !== 200 ||
      !result.data?.success ||
      !Array.isArray(result.data.available_slots)
    ) {
      toast.error(
        extractApiErrorMessage(
          result.error,
          "Nao foi possivel carregar os horarios disponiveis.",
        ),
      );
      setAvailableSlots([]);
      setSelectedTime(null);
      setIsLoadingSlots(false);
      return;
    }

    const nextSlots = result.data.available_slots.filter(
      (slot) => typeof slot.start_time === "string" && slot.start_time.trim().length > 0,
    );
    setAvailableSlots(nextSlots);

    setSelectedTime((previous) => {
      const hasCurrentTime = nextSlots.some((slot) => slot.start_time === previous);
      if (hasCurrentTime) {
        return previous;
      }

      return nextSlots[0]?.start_time ?? null;
    });

    setIsLoadingSlots(false);
  }, [open, selectedDateApi]);

  React.useEffect(() => {
    void loadAvailableSlots();
  }, [loadAvailableSlots]);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    setUserEmail("");
  }, [open]);

  const isSubmitDisabled =
    isSubmitting ||
    isLoadingSlots ||
    !date ||
    !selectedTime ||
    userEmail.trim().length === 0;

  const handleCreateScheduling = async () => {
    if (isSubmitDisabled || !date || !selectedTime) {
      return;
    }

    setIsSubmitting(true);

    const result = await sevendaysapi.post<
      OwnerCreateSchedulingResponse,
      OwnerCreateSchedulingPayload
    >(
      "/owner/diary/schedulings",
      {
        scheduling: {
          user_email: userEmail.trim(),
          date: formatDateForApi(date),
          time: selectedTime,
        },
      },
      { withCredentials: true },
    );

    if (result.error || result.statusCode !== 201 || !result.data?.success) {
      toast.error(
        extractApiErrorMessage(
          result.error,
          "Nao foi possivel criar o novo agendamento.",
        ),
      );
      setIsSubmitting(false);
      return;
    }

    toast.success("Novo agendamento criado com sucesso.");
    setIsSubmitting(false);
    setOpen(false);
    setUserEmail("");
    onCreated?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">Novo agendamento</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Novo agendamento</DialogTitle>
          <DialogDescription>
            Selecione uma data, horário e informe o e-mail do usuário para criar o agendamento.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="owner-new-scheduling-email">E-mail do usuário</Label>
            <Input
              id="owner-new-scheduling-email"
              type="email"
              placeholder="usuario@email.com"
              value={userEmail}
              onChange={(event) => setUserEmail(event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
            <div className="rounded-md border p-3">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                defaultMonth={date}
                disabled={[
                  {
                    before: new Date(),
                  },
                ]}
                modifiers={{
                  before: new Date(),
                }}
                modifiersClassNames={{
                  before: "[&>button]:line-through opacity-100 cursor-not-allowed",
                }}
                className="w-full bg-transparent p-0 [--cell-size:--spacing(10)] md:[--cell-size:--spacing(11)]"
                classNames={{
                  months: "flex w-full gap-4 flex-col md:flex-row relative",
                  month: "flex flex-col w-full gap-4",
                }}
                formatters={{
                  formatWeekdayName: (nextDate) =>
                    nextDate.toLocaleString("pt-BR", { weekday: "short" }),
                }}
              />
            </div>

            <div className="rounded-md border p-3">
              <div className="max-h-72 overflow-y-auto">
                {isLoadingSlots ? (
                  <p className="text-sm text-muted-foreground">
                    Carregando horarios...
                  </p>
                ) : availableSlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Sem horarios disponiveis para a data selecionada.
                  </p>
                ) : (
                  <div className="grid gap-2">
                    {availableSlots.map((slot) => {
                      const slotTime = slot.start_time ?? "";
                      return (
                        <Button
                          key={slotTime}
                          type="button"
                          variant={selectedTime === slotTime ? "default" : "outline"}
                          onClick={() => setSelectedTime(slotTime)}
                          className="w-full shadow-none"
                        >
                          {slotTime}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {date && selectedTime ? (
              <>
                Agendamento para{" "}
                <span className="font-medium">
                  {date.toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </span>{" "}
                as <span className="font-medium">{selectedTime}</span>.
              </>
            ) : (
              <>Selecione data e horario para continuar.</>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleCreateScheduling}
            disabled={isSubmitDisabled}
          >
            {isSubmitting ? "Criando..." : "Criar agendamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
