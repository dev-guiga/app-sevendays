"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { sevendaysapi } from "@/lib/sevendaysapi";
import {
  Archive,
  CalendarCheck,
  Trash,
  User,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import {
  mapSidebarSchedulingsToCards,
  type SidebarSchedulingCard,
  type SidebarSchedulingResponse,
} from "./sidebar-scheduling-utils";

interface SidebarUserProps {
  onOpenPortal: () => void;
}

export function SidebarUser({ onOpenPortal }: SidebarUserProps) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    null,
  );
  const [schedulings, setSchedulings] = useState<SidebarSchedulingCard[]>([]);
  const [isLoadingSchedulings, setIsLoadingSchedulings] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadUserSidebarSchedulings() {
      setIsLoadingSchedulings(true);

      const result = await sevendaysapi.get<SidebarSchedulingResponse>(
        "/sidebar/schedulings",
        {
          withCredentials: true,
        },
      );

      if (ignore) {
        return;
      }

      if (result.statusCode === 401 || result.statusCode === 403) {
        setSchedulings([]);
        setIsLoadingSchedulings(false);
        return;
      }

      if (result.error || result.statusCode !== 200 || !result.data?.success) {
        toast.error("Nao foi possivel carregar os agendamentos da sidebar.");
        setSchedulings([]);
        setIsLoadingSchedulings(false);
        return;
      }

      setSchedulings(mapSidebarSchedulingsToCards(result.data.schedulings));
      setIsLoadingSchedulings(false);
    }

    void loadUserSidebarSchedulings();

    return () => {
      ignore = true;
    };
  }, []);

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
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-accent-foreground">
          Atalhos do Usuario
        </h2>
        <Button type="button" variant="outline" onClick={onOpenPortal}>
          Abrir portal
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-accent-foreground">
          Horarios Marcados
        </h2>

        {isLoadingSchedulings ? (
          <div className="flex flex-col gap-3">
            {[0, 1].map((item) => (
              <Card key={item} className="w-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 flex flex-col gap-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-56" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-36" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : schedulings.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem agendamentos hoje.</p>
        ) : (
          <div className="flex flex-col gap-3 max-h-150 overflow-scroll [&::-webkit-scrollbar]:hidden">
            {schedulings.map((item) => (
              <Card key={item.id} className="w-full max-h-35">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xs flex gap-2">
                        <User size={12} />
                        <span className="text-xs">
                          <span className="text-xs">{item.professional}</span> -{" "}
                          <span className="text-xs">{item.service}</span>
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
                      {item.date} as {item.time}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Agendamento</DialogTitle>
            <DialogDescription>
              Deseja cancelar o horario agendado?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Nao
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
