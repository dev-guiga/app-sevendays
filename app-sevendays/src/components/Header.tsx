"use client";

import logo from "@/app/assets/image/logo-seven-days.png";
import { HeaderNavigationWrapper } from "@/components/HeaderNavigationWrapper";
import { ModeToggle } from "@/components/Mode-toggle";
import { SidebarOwner } from "@/components/SidebarOwner";
import { SidebarUser } from "@/components/SidebarUser";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/contexts/user-context";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import { toast } from "sonner";

export function Header() {
  const router = useRouter();
  const { currentUser, isLoadingUser, isLoggingOut, isOwner, logout } =
    useUser();

  const handleLogout = async () => {
    const hasLoggedOut = await logout();
    if (!hasLoggedOut) {
      toast.error("Nao foi possivel encerrar a sessao.");
      return;
    }

    toast.success("Sessao encerrada com sucesso.");
    router.push("/login");
    router.refresh();
  };

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
