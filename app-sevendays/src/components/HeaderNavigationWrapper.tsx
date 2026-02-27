"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type HeaderCurrentUser = {
  id?: number;
  username?: string;
  status?: "owner" | "user" | "standard";
} | null;

interface HeaderNavigationWrapperProps {
  currentUser: HeaderCurrentUser;
  isLoading: boolean;
}

function HeaderNavLink({
  href,
  label,
  isActive,
}: {
  href: string;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-end border-b-2 border-transparent bg-transparent px-0 pb-px text-sm leading-none font-medium [font-family:var(--rationale-font)] transition-colors",
        isActive
          ? "border-b-primary text-primary"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

function OwnerNavigation({ ownerId }: { ownerId: number }) {
  const pathname = usePathname();
  const dashboardPath = `/admin/${ownerId}/dashboard`;
  const settingsPath = `/admin/${ownerId}/settings`;

  return (
    <>
      <HeaderNavLink
        href={dashboardPath}
        label="Dashboard"
        isActive={pathname === dashboardPath}
      />
      <HeaderNavLink
        href={settingsPath}
        label="Configurações"
        isActive={pathname === settingsPath}
      />
    </>
  );
}

function UserNavigation({ username }: { username: string }) {
  const pathname = usePathname();
  const portalPath = `/${username}/portal`;

  return (
    <>
      <HeaderNavLink href="/" label="Início" isActive={pathname === "/"} />
      <HeaderNavLink
        href={portalPath}
        label="Portal"
        isActive={pathname === portalPath || pathname.startsWith(`${portalPath}/`)}
      />
    </>
  );
}

function PublicNavigation() {
  const pathname = usePathname();

  return (
    <>
      <HeaderNavLink href="/" label="Início" isActive={pathname === "/"} />
      <HeaderNavLink href="/login" label="Login" isActive={pathname === "/login"} />
      <HeaderNavLink
        href="/cadastro"
        label="Cadastro"
        isActive={pathname === "/cadastro"}
      />
    </>
  );
}

export function HeaderNavigationWrapper({
  currentUser,
  isLoading,
}: HeaderNavigationWrapperProps) {
  if (isLoading) {
    return (
      <nav className="w-full flex items-end gap-6 overflow-x-auto">
        <Skeleton className="h-4 w-24 rounded-none" />
        <Skeleton className="h-4 w-24 rounded-none" />
      </nav>
    );
  }

  const isOwner = currentUser?.status === "owner" && Boolean(currentUser?.id);
  const isUser = Boolean(currentUser?.username) && currentUser?.status !== "owner";

  return (
    <nav className="w-full flex items-end gap-6 overflow-x-auto [&::-webkit-scrollbar]:hidden">
      {isOwner ? (
        <OwnerNavigation ownerId={Number(currentUser?.id)} />
      ) : isUser ? (
        <UserNavigation username={String(currentUser?.username)} />
      ) : (
        <PublicNavigation />
      )}
    </nav>
  );
}
