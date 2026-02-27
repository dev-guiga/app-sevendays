import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { XIcon } from "lucide-react";

export function ConfirmationDateModal({
  date,
  selectedTime,
}: {
  date: Date | undefined;
  selectedTime: string | null;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Confirmar Agendamento</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form>
          <DialogHeader className="w-full flex flex-row justify-between flex-nowrap">
            <DialogTitle>Deseja confirmar o agendamento?</DialogTitle>
            <DialogClose
              data-slot="dialog-close"
              className="w-auto ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground  rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
            >
              <XIcon className="size-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogHeader>

          <DialogDescription className="py-15">
            Deseja confirmar o agendamento para o dia{" "}
            {date?.toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}{" "}
            ás {selectedTime}?
          </DialogDescription>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit">Confirmar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
