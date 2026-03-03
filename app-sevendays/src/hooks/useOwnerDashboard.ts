"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useUser } from "@/contexts/user-context";
import {
  formatOwnerAddress,
  getOwnerAvatar,
  getOwnerInfo,
  getOwnerWorkDescription,
} from "@/lib/helpers/owner-dashboard";
import type { Owner } from "@/types/owner-dashboard";

export function useOwnerDashboard() {
  const params = useParams<{ admin?: string }>();
  const router = useRouter();
  const { currentUser, isLoadingUser, refreshCurrentUser } = useUser();

  const [owner, setOwner] = useState<Owner | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [schedulingsReloadToken, setSchedulingsReloadToken] = useState(0);

  const routeOwnerId = Number(params?.admin);

  const ownerAddress = useMemo(() => formatOwnerAddress(owner?.address), [owner?.address]);
  const ownerInfo = useMemo(() => getOwnerInfo(owner), [owner]);
  const ownerWorkDescription = useMemo(() => getOwnerWorkDescription(owner), [owner]);
  const ownerAvatar = useMemo(() => getOwnerAvatar(owner), [owner]);

  useEffect(() => {
    if (isLoadingUser) {
      return;
    }

    if (!currentUser) {
      router.replace("/login");
      return;
    }

    if (currentUser.status !== "owner") {
      toast.error("Usuario autenticado nao e um owner.");
      if (currentUser.id) {
        router.replace(`/${currentUser.id}/portal`);
      }
      return;
    }

    if (currentUser.id && Number.isFinite(routeOwnerId) && currentUser.id !== routeOwnerId) {
      router.replace(`/admin/${currentUser.id}/dashboard`);
      return;
    }

    setOwner(currentUser);
  }, [currentUser, isLoadingUser, routeOwnerId, router]);

  const isLoading = isLoadingUser || !owner;

  return {
    owner,
    setOwner,
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
  };
}
