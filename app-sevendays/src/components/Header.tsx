"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import logo from "@/app/assets/image/logo-seven-days.png";
import { HeaderNavigationWrapper } from "@/components/HeaderNavigationWrapper";
import { ModeToggle } from "@/components/Mode-toggle";
import { SidebarOwner } from "@/components/SidebarOwner";
import { SidebarUser } from "@/components/SidebarUser";
import { Skeleton } from "@/components/ui/skeleton";
import { sevendaysapi } from "@/lib/sevendaysapi";
import { usePathname, useRouter } from "next/navigation";
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

const USER_REFRESH_INTERVAL_MS = 12_000;

export function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const hasLoadedOnceRef = useRef(false);
  const isMountedRef = useRef(false);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadCurrentUser = useCallback(
    async ({ silent = true }: { silent?: boolean } = {}) => {
      if (isFetchingRef.current) {
        return;
      }

      if (!silent || !hasLoadedOnceRef.current) {
        setIsLoadingUser(true);
      }

      isFetchingRef.current = true;
      const result = await sevendaysapi.get<CurrentUserResponse>("/user", {
        withCredentials: true,
      });
      isFetchingRef.current = false;

      if (!isMountedRef.current) {
        return;
      }

      hasLoadedOnceRef.current = true;

      if (result.statusCode === 401 || result.statusCode === 403) {
        setCurrentUser(null);
        setIsLoadingUser(false);
        return;
      }

      if (result.error || result.statusCode !== 200 || !result.data?.user) {
        setIsLoadingUser(false);
        return;
      }

      setCurrentUser(result.data.user);
      setIsLoadingUser(false);
    },
    [],
  );

  useEffect(() => {
    void loadCurrentUser({ silent: true });
  }, [loadCurrentUser, pathname]);

  useEffect(() => {
    const handleWindowFocus = () => {
      void loadCurrentUser({ silent: true });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void loadCurrentUser({ silent: true });
      }
    };

    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const intervalId = window.setInterval(() => {
      void loadCurrentUser({ silent: true });
    }, USER_REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadCurrentUser]);

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
    setCurrentUser(null);
    setIsLoadingUser(false);
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
