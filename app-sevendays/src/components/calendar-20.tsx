"use client";

import * as React from "react";

import { useQuery } from "@tanstack/react-query";
import { ConfirmationDateModal } from "@/components/ConfirmationDateModal";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { sevendaysapi } from "@/lib/sevendaysapi";
import { format } from "date-fns";
import { toast } from "sonner";

type AvailableSlot = {
  start_time?: string;
  end_time?: string;
};

type DiaryDaysResponse = {
  success?: boolean;
  date?: string;
  available_slots?: AvailableSlot[];
};

type CreateSchedulingResponse = {
  success?: boolean;
  id?: number;
  date?: string;
  time?: string;
  status?: string;
};

type DefaultCreateSchedulingPayload = {
  scheduling: {
    date: string;
    time: string;
    description: string;
  };
};

type Calendar20Props = {
  diaryId?: number;
  daysEndpoint?: string;
  createEndpoint?: string;
  buildCreatePayload?: (params: { date: string; time: string }) => unknown;
  confirmButtonLabel?: string;
  isConfirmDisabled?: boolean;
  successMessage?: string;
  createErrorMessage?: string;
  onCreateSuccess?: () => void;
  isOwnerScheduling?: boolean;
  submitRequestToken?: number;
  onCreateStateChange?: (state: {
    canSubmit: boolean;
    isSubmitting: boolean;
  }) => void;
};

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

    if (typeof candidate.error?.message === "string" && candidate.error.message.trim().length > 0) {
      return candidate.error.message;
    }

    if (typeof candidate.message === "string" && candidate.message.trim().length > 0) {
      return candidate.message;
    }
  }

  return fallback;
}

