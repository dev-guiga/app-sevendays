"use client";

import * as React from "react";

import Calendar20 from "@/components/calendar-20";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { XIcon } from "lucide-react";

interface OwnerCreateSchedulingModalProps {
  onCreated?: () => void;
}

export function OwnerCreateSchedulingModal({
  onCreated,
}: OwnerCreateSchedulingModalProps) {
  const [open, setOpen] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState("");
  const [submitRequestToken, setSubmitRequestToken] = React.useState(0);
  const [canSubmitScheduling, setCanSubmitScheduling] = React.useState(false);
  const [isSubmittingScheduling, setIsSubmittingScheduling] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    setUserEmail("");
    setSubmitRequestToken(0);
    setCanSubmitScheduling(false);
    setIsSubmittingScheduling(false);
  }, [open]);

  const trimmedEmail = userEmail.trim();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">Novo agendamento</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-3xl">
        <DialogHeader className="w-full flex flex-row items-start justify-between gap-4">
          <div className="space-y-1">
            <DialogTitle>Novo agendamento</DialogTitle>
          </div>
          <DialogClose
            data-slot="dialog-close"
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
            aria-label="Fechar modal"
          >
            <XIcon className="size-4" />
            <span className="sr-only">Fechar</span>
          </DialogClose>
        </DialogHeader>

        <div className="grid gap-4 justify-items-center">
          <div className="grid w-full gap-2">
            <Label htmlFor="owner-new-scheduling-email">E-mail do usuário</Label>
            <Input
              id="owner-new-scheduling-email"
              type="email"
              placeholder="usuario@email.com"
              value={userEmail}
              onChange={(event) => setUserEmail(event.target.value)}
            />
          </div>

          <div className="flex w-full justify-center">
            <Calendar20
              daysEndpoint="/owner/diary/schedulings/days"
              createEndpoint="/owner/diary/schedulings"
              buildCreatePayload={({ date, time }) => ({
                scheduling: {
                  user_email: trimmedEmail,
                  date,
                  time,
                },
              })}
              isConfirmDisabled={trimmedEmail.length === 0}
              successMessage="Novo agendamento pendente criado com sucesso."
              createErrorMessage="Nao foi possivel criar o novo agendamento."
              isOwnerScheduling
              submitRequestToken={submitRequestToken}
              onCreateStateChange={({ canSubmit, isSubmitting }) => {
                setCanSubmitScheduling(canSubmit);
                setIsSubmittingScheduling(isSubmitting);
              }}
              onCreateSuccess={() => {
                setOpen(false);
                setUserEmail("");
                onCreated?.();
              }}
            />
          </div>
        </div>

        <div className="flex w-full items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="!bg-red-500 !border-red-500 !text-white hover:!bg-red-600 hover:!border-red-600 hover:!text-white"
            onClick={() => setOpen(false)}
            disabled={isSubmittingScheduling}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => setSubmitRequestToken((previous) => previous + 1)}
            disabled={!canSubmitScheduling || isSubmittingScheduling || trimmedEmail.length === 0}
          >
            {isSubmittingScheduling ? "Criando..." : "Criar agendamento pendente"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
