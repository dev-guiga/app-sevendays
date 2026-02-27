"use client";

import { useEffect, useState } from "react";

import logo from "@/app/assets/image/logo-seven-days.png";
import { HeaderNavigationWrapper } from "@/components/HeaderNavigationWrapper";
import { ModeToggle } from "@/components/Mode-toggle";
import { SidebarOwner } from "@/components/SidebarOwner";
import { SidebarUser } from "@/components/SidebarUser";
import { Skeleton } from "@/components/ui/skeleton";
import { sevendaysapi } from "@/lib/sevendaysapi";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import { toast } from "sonner";

type UserStatus = "owner" | "user" | "standard";

type CurrentUser = {
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

type CurrentUserResponse = {
  user?: CurrentUser;
};

export function Header() {
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

  const isOwner = currentUser?.status === "owner";

  return (
    <>
      <header className="sticky top-0 w-full pt-2 pb-0 bg-accent z-10 border-b border-border/30">
        <div className="w-full max-w-7xl flex flex-col items-start justify-center gap-0 px-4 sm:mx-auto mx-0">
          <div className="w-full flex items-center justify-between gap-3 pb-2">
            <div className="flex items-center justify-center gap-2">
              <div>
                <NextImage src={logo} alt="Logo" width={45} height={45} />
              </div>
              <h1 className="text-2xl font-bold">Sev7en Days</h1>
            </div>

            <div className="flex items-center gap-2">
              <ModeToggle />
              {isLoadingUser ? (
                <Skeleton className="h-9 w-9 rounded-md" />
              ) : isOwner ? (
                <SidebarOwner
                  user={currentUser}
                  isLoggingOut={isLoggingOut}
                  onLogout={handleLogout}
                />
              ) : (
                <SidebarUser
                  user={currentUser}
                  isLoggingOut={isLoggingOut}
                  onLogout={handleLogout}
                  onOpenPortal={handleOpenUserPortal}
                />
              )}
            </div>
          </div>

          <HeaderNavigationWrapper currentUser={currentUser} isLoading={isLoadingUser} />
        </div>
      </header>
    </>
  );
}
