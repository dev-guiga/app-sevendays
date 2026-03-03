"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { sevendaysapi } from "@/lib/sevendaysapi";
import { usePathname, useRouter } from "next/navigation";

export type UserStatus = "owner" | "user" | "standard";

export type CurrentUser = {
  id?: number;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  username?: string;
  email?: string;
  status?: UserStatus;
  cpf?: string;
  birth_date?: string;
  professional_description?: string | null;
  professional_document?: string | null;
  professional_branch?: string | null;
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

type RefreshCurrentUserOptions = {
  silent?: boolean;
  force?: boolean;
};

type UserContextValue = {
  currentUser: CurrentUser | null;
  isLoadingUser: boolean;
  isLoggingOut: boolean;
  isAuthenticated: boolean;
  isOwner: boolean;
  refreshCurrentUser: (
    options?: RefreshCurrentUserOptions,
  ) => Promise<CurrentUser | null>;
  logout: () => Promise<boolean>;
};

type AccessDecision = {
  canRender: boolean;
  redirectTo: string | null;
};

const USER_REFRESH_INTERVAL_MS = 60_000;
const PUBLIC_ROUTES = new Set(["/", "/login", "/cadastro", "/signup"]);
const CURRENT_USER_QUERY_KEY = ["current-user"] as const;

const UserContext = createContext<UserContextValue | undefined>(undefined);

function normalizePathname(pathname: string) {
  if (!pathname) {
    return "/";
  }

  if (pathname !== "/" && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

function getUserDefaultPath(currentUser: CurrentUser | null) {
  if (currentUser?.status === "owner" && currentUser.id) {
    return `/admin/${currentUser.id}/dashboard`;
  }

  if (currentUser?.id) {
    return `/${currentUser.id}/portal`;
  }

  return "/login";
}

function resolveAccessDecision({
  pathname,
  currentUser,
  isLoadingUser,
}: {
  pathname: string;
  currentUser: CurrentUser | null;
  isLoadingUser: boolean;
}): AccessDecision {
  const normalizedPathname = normalizePathname(pathname);
  const segments = normalizedPathname.split("/").filter(Boolean);
  const isOwnerArea = segments[0] === "admin";
  const isUserArea =
    segments.length >= 2 &&
    (segments[1] === "portal" || segments[1] === "perfil");
  const isGlobalArea = !isOwnerArea && !isUserArea;
  const isOwnerAllowedDiaryRoute =
    isUserArea &&
    segments[1] === "portal" &&
    segments[2] === "e" &&
    segments.length === 4 &&
    Number.isFinite(Number(segments[3])) &&
    Number(segments[3]) > 0;

  if (!currentUser) {
    if (isGlobalArea || PUBLIC_ROUTES.has(normalizedPathname)) {
      return { canRender: true, redirectTo: null };
    }

    if (isLoadingUser) {
      return { canRender: false, redirectTo: null };
    }

    return { canRender: false, redirectTo: "/login" };
  }

  if (isOwnerArea) {
    if (currentUser.status !== "owner" || !currentUser.id) {
      return {
        canRender: false,
        redirectTo: getUserDefaultPath(currentUser),
      };
    }

    const routeOwnerId = Number(segments[1]);
    const ownerTail = segments.slice(2).join("/");
    const canonicalPath = `/admin/${currentUser.id}${ownerTail ? `/${ownerTail}` : "/dashboard"}`;

    if (
      !Number.isFinite(routeOwnerId) ||
      routeOwnerId !== currentUser.id ||
      !ownerTail
    ) {
      return { canRender: false, redirectTo: canonicalPath };
    }

    return { canRender: true, redirectTo: null };
  }

  if (currentUser.status === "owner") {
    if (isOwnerAllowedDiaryRoute) {
      const routeUserId = Number(segments[0]);
      const diaryId = Number(segments[3]);

      if (!Number.isFinite(routeUserId) || routeUserId !== currentUser.id) {
        return {
          canRender: false,
          redirectTo: `/${currentUser.id}/portal/e/${diaryId}`,
        };
      }

      return { canRender: true, redirectTo: null };
    }

    return {
      canRender: false,
      redirectTo: getUserDefaultPath(currentUser),
    };
  }

  if (isGlobalArea) {
    return { canRender: true, redirectTo: null };
  }

  if (!isUserArea) {
    return { canRender: true, redirectTo: null };
  }

  if (!currentUser.id) {
    return {
      canRender: false,
      redirectTo: "/login",
    };
  }

  const routeUserId = Number(segments[0]);
  if (!Number.isFinite(routeUserId) || routeUserId !== currentUser.id) {
    const userTail = segments.slice(1).join("/");
    return {
      canRender: false,
      redirectTo: `/${currentUser.id}/${userTail}`,
    };
  }

  return { canRender: true, redirectTo: null };
}

export function UserProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isLoggingOutRef = useRef(false);

  useEffect(() => {
    isLoggingOutRef.current = isLoggingOut;
  }, [isLoggingOut]);

  const fetchCurrentUser = useCallback(async () => {
    const result = await sevendaysapi.get<CurrentUserResponse>("/user", {
      withCredentials: true,
    });

    if (result.statusCode === 401 || result.statusCode === 403) {
      return null;
    }

    if (result.error || result.statusCode !== 200 || !result.data?.user) {
      return (
        queryClient.getQueryData<CurrentUser | null>(CURRENT_USER_QUERY_KEY) ?? null
      );
    }

    return result.data.user;
  }, [queryClient]);

  const currentUserQuery = useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: fetchCurrentUser,
    staleTime: USER_REFRESH_INTERVAL_MS,
    refetchInterval: USER_REFRESH_INTERVAL_MS,
    refetchOnWindowFocus: true,
  });

  const refreshCurrentUser = useCallback(
    async (options: RefreshCurrentUserOptions = {}) => {
      const shouldForceRefresh = Boolean(options.force);

      if (!options.silent || shouldForceRefresh) {
        await queryClient.invalidateQueries({
          queryKey: CURRENT_USER_QUERY_KEY,
        });
      }

      const refreshedUser = await queryClient.fetchQuery({
        queryKey: CURRENT_USER_QUERY_KEY,
        queryFn: fetchCurrentUser,
        staleTime:
          options.silent && !shouldForceRefresh ? USER_REFRESH_INTERVAL_MS : 0,
      });

      return refreshedUser;
    },
    [fetchCurrentUser, queryClient],
  );

  useEffect(() => {
    void refreshCurrentUser({ silent: true });
  }, [pathname, refreshCurrentUser]);

  const logout = useCallback(async () => {
    if (isLoggingOutRef.current) {
      return false;
    }

    setIsLoggingOut(true);

    const result = await sevendaysapi.delete<unknown>(
      "/users/sign_out",
      undefined,
      { withCredentials: true },
    );

    if (result.error || (result.statusCode !== 200 && result.statusCode !== 204)) {
      setIsLoggingOut(false);
      return false;
    }

    queryClient.setQueryData(CURRENT_USER_QUERY_KEY, null);
    setIsLoggingOut(false);
    return true;
  }, [queryClient]);

  const currentUser = currentUserQuery.data ?? null;
  const value = useMemo<UserContextValue>(
    () => ({
      currentUser,
      isLoadingUser: currentUserQuery.isPending,
      isLoggingOut,
      isAuthenticated: Boolean(currentUser),
      isOwner: currentUser?.status === "owner",
      refreshCurrentUser,
      logout,
    }),
    [currentUser, currentUserQuery.isPending, isLoggingOut, refreshCurrentUser, logout],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function UserAccessGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isLoadingUser } = useUser();

  const decision = useMemo(
    () =>
      resolveAccessDecision({
        pathname,
        currentUser,
        isLoadingUser,
      }),
    [pathname, currentUser, isLoadingUser],
  );

  useEffect(() => {
    if (!decision.redirectTo) {
      return;
    }

    if (normalizePathname(pathname) === normalizePathname(decision.redirectTo)) {
      return;
    }

    router.replace(decision.redirectTo);
  }, [decision.redirectTo, pathname, router]);

  if (!decision.canRender) {
    return null;
  }

  return <>{children}</>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider.");
  }

  return context;
}
