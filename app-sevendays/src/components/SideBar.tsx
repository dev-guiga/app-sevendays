"use client";

import { useEffect, useMemo, useState } from "react";

import { SidebarOwner } from "@/components/SidebarOwner";
import { SidebarUser } from "@/components/SidebarUser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { List, SignOut } from "@phosphor-icons/react";
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

export function SidebarByRole() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadCurrentUser() {
      setIsLoadingUser(true);

      const result = await sevendaysapi.get<CurrentUserResponse>("/user", {
        withCredentials: true,
      });

      if (ignore) {
        return;
      }

      if (result.statusCode === 401 || result.statusCode === 403) {
        setCurrentUser(null);
        setIsLoadingUser(false);
        return;
      }

      if (result.error || result.statusCode !== 200 || !result.data?.user) {
        toast.error("Nao foi possivel carregar os dados do usuario.");
        setCurrentUser(null);
        setIsLoadingUser(false);
        return;
      }

      setCurrentUser(result.data.user);
      setIsLoadingUser(false);
    }

    void loadCurrentUser();

    return () => {
      ignore = true;
    };
  }, []);

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

  const userName = useMemo(() => getUserName(currentUser), [currentUser]);
  const userAddress = useMemo(() => getUserAddress(currentUser), [currentUser]);
  const isOwner = currentUser?.status === "owner";

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
            <SidebarOwner user={currentUser} isLoggingOut={isLoggingOut} onLogout={handleLogout} />
          ) : (
            <SidebarUser user={currentUser} isLoggingOut={isLoggingOut} onLogout={handleLogout} onOpenPortal={handleOpenUserPortal} />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
