import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
//import Calendar20 from "./calendar-20";   <Calendar20 />;
import { Separator } from "@radix-ui/react-separator";

type Date = {
  data: string;
  hora: string;
};

interface client {
  nome: string;
  email: string;
  date: Date;
  status: string;
}

type AddOrRemoveModalProps = {
  title: string;
  onCloseModal: () => void;
  openModal: boolean;
  client: client;
  type: string;
};

export function AddOrRemoveModal({
  title,
  onCloseModal,
  openModal,
  client,
  type,
}: AddOrRemoveModalProps) {
  return (
    <Dialog open={openModal}>
      <form>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="w-max flex flex-col gap-1">
              {title}
              <Separator className="w-full h-[0.1px] bg-primary" />
            </DialogTitle>
            <DialogDescription>
              As alterações serão irreversíveis
            </DialogDescription>
          </DialogHeader>
          {type === "editar" ? (
            <>
              <div className="grid gap-4">
                <div>
                  <h1 className="w-max">
                    Tem certeza que deseja editar o horario:
                    <br />
                    {client?.nome} ás{" "}
                    {`${client?.date.data} - ${client?.date.hora} `}
                  </h1>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" onClick={onCloseModal}>
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit">Salvar alterações</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="grid gap-4">
                <div>
                  <h1>
                    Tem certeza que deseja remover o horario: <br /> de{" "}
                    {client?.nome} ás{" "}
                    {`${client?.date.data} - ${client?.date.hora} `}
                  </h1>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" onClick={onCloseModal}>
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit">Salvar alterações</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </form>
    </Dialog>
  );
}
