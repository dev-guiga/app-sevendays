"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import type { OwnerProfileUpdateInput } from "@/components/OwnerProfileEditModal";
import { sevendaysapi } from "@/lib/sevendaysapi";
import type { CurrentOwnerResponse, Owner, OwnerUpdateRequest } from "@/types/owner-dashboard";

type UseOwnerProfileSaveParams = {
  setOwner: (owner: Owner) => void;
  refreshCurrentUser: (options?: { silent?: boolean; force?: boolean }) => Promise<unknown> | void;
  onSuccess: () => void;
};

export function useOwnerProfileSave({
  setOwner,
  refreshCurrentUser,
  onSuccess,
}: UseOwnerProfileSaveParams) {
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const handleSaveProfile = useCallback(
    async (payload: OwnerProfileUpdateInput) => {
      setIsSavingProfile(true);

      try {
        const result = await sevendaysapi.patch<CurrentOwnerResponse, OwnerUpdateRequest>(
          "/owner/profile",
          { user: payload },
          { withCredentials: true }
        );

        if (result.error || result.statusCode !== 200 || !result.data?.user) {
          toast.error("Não foi possível salvar as informações do perfil.");
          return;
        }

        const updatedOwner = result.data.user;
        if (updatedOwner.status !== "owner") {
          toast.error("O usuário atualizado não é um owner.");
          return;
        }

        setOwner(updatedOwner);
        void refreshCurrentUser({ silent: true, force: true });
        onSuccess();
        toast.success("Perfil atualizado com sucesso.");
      } finally {
        setIsSavingProfile(false);
      }
    },
    [onSuccess, refreshCurrentUser, setOwner]
  );

  return {
    isSavingProfile,
    handleSaveProfile,
  };
}
