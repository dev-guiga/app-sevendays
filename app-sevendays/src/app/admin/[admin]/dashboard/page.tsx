"use client";
import { BookOpen, MapPin, PencilSimple, User } from "@phosphor-icons/react";

import { EditableAvatar } from "@/components/EditableAvatar";
import { OwnerCreateSchedulingModal } from "@/components/OwnerCreateSchedulingModal";
import { OwnerProfileEditModal } from "@/components/OwnerProfileEditModal";
import { TableClients } from "@/components/TableClients";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";


import { useOwnerDashboard } from "@/hooks/useOwnerDashboard";
import { useOwnerProfileSave } from "@/hooks/useOwnerProfileSave";
import { useProfileAvatar } from "@/hooks/useProfileAvatar";

import { getOwnerName } from "@/lib/helpers/owner-dashboard";

export default function HomeAdmin() {
  const {
    owner,
    isLoading,
    isEditModalOpen,
    setIsEditModalOpen,
    schedulingsReloadToken,
    setSchedulingsReloadToken,
    ownerAddress,
    ownerInfo,
    ownerWorkDescription,
    ownerAvatar,
    refreshCurrentUser,
  } = useOwnerDashboard();

  const { isSavingProfile, handleSaveProfile } = useOwnerProfileSave({
    refreshCurrentUser,
    onSuccess: () => setIsEditModalOpen(false),
  });
  const ownerName = owner ? getOwnerName(owner) : "Profissional";
  const { avatarSrc, setStoredAvatar } = useProfileAvatar(
    owner?.id ? `owner:${owner.id}` : null,
    ownerAvatar,
  );

  const handleAvatarFileSelect = async (file: File) => {
    const nextAvatar = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

    setStoredAvatar(nextAvatar);
  };

  return (
    <div className="w-full max-w-7xl flex flex-col items-start justify-start gap-10 sm:mx-auto mx-0 px-4">
      <div className="w-full flex flex-col items-start justify-start lg:items-start py-10">
        <div className="flex flex-row justify-start items-center gap-5 max-[500px]:flex-col max-[500px]:items-start">
          <div className="flex flex-row justify-center items-center gap-2">
            {isLoading ? (
              <Skeleton className="w-20 h-20 rounded-full border-solid border-2 border-primary/50" />
            ) : (
              <EditableAvatar
                src={avatarSrc}
                alt={`Foto de perfil de ${ownerName}`}
                initials={ownerName.slice(0, 2).toUpperCase()}
                className="size-20"
                onFileSelect={handleAvatarFileSelect}
              />
            )}
          </div>

          <div className="relative flex flex-col items-start gap-2 w-full">
            <button
              type="button"
              className="absolute top-0 right-0 rounded-full bg-transparent text-primary p-2 hover:bg-accent disabled:opacity-50"
              aria-label="Editar informações do perfil"
              onClick={() => setIsEditModalOpen(true)}
              disabled={isLoading}
            >
              <PencilSimple size={18} />
            </button>

            <div className="w-max">
              {isLoading ? (
                <Skeleton className="h-8 w-56" />
              ) : (
                <h1 className="text-2xl font-bold">{ownerName}</h1>
              )}
              <Separator className="h-[1px] bg-primary/50" />
            </div>

            <div className="flex flex-col justify-start items-start gap-2">
              <div>
                <div className="flex flex-row items-center gap-2">
                  <MapPin size={16} className="text-primary" />
                  <span className="text-[14px] text-muted-foreground">
                    <span className="text-[14px] font-semibold">Endereço:</span>{" "}
                    {isLoading ? (
                      <Skeleton className="inline-block h-[14px] w-72 align-middle" />
                    ) : (
                      ownerAddress
                    )}
                  </span>
                </div>
                <Separator className="w-full h-[1px] bg-primary/50" />
              </div>

              <div>
                <div className="flex flex-row items-center gap-2">
                  <User size={16} className="text-primary" />
                  <span className="text-[14px] text-muted-foreground">
                    <span className="text-[14px] font-semibold">Informações:</span>{" "}
                    {isLoading ? (
                      <Skeleton className="inline-block h-[14px] w-72 align-middle" />
                    ) : (
                      ownerInfo
                    )}
                  </span>
                </div>
                <Separator className="w-full h-[1px] bg-primary/50" />
              </div>

              <div className="w-full">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen size={16} className="text-primary" />
                  <p className="text-[14px] font-semibold text-muted-foreground">Descrição:</p>
                </div>
                {isLoading ? (
                  <Skeleton className="h-14 w-full" />
                ) : (
                  <p className="text-[14px] text-muted-foreground whitespace-pre-wrap">
                    {ownerWorkDescription}
                  </p>
                )}
                <Separator className="w-full h-[1px] bg-primary/50 mt-2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-7 pb-10 overflow-hidden">
        <div className="w-full flex items-center justify-between gap-3">
          <h1 className="text-3xl text-primary/90 font-bold">Lista de agendamentos</h1>
          <OwnerCreateSchedulingModal
            onCreated={() => setSchedulingsReloadToken((previous) => previous + 1)}
          />
        </div>
        <TableClients reloadToken={schedulingsReloadToken} />
      </div>

      <OwnerProfileEditModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        owner={owner}
        isSaving={isSavingProfile}
        onSubmit={handleSaveProfile}
      />
    </div>
  );
}
