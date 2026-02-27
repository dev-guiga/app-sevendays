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
  User,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import {
  mapSidebarSchedulingsToCards,
  type SidebarSchedulingCard,
  type SidebarSchedulingResponse,
} from "./sidebar-scheduling-utils";

type CurrentUser = {
  full_name?: string;
  username?: string;
  address?: {
    address?: string;
    city?: string;
    state?: string;
    neighborhood?: string;
  };
};

interface SidebarOwnerProps {
  user: CurrentUser | null;
  isLoggingOut: boolean;
  onLogout: () => void;
}

function getUserName(user: CurrentUser | null) {
  if (!user) {
    return "Usuario";
  }

  return user.full_name || user.username || "Usuario";
}

function getUserAddress(user: CurrentUser | null) {
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

export function SidebarOwner({
  user,
  isLoggingOut,
  onLogout,
}: SidebarOwnerProps) {
  const [schedulings, setSchedulings] = useState<SidebarSchedulingCard[]>([]);
  const [isLoadingSchedulings, setIsLoadingSchedulings] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadOwnerSidebarSchedulings() {
      setIsLoadingSchedulings(true);

      const result = await sevendaysapi.get<SidebarSchedulingResponse>(
        "/owner/sidebar/schedulings",
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
        toast.error("Nao foi possivel carregar os agendamentos do owner.");
        setSchedulings([]);
        setIsLoadingSchedulings(false);
        return;
      }

      setSchedulings(mapSidebarSchedulingsToCards(result.data.schedulings));
      setIsLoadingSchedulings(false);
    }

    void loadOwnerSidebarSchedulings();

    return () => {
      ignore = true;
    };
  }, []);

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
                Sem agendamentos hoje.
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
    </Sheet>
  );
}