function formatDateForApi(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export default function Calendar20({
  diaryId,
  daysEndpoint,
  createEndpoint,
  buildCreatePayload,
  confirmButtonLabel,
  isConfirmDisabled = false,
  successMessage = "Agendamento confirmado com sucesso.",
  createErrorMessage = "Nao foi possivel confirmar o agendamento.",
  onCreateSuccess,
  isOwnerScheduling = false,
  submitRequestToken,
  onCreateStateChange,
}: Calendar20Props) {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const previousSubmitTokenRef = React.useRef<number | undefined>(submitRequestToken);

  const selectedDateApi = React.useMemo(
    () => (date ? formatDateForApi(date) : null),
    [date],
  );
  const resolvedDaysEndpoint = React.useMemo(
    () => daysEndpoint ?? (diaryId ? `/diaries/${diaryId}/days` : null),
    [daysEndpoint, diaryId],
  );
  const resolvedCreateEndpoint = React.useMemo(
    () => createEndpoint ?? (diaryId ? `/diaries/${diaryId}/schedulings` : null),
    [createEndpoint, diaryId],
  );

  const availableSlotsQuery = useQuery({
    queryKey: ["diary-days", resolvedDaysEndpoint, selectedDateApi],
    enabled: Boolean(selectedDateApi && resolvedDaysEndpoint),
    queryFn: async () => {
      const result = await sevendaysapi.get<DiaryDaysResponse>(
        resolvedDaysEndpoint!,
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
        throw new Error(
          extractApiErrorMessage(
            result.error,
            "Nao foi possivel carregar os horarios disponiveis para esta data.",
          ),
        );
      }

      return result.data.available_slots.filter(
        (slot) =>
          typeof slot.start_time === "string" && slot.start_time.trim().length > 0,
      );
    },
    staleTime: 30_000,
  });

  React.useEffect(() => {
    if (!availableSlotsQuery.isError) {
      return;
    }

    const errorMessage =
      availableSlotsQuery.error instanceof Error
        ? availableSlotsQuery.error.message
        : "Nao foi possivel carregar os horarios disponiveis para esta data.";
    toast.error(errorMessage);
  }, [availableSlotsQuery.error, availableSlotsQuery.errorUpdatedAt, availableSlotsQuery.isError]);

  React.useEffect(() => {
    setSelectedTime(null);
  }, [selectedDateApi, resolvedDaysEndpoint]);

  React.useEffect(() => {
    const nextSlots = availableSlotsQuery.data ?? [];
    setSelectedTime((previous) => {
      const hasCurrentTime = nextSlots.some((slot) => slot.start_time === previous);
      if (hasCurrentTime) {
        return previous;
      }

      return nextSlots[0]?.start_time ?? null;
    });
  }, [availableSlotsQuery.data]);

  const availableSlots = availableSlotsQuery.data ?? [];
  const isLoadingSlots = availableSlotsQuery.isPending;

  const handleCreateScheduling = React.useCallback(async () => {
    if (!date || !selectedTime || !resolvedCreateEndpoint) {
      return false;
    }

    setIsSubmitting(true);

    const formattedDate = formatDateForApi(date);
    const payload: unknown = buildCreatePayload
      ? buildCreatePayload({
          date: formattedDate,
          time: selectedTime,
        })
      : ({
          scheduling: {
            date: formattedDate,
            time: selectedTime,
            description: "Agendamento criado via portal do usuario",
          },
        } as DefaultCreateSchedulingPayload);

    const result = await sevendaysapi.post<CreateSchedulingResponse, unknown>(
      resolvedCreateEndpoint,
      payload,
      { withCredentials: true },
    );

    if (result.error || result.statusCode !== 201 || !result.data?.success) {
      toast.error(
        extractApiErrorMessage(result.error, createErrorMessage),
      );
      setIsSubmitting(false);
      return false;
    }

    toast.success(successMessage);
    setIsSubmitting(false);
    await availableSlotsQuery.refetch();
    onCreateSuccess?.();
    return true;
  }, [
    availableSlotsQuery,
    buildCreatePayload,
    createErrorMessage,
    date,
    onCreateSuccess,
    resolvedCreateEndpoint,
    selectedTime,
    successMessage,
  ]);

  const canSubmit = Boolean(
    date && selectedTime && !isLoadingSlots && !isConfirmDisabled && !isSubmitting,
  );

  React.useEffect(() => {
    onCreateStateChange?.({
      canSubmit,
      isSubmitting,
    });
  }, [canSubmit, isSubmitting, onCreateStateChange]);

  React.useEffect(() => {
    if (!isOwnerScheduling || submitRequestToken === undefined) {
      return;
    }

    if (previousSubmitTokenRef.current === submitRequestToken) {
      return;
    }

    previousSubmitTokenRef.current = submitRequestToken;
    void handleCreateScheduling();
  }, [handleCreateScheduling, isOwnerScheduling, submitRequestToken]);

  return (
    <Card className="w-full gap-0 p-0 md:w-fit">
      <CardContent className="p-0 md:flex md:w-fit md:items-stretch">
        <div className="p-6 md:w-fit md:shrink-0">
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
            className="w-fit bg-transparent p-0 [--cell-size:--spacing(10)] md:[--cell-size:--spacing(12)]"
            classNames={{
              months: "flex w-fit gap-4 flex-col md:flex-row relative",
              month: "flex flex-col w-fit gap-4",
            }}
            formatters={{
              formatWeekdayName: (nextDate) =>
                nextDate.toLocaleString("pt-BR", { weekday: "short" }),
            }}
          />
        </div>

        <div
          className="flex max-h-72 w-full scroll-pb-6 flex-col gap-4 overflow-y-auto border-t p-6 md:max-h-none md:w-56 md:border-t-0 md:border-l [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none" }}
        >
          {isLoadingSlots ? (
            <p className="text-sm text-muted-foreground">Carregando horarios...</p>
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
      </CardContent>

      {isOwnerScheduling ? null : (
        <CardFooter className="flex flex-col gap-4 border-t px-6 !py-5 md:flex-row md:items-center md:justify-between">
          <div className="text-sm">
            {date && selectedTime ? (
              <>
                Seu agendamento sera para{" "}
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
              <>Selecione uma data e horario disponiveis.</>
            )}
          </div>

          <ConfirmationDateModal
            date={date}
            selectedTime={selectedTime}
            disabled={!date || !selectedTime || isLoadingSlots || isConfirmDisabled}
            isSubmitting={isSubmitting}
            triggerLabel={confirmButtonLabel}
            onConfirm={handleCreateScheduling}
          />
        </CardFooter>
      )}
    </Card>
  );
}
