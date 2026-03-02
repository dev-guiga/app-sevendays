"use client";

import { useEffect, useMemo, useState } from "react";

import AvatarProfile from "@/components/Avatar";
import { TableUserSchedulings } from "@/components/TableUserSchedulings";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { sevendaysapi } from "@/lib/sevendaysapi";
import { CalendarDays, IdCard, Mail, MapPin, UserRound } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

type CurrentUserResponse = {
  user?: {
    id?: number;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    username?: string;
    email?: string;
    status?: "owner" | "user" | "standard";
    cpf?: string;
    birth_date?: string;
    address?: {
      address?: string;
      city?: string;
      state?: string;
      neighborhood?: string;
    };
  };
};

type UserProfile = NonNullable<CurrentUserResponse["user"]>;

function formatAddress(address?: UserProfile["address"]) {
  if (!address) {
    return "Endereco nao cadastrado";
  }

  const firstLine = [address.address, address.neighborhood]
    .filter((value): value is string => Boolean(value))
    .join(", ");
  const secondLine = [address.city, address.state]
    .filter((value): value is string => Boolean(value))
    .join(" - ");

  const fullAddress = [firstLine, secondLine]
    .filter((value): value is string => Boolean(value))
    .join(" | ");

  return fullAddress || "Endereco nao cadastrado";
}

function formatBirthDate(value?: string) {
  if (!value) {
    return "Nascimento nao informado";
  }

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return value;
  }

  return `${match[3]}/${match[2]}/${match[1]}`;
}

function getUserName(user: UserProfile | null) {
  if (!user) {
    return "Usuario";
  }

  return (
    user.full_name ||
    [user.first_name, user.last_name].filter(Boolean).join(" ").trim() ||
    user.username ||
    "Usuario"
  );
}

export default function UserProfilePage() {
  const params = useParams<{ user?: string | string[] }>();
  const router = useRouter();

  const routeUsername = Array.isArray(params?.user)
    ? params.user[0]
    : params?.user;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const avatarUrl = useMemo(() => {
    const seed = getUserName(profile);
    return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed)}`;
  }, [profile]);

  const addressText = useMemo(
    () => formatAddress(profile?.address),
    [profile?.address],
  );
  const birthDateText = useMemo(
    () => formatBirthDate(profile?.birth_date),
    [profile?.birth_date],
  );
  const cpfText = useMemo(
    () => profile?.cpf || "CPF nao informado",
    [profile?.cpf],
  );
  const profileInfoText = useMemo(() => {
    if (!profile) {
      return "";
    }

    return `@${profile.username ?? "usuario"} • ${profile.email ?? "sem e-mail"}`;
  }, [profile]);

  useEffect(() => {
    let ignore = false;

    async function loadProfile() {
      setIsLoading(true);

      const result = await sevendaysapi.get<CurrentUserResponse>("/user", {
        withCredentials: true,
      });

      if (ignore) {
        return;
      }

      if (result.statusCode === 401 || result.statusCode === 403) {
        toast.error("Sessao expirada. Faca login novamente.");
        router.replace("/login");
        return;
      }

      if (result.error || result.statusCode !== 200 || !result.data?.user) {
        toast.error("Nao foi possivel carregar os dados do perfil.");
        setIsLoading(false);
        return;
      }

      const currentUser = result.data.user;
      if (currentUser.status === "owner") {
        if (currentUser.id) {
          router.replace(`/admin/${currentUser.id}/dashboard`);
        }
        return;
      }

      if (
        currentUser.username &&
        routeUsername &&
        currentUser.username !== routeUsername
      ) {
        router.replace(`/${currentUser.username}/perfil`);
      }

      setProfile(currentUser);
      setIsLoading(false);
    }

    void loadProfile();

    return () => {
      ignore = true;
    };
  }, [routeUsername, router]);

  return (
    <div className="w-full max-w-7xl flex flex-col items-start justify-start gap-10 sm:mx-auto mx-0 px-4">
      <div className="w-full flex flex-col items-start justify-start py-10">
        <div className="flex flex-row justify-start items-center gap-5 max-[500px]:flex-col max-[500px]:items-start">
          <div className="flex flex-row justify-center items-center gap-2">
            {isLoading ? (
              <Skeleton className="w-20 h-20 rounded-full border-solid border-2 border-primary/50" />
            ) : (
              <AvatarProfile
                src={avatarUrl}
                className="w-20 h-20 rounded-full border-solid border-2 border-primary/50 object-cover"
              />
            )}
          </div>

          <div className="flex flex-col items-start gap-2 w-full">
            <div className="w-max">
              {isLoading ? (
                <Skeleton className="h-8 w-56" />
              ) : (
                <div>
                  <h1 className="text-2xl font-bold">{getUserName(profile)}</h1>
                  <Separator className="h-[1px] bg-primary/50" />
                </div>
              )}
            </div>

            <div className="flex flex-col justify-start items-start gap-2">
              <div className="flex flex-row items-center gap-2">
                <MapPin size={16} className="text-primary" />
                <span className="text-[14px] text-muted-foreground">
                  <span className="text-[14px] font-semibold">Endereco:</span>{" "}
                  {isLoading ? (
                    <Skeleton className="inline-block h-[14px] w-72 align-middle" />
                  ) : (
                    addressText
                  )}
                  <Separator className="w-full h-[1px] bg-primary/50" />
                </span>
              </div>

              <div className="flex flex-row items-center gap-2">
                <UserRound size={16} className="text-primary" />
                <span className="text-[14px] text-muted-foreground">
                  <span className="text-[14px] font-semibold">Info:</span>{" "}
                  {isLoading ? (
                    <Skeleton className="inline-block h-[14px] w-72 align-middle" />
                  ) : (
                    profileInfoText
                  )}
                  <Separator className="w-full h-[1px] bg-primary/50" />
                </span>
              </div>

              <div className="flex flex-row items-center gap-2">
                <Mail size={16} className="text-primary" />
                <span className="text-[14px] text-muted-foreground">
                  <span className="text-[14px] font-semibold">Email:</span>{" "}
                  {isLoading ? (
                    <Skeleton className="inline-block h-[14px] w-64 align-middle" />
                  ) : (
                    profile?.email || "Email nao informado"
                  )}
                  <Separator className="w-full h-[1px] bg-primary/50" />
                </span>
              </div>

              <div className="flex flex-row items-center gap-2">
                <IdCard size={16} className="text-primary" />
                <span className="text-[14px] text-muted-foreground">
                  <span className="text-[14px] font-semibold">CPF:</span>{" "}
                  {isLoading ? (
                    <Skeleton className="inline-block h-[14px] w-48 align-middle" />
                  ) : (
                    cpfText
                  )}
                  <Separator className="w-full h-[1px] bg-primary/50" />
                </span>
              </div>

              <div className="flex flex-row items-center gap-2">
                <CalendarDays size={16} className="text-primary" />
                <span className="text-[14px] text-muted-foreground">
                  <span className="text-[14px] font-semibold">Nascimento:</span>{" "}
                  {isLoading ? (
                    <Skeleton className="inline-block h-[14px] w-40 align-middle" />
                  ) : (
                    birthDateText
                  )}
                  <Separator className="w-full h-[1px] bg-primary/50" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-7 pb-10 overflow-hidden">
        <h1 className="text-3xl text-primary/90 font-bold">
          Meus horarios agendados
        </h1>
        <TableUserSchedulings />
      </div>
    </div>
  );
}
