"use client";
import { useEffect, useMemo, useState } from "react";
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
import {
  Archive,
  CalendarCheck,
  List,
  SignOut,
  Trash,
  User,
} from "@phosphor-icons/react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { sevendaysapi } from "@/lib/sevendaysapi";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type UserStatus = "owner" | "user" | "standard";

type CurrentUserResponse = {
  user?: {
    id?: number;
    full_name?: string;
    username?: string;
    status?: UserStatus;
    address?: {
      address?: string;
      city?: string;
      state?: string;
      neighborhood?: string;
    };
  };
};

type CurrentUser = NonNullable<CurrentUserResponse["user"]>;

type SidebarSchedulingResponse = {
  success: boolean;
  schedulings?: SidebarScheduling[];
};

type SidebarScheduling = {
  id: number;
  diary_id: number;
  diary_title?: string;
  professional_name?: string;
  date: string;
  time: string;
  status: string;
  description: string;
};

type SidebarSchedulingCard = {
  id: number;
  date: string;
  time: string;
  service: string;
  type: string;
  professional: string;
};

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

function formatSchedulingDate(dateValue: string) {
  const isoDateMatch = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch;
    return `${day}/${month}/${year}`;
  }

  const dateInTimestampMatch = dateValue.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (dateInTimestampMatch) {
    const [, year, month, day] = dateInTimestampMatch;
    return `${day}/${month}/${year}`;
  }

  return dateValue;
}

function formatSchedulingTime(timeValue: string) {
  const timeMatch = timeValue.match(/(\d{2}):(\d{2})/);
  if (timeMatch) {
    return `${timeMatch[1]}:${timeMatch[2]}`;
  }

  return timeValue;
}

function mapSidebarSchedulingsToCards(
  schedulings: SidebarScheduling[] | undefined,
): SidebarSchedulingCard[] {
  return (schedulings ?? []).map((scheduling) => ({
    id: scheduling.id,
    date: formatSchedulingDate(scheduling.date),
    time: formatSchedulingTime(scheduling.time),
    service: scheduling.diary_title || "Atendimento",
    type: scheduling.description || "Sem descricao",
    professional: scheduling.professional_name || "Profissional",
  }));
}

function SidebarUserHeader({
  userName,
  userAddress,
  isLoadingUser,
  isLoggingOut,
  onLogout,
}: {
  userName: string;
  userAddress: string;
  isLoadingUser: boolean;
  isLoggingOut: boolean;
  onLogout: () => void;
}) {
  return (
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
        {isLoadingUser ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-52" />
            <Separator className="h-[1px] bg-primary" />
            <Skeleton className="h-4 w-72" />
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-accent-foreground">
              {userName}
            </h1>
            <Separator className="h-[1px] bg-primary" />
            <div className="flex flex-col">
              <span className="text-sm">{userAddress}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SidebarSectionSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-7 w-44" />
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-64" />
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    </div>
  );
}

function OwnerSidebarSection({}) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-accent-foreground">
        ultimos agendamentos
        <Separator className="h-[1px] bg-primary" />
      </h2>
    </div>
  );
}

function CommonUserSidebarSection({
  onOpenPortal,
  onCancelClick,
  schedulings,
  isLoadingSchedulings,
}: {
  onOpenPortal: () => void;
  onCancelClick: (serviceId: number) => void;
  schedulings: SidebarSchedulingCard[];
  isLoadingSchedulings: boolean;
}) {
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
          <Card className="w-full">
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Nenhum agendamento para hoje.
            </CardContent>
          </Card>
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
                      onClick={() => onCancelClick(item.id)}
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
    </>
  );
}

export function SideBar() {
  const router = useRouter();

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    null,
  );
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [sidebarSchedulings, setSidebarSchedulings] = useState<
    SidebarSchedulingCard[]
  >([]);
  const [isLoadingSidebarSchedulings, setIsLoadingSidebarSchedulings] =
    useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadCurrentUser() {
      setIsLoadingUser(true);
      setIsLoadingSidebarSchedulings(true);

      const result = await sevendaysapi.get<CurrentUserResponse>("/user", {
        withCredentials: true,
      });

      if (ignore) {
        return;
      }

      if (result.statusCode === 401 || result.statusCode === 403) {
        setCurrentUser(null);
        setIsLoadingUser(false);
        setSidebarSchedulings([]);
        setIsLoadingSidebarSchedulings(false);
        return;
      }

      if (result.error || result.statusCode !== 200 || !result.data?.user) {
        toast.error("Nao foi possivel carregar os dados do usuario.");
        setIsLoadingUser(false);
        setSidebarSchedulings([]);
        setIsLoadingSidebarSchedulings(false);
        return;
      }

      const loadedUser = result.data.user;
      setCurrentUser(loadedUser);

      if (loadedUser.status !== "owner") {
        const sidebarResult = await sevendaysapi.get<SidebarSchedulingResponse>(
          "/sidebar/schedulings",
          {
            withCredentials: true,
          },
        );

        if (ignore) {
          return;
        }

        if (
          sidebarResult.error ||
          sidebarResult.statusCode !== 200 ||
          !sidebarResult.data?.success
        ) {
          toast.error("Nao foi possivel carregar os agendamentos da sidebar.");
          setSidebarSchedulings([]);
        } else {
          setSidebarSchedulings(
            mapSidebarSchedulingsToCards(sidebarResult.data.schedulings),
          );
        }
      } else {
        setSidebarSchedulings([]);
      }

      setIsLoadingUser(false);
      setIsLoadingSidebarSchedulings(false);
    }

    void loadCurrentUser();

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

  const handleOpenUserPortal = () => {
    if (!currentUser?.username) {
      toast.error("Nao foi possivel abrir o portal do usuario.");
      return;
    }

    router.push(`/${currentUser.username}/portal`);
    router.refresh();
  };

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    const result = await sevendaysapi.delete<unknown>(
      "/users/sign_out",
      undefined,
      { withCredentials: true },
    );

    if (
      result.error ||
      (result.statusCode !== 204 && result.statusCode !== 200)
    ) {
      toast.error("Nao foi possivel encerrar a sessao.");
      setIsLoggingOut(false);
      return;
    }

    toast.success("Sessao encerrada com sucesso.");
    setIsLoggingOut(false);
    router.push("/login");
    router.refresh();
  };

  const userName = useMemo(() => {
    return getUserName(currentUser);
  }, [currentUser]);
  const userAddress = useMemo(() => {
    return getUserAddress(currentUser);
  }, [currentUser]);
  const userStatus = currentUser?.status;
  const isOwner = userStatus === "owner";

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
            <SidebarUserHeader
              userName={userName}
              userAddress={userAddress}
              isLoadingUser={isLoadingUser}
              isLoggingOut={isLoggingOut}
              onLogout={handleLogout}
            />

            {isLoadingUser ? (
              <SidebarSectionSkeleton />
            ) : isOwner ? (
              <OwnerSidebarSection />
            ) : (
              <CommonUserSidebarSection
                onOpenPortal={handleOpenUserPortal}
                onCancelClick={handleCancelClick}
                schedulings={sidebarSchedulings}
                isLoadingSchedulings={isLoadingSidebarSchedulings}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {isOwner ? null : (
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
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
                onClick={() => setCancelDialogOpen(false)}
              >
                Nao
              </Button>
              <Button variant="default" onClick={handleConfirmCancel}>
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
