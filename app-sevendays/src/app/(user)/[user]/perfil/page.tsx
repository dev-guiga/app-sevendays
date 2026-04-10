"use client";

import { Calendar, Envelope, IdentificationBadge, MapPin, UserIcon } from "@phosphor-icons/react";

import { TableUserSchedulings } from "@/components/TableUserSchedulings";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import AvatarProfile from "@/components/Avatar";

import { useUser } from "@/contexts/user-context";

import { formatAddress, formatBirthDate, getUserName } from "@/lib/helpers/profile";

export default function UserProfilePage() {
  const { currentUser, isLoadingUser } = useUser();

  const isLoading = isLoadingUser || !currentUser;

  return (
    <div className="w-full max-w-7xl flex flex-col items-start justify-start gap-10 sm:mx-auto mx-0 px-4">
      <div className="w-full flex flex-col items-start justify-start py-10">
        <div className="flex flex-row justify-start items-center gap-5 max-[500px]:flex-col max-[500px]:items-start">
          <div className="flex flex-row justify-center items-center gap-2">
            {isLoading ? (
              <Skeleton className="w-20 h-20 rounded-full border-solid border-2 border-primary/50" />
            ) : (
              <AvatarProfile
                src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(getUserName(currentUser))}`}
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
                  <h1 className="text-2xl font-bold">{getUserName(currentUser)}</h1>
                  <Separator className="h-[1px] bg-primary/50" />
                </div>
              )}
            </div>

            <div className="flex flex-col justify-start items-start gap-2">
              <div className="flex flex-row items-center gap-2">
                <MapPin size={16} className="text-primary" />
                <span className="text-[14px] text-muted-foreground">
                  <span className="text-[14px] font-semibold">Endereço:</span>{" "}
                  {isLoading ? (
                    <Skeleton className="inline-block h-[14px] w-72 align-middle" />
                  ) : (
                    formatAddress(currentUser?.address)
                  )}
                  <Separator className="w-full h-[1px] bg-primary/50" />
                </span>
              </div>

              <div className="flex flex-row items-center gap-2">
                <UserIcon size={16} className="text-primary" />
                <span className="text-[14px] text-muted-foreground">
                  <span className="text-[14px] font-semibold">Info:</span>{" "}
                  {isLoading ? (
                    <Skeleton className="inline-block h-[14px] w-72 align-middle" />
                  ) : (
                    <>
                      <span>@{currentUser?.username ?? "usuario"}</span> •{" "}
                      <span>{currentUser?.email ?? "sem e-mail"}</span>
                    </>
                  )}
                  <Separator className="w-full h-[1px] bg-primary/50" />
                </span>
              </div>

              <div className="flex flex-row items-center gap-2">
                <Envelope size={16} className="text-primary" />
                <span className="text-[14px] text-muted-foreground">
                  <span className="text-[14px] font-semibold">Email:</span>{" "}
                  {isLoading ? (
                    <Skeleton className="inline-block h-[14px] w-64 align-middle" />
                  ) : (
                    currentUser?.email || "E-mail não informado"
                  )}
                  <Separator className="w-full h-[1px] bg-primary/50" />
                </span>
              </div>

              <div className="flex flex-row items-center gap-2">
                <IdentificationBadge size={16} className="text-primary" />
                <span className="text-[14px] text-muted-foreground">
                  <span className="text-[14px] font-semibold">CPF:</span>{" "}
                  {isLoading ? (
                    <Skeleton className="inline-block h-[14px] w-48 align-middle" />
                  ) : (
                    currentUser?.cpf || "CPF não informado"
                  )}
                  <Separator className="w-full h-[1px] bg-primary/50" />
                </span>
              </div>

              <div className="flex flex-row items-center gap-2">
                <Calendar size={16} className="text-primary" />
                <span className="text-[14px] text-muted-foreground">
                  <span className="text-[14px] font-semibold">Nascimento:</span>{" "}
                  {isLoading ? (
                    <Skeleton className="inline-block h-[14px] w-40 align-middle" />
                  ) : (
                    formatBirthDate(currentUser?.birth_date)
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
          Meus horários agendados
        </h1>
        <TableUserSchedulings />
      </div>
    </div>
  );
}
