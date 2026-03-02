"use client";

import { useCallback, useEffect, useState } from "react";

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
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { sevendaysapi } from "@/lib/sevendaysapi";
import {
  Archive,
  CalendarCheck,
  List,
  SignOut,
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
  user: {
    full_name?: string;
    username?: string;
    address?: {
      address?: string;
      city?: string;
      state?: string;
      neighborhood?: string;
    };
  } | null;
  isLoggingOut: boolean;
  onLogout: () => void;
}

function getUserName(user: SidebarUserProps["user"]) {
  if (!user) {
    return "Usuario";
  }

  return user.full_name || user.username || "Usuario";
}

function getUserAddress(user: SidebarUserProps["user"]) {
  if (!user?.address) {
    return "Endereco nao cadastrado";
  }

  const firstLine = [user.address.address, user.address.neighborhood]
    .filter((value): value is string => Boolean(value))
    .join(", ");
  const secondLine = [user.address.city, user.address.state]
    .filter((value): value is string => Boolean(value))
    .join(" - ");
  const fullAddress = [firstLine, secondLine]
    .filter((value): value is string => Boolean(value))
    .join(" | ");

  return fullAddress || "Endereco nao cadastrado";
}

function extractApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  if (error && typeof error === "object") {
    const payload = error as {
      error?: {
        message?: string;
      };
      message?: string;
    };

    if (
      typeof payload.error?.message === "string" &&
      payload.error.message.trim().length > 0
    ) {
      return payload.error.message;
    }

    if (typeof payload.message === "string" && payload.message.trim().length > 0) {
      return payload.message;
    }
  }

  return fallback;
}

export function SidebarUser({
  user,
  isLoggingOut,
  onLogout,
}: SidebarUserProps) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedScheduling, setSelectedScheduling] = useState<SidebarSchedulingCard | null>(null);
  const [schedulings, setSchedulings] = useState<SidebarSchedulingCard[]>([]);
  const [isLoadingSchedulings, setIsLoadingSchedulings] = useState(true);
  const [isCancellingScheduling, setIsCancellingScheduling] = useState(false);

  const loadUserSidebarSchedulings = useCallback(async () => {
    setIsLoadingSchedulings(true);

    const result = await sevendaysapi.get<SidebarSchedulingResponse>(
      "/sidebar/schedulings/latest",
      {
        withCredentials: true,
      },
    );

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
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadSafely() {
      if (ignore) {
        return;
      }

      await loadUserSidebarSchedulings();
    }

    void loadSafely();

    return () => {
      ignore = true;
    };
  }, [loadUserSidebarSchedulings]);

  const handleCancelClick = (scheduling: SidebarSchedulingCard) => {
    setSelectedScheduling(scheduling);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedScheduling) {
      return;
    }

    setIsCancellingScheduling(true);

    const result = await sevendaysapi.delete<{ success?: boolean }>(
      `/diaries/${selectedScheduling.diaryId}/schedulings/${selectedScheduling.id}`,
      undefined,
      {
        withCredentials: true,
      },
    );

    if (result.error || result.statusCode !== 200 || !result.data?.success) {
      toast.error(
        extractApiErrorMessage(result.error, "Nao foi possivel cancelar o horario agendado."),
      );
      setIsCancellingScheduling(false);
      return;
    }

    toast.success("Horario cancelado com sucesso.");
    await loadUserSidebarSchedulings();
    setIsCancellingScheduling(false);
    setCancelDialogOpen(false);
    setSelectedScheduling(null);
  };

  return (
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
          <div className="relative flex">
            <button
              type="button"
              className="absolute top-1 right-0 z-10 rounded-full bg-transparent text-primary p-2 hover:bg-accent disabled:opacity-50"
              aria-label="Encerrar sessao"
              onClick={onLogout}
              disabled={isLoggingOut}
            >
              <SignOut size={16} weight="bold" className="text-red-500" />
            </button>
            <div className="pr-10">
              <h1 className="text-2xl font-bold text-accent-foreground">
                {getUserName(user)}
              </h1>
              <Separator className="h-[1px] bg-primary" />
              <div className="flex flex-col">
                <span className="text-sm">{getUserAddress(user)}</span>
              </div>
            </div>
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
              <p className="text-sm text-muted-foreground">
                Sem horarios marcados recentes.
              </p>
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
                          onClick={() => handleCancelClick(item)}
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
        </div>
      </SheetContent>

      <Dialog
        open={cancelDialogOpen}
        onOpenChange={(nextOpen) => {
          setCancelDialogOpen(nextOpen);
          if (!nextOpen && !isCancellingScheduling) {
            setSelectedScheduling(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Agendamento</DialogTitle>
            <DialogDescription>
              Deseja cancelar o horario agendado?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCancelDialogOpen(false);
                if (!isCancellingScheduling) {
                  setSelectedScheduling(null);
                }
              }}
              disabled={isCancellingScheduling}
            >
              Nao
            </Button>
            <Button
              variant="default"
              onClick={handleConfirmCancel}
              disabled={isCancellingScheduling}
            >
              {isCancellingScheduling ? "Cancelando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}
