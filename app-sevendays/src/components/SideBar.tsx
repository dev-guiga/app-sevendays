"use client";
import { useState } from "react";
import AvatarProfile from "./Avatar";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { List, CalendarCheck, Trash } from "@phosphor-icons/react/dist/ssr";

import ReceptionistImage from "@/app/assets/image/recepcionista.jpg";
import { Separator } from "@radix-ui/react-separator";
import { Archive, User } from "@phosphor-icons/react";

const partner = {
  id: 1,
  image: ReceptionistImage,
  name: "Guilherme Cataneo",
  address: {
    street: "Rua dos Bobos",
    number: 0,
    city: "São Paulo",
    state: "SP",
  },
  agenda: {
    services: [
      {
        id: 1,
        date: "15/12/2024",
        time: "09:00",
        service: "Cabeleleiro",
        type: "Corte e Escova",
        professional: "Maria Silva",
      },
      {
        id: 2,
        date: "20/12/2024",
        time: "14:30",
        service: "Médico",
        type: "Consulta Clínica Geral",
        professional: "Dr. João Santos",
      },
      {
        id: 3,
        date: "22/12/2024",
        time: "10:00",
        service: "Massagem",
        type: "Massagem Relaxante",
        professional: "Ana Costa",
      },
      {
        id: 4,
        date: "25/12/2024",
        time: "16:00",
        service: "Cabeleleiro",
        type: "Coloração",
        professional: "Maria Silva",
      },
      {
        id: 5,
        date: "28/12/2024",
        time: "11:30",
        service: "Massagem",
        type: "Massagem Terapêutica",
        professional: "Ana Costa",
      },
    ],
  },
};

export function SideBar() {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    null
  );

  const handleCancelClick = (serviceId: number) => {
    setSelectedServiceId(serviceId);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = () => {
    // Lógica para cancelar o agendamento será adicionada aqui
    console.log("Confirmar cancelamento do horário:", selectedServiceId);
    setCancelDialogOpen(false);
    setSelectedServiceId(null);
  };

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="secondary" size="icon">
            <List size={36} weight="bold" />
          </Button>
        </SheetTrigger>
        <SheetContent className="flex flex-col gap-5">
          <SheetHeader>
            <SheetTitle className="font-bold text-accent-foreground">
              Sev7en Days
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-5 px-4">
            <div className="flex gap-6">
              <AvatarProfile
                src={partner.image.src}
                className="w-20 rounded-full border-primary border-1"
              />
              <div>
                <h1 className="text-2xl font-bold text-accent-foreground">
                  {partner.name}
                </h1>
                <Separator className="h-[1px] bg-primary" />
                <div className="flex flex-col">
                  <span className="text-sm">
                    {partner.address.street} N°{partner.address.number}
                  </span>

                  <span className="text-sm">
                    {partner.address.city} - {partner.address.state}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-accent-foreground">
                Horários Marcados
              </h2>

              <div className="flex flex-col gap-3 max-h-150 overflow-scroll [&::-webkit-scrollbar]:hidden">
                {partner.agenda.services.map((item, index) => (
                  <Card key={index} className="w-full max-h-35">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xs flex gap-2">
                            <User size={12} />
                            <span className="text-xs">
                              <span className="text-xs">
                                {item.professional}
                              </span>{" "}
                              - <span className="text-xs">{item.service}</span>
                            </span>
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 text-xs mt-1">
                            <Archive size={12} />
                            {item.type}
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCancelClick(item.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                        >
                          <Trash size={18} />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <CalendarCheck size={20} className="text-primary" />
                        <span className="text-sm font-medium text-muted-foreground">
                          {item.date} às {item.time}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Agendamento</DialogTitle>
            <DialogDescription>
              Deseja cancelar o horário agendado?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
            >
              Não
            </Button>
            <Button variant="default" onClick={handleConfirmCancel}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
