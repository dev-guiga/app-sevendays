import { NextRequest, NextResponse } from "next/server";

type MiddlewareUserStatus = "owner" | "user" | "standard";

type MiddlewareCurrentUser = {
  id?: number;
  status?: MiddlewareUserStatus;
};

type CurrentUserApiResponse = {
  user?: MiddlewareCurrentUser;
};

type DiaryOwnershipApiResponse = {
  success?: boolean;
  diary_data?: {
    professional?: {
      id?: number;
    };
  };
};

const PUBLIC_ROUTES = new Set(["/", "/login", "/cadastro", "/signup"]);

function normalizePathname(pathname: string) {
  if (!pathname) {
    return "/";
  }

  if (pathname !== "/" && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

function buildRedirect(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return NextResponse.redirect(url);
}

function buildUserDefaultPath(currentUser: MiddlewareCurrentUser | null) {
  if (currentUser?.status === "owner" && currentUser.id) {
    return `/admin/${currentUser.id}/dashboard`;
  }

  if (currentUser?.id) {
    return `/${currentUser.id}/portal`;
  }

  return "/login";
}

function buildForwardHeaders(request: NextRequest) {
  const headers = new Headers();
  const cookieHeader = request.headers.get("cookie");
  const authorizationHeader = request.headers.get("authorization");

  headers.set("accept", "application/json");

  if (cookieHeader) {
    headers.set("cookie", cookieHeader);
  }

  if (authorizationHeader) {
    headers.set("authorization", authorizationHeader);
  }

  return headers;
}

async function parseJsonSafely<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function fetchCurrentUser(
  request: NextRequest,
): Promise<MiddlewareCurrentUser | null> {
  const response = await fetch(new URL("/api/user", request.url), {
    method: "GET",
    headers: buildForwardHeaders(request),
    cache: "no-store",
  });

  if (response.status === 401 || response.status === 403) {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  const data = await parseJsonSafely<CurrentUserApiResponse>(response);
  return data?.user ?? null;
}

async function ownerHasAccessToDiary({
  request,
  ownerId,
  diaryId,
}: {
  request: NextRequest;
  ownerId: number;
  diaryId: number;
}) {
  const response = await fetch(new URL(`/api/diaries/${diaryId}`, request.url), {
    method: "GET",
    headers: buildForwardHeaders(request),
    cache: "no-store",
  });

  if (!response.ok) {
    return false;
  }

  const data = await parseJsonSafely<DiaryOwnershipApiResponse>(response);
  const professionalId = Number(data?.diary_data?.professional?.id);
  return (
    Boolean(data?.success) &&
    Number.isFinite(professionalId) &&
    professionalId === ownerId
  );
}

export async function middleware(request: NextRequest) {
  const pathname = normalizePathname(request.nextUrl.pathname);
  const segments = pathname.split("/").filter(Boolean);
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

  const currentUser = await fetchCurrentUser(request);

  if (!currentUser) {
    if (isGlobalArea || PUBLIC_ROUTES.has(pathname)) {
      return NextResponse.next();
    }

    return buildRedirect(request, "/login");
  }

  if (currentUser.status === "owner") {
    if (!currentUser.id) {
      return buildRedirect(request, "/login");
    }

    if (isOwnerArea) {
      const routeOwnerId = Number(segments[1]);
      const ownerTail = segments.slice(2).join("/");
      const canonicalPath = `/admin/${currentUser.id}/${ownerTail || "dashboard"}`;

      if (
        !Number.isFinite(routeOwnerId) ||
        routeOwnerId !== currentUser.id ||
        !ownerTail
      ) {
        return buildRedirect(request, canonicalPath);
      }

      return NextResponse.next();
    }

    if (isOwnerAllowedDiaryRoute) {
      const routeUserId = Number(segments[0]);
      const diaryId = Number(segments[3]);

      if (!Number.isFinite(routeUserId) || routeUserId !== currentUser.id) {
        return buildRedirect(request, `/${currentUser.id}/portal/e/${diaryId}`);
      }

      const hasAccess = await ownerHasAccessToDiary({
        request,
        ownerId: currentUser.id,
        diaryId,
      });

      if (hasAccess) {
        return NextResponse.next();
      }
    }

    return buildRedirect(request, `/admin/${currentUser.id}/dashboard`);
  }

  if (isOwnerArea) {
    return buildRedirect(request, buildUserDefaultPath(currentUser));
  }

  if (isGlobalArea || PUBLIC_ROUTES.has(pathname)) {
    return NextResponse.next();
  }

  if (!currentUser.id) {
    return buildRedirect(request, "/login");
  }

  const routeUserId = Number(segments[0]);
  if (!Number.isFinite(routeUserId) || routeUserId !== currentUser.id) {
    const userTail = segments.slice(1).join("/");
    return buildRedirect(request, `/${currentUser.id}/${userTail}`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
