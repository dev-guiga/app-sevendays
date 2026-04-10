"use client";

import { useMemo, useSyncExternalStore } from "react";

const PROFILE_AVATAR_STORAGE_PREFIX = "sevendays-profile-avatar";
const PROFILE_AVATAR_EVENT = "sevendays:profile-avatar-updated";

function buildProfileAvatarStorageKey(profileKey: string) {
  return `${PROFILE_AVATAR_STORAGE_PREFIX}:${profileKey}`;
}

function readStoredProfileAvatar(profileKey: string) {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(buildProfileAvatarStorageKey(profileKey));
}

function emitProfileAvatarUpdated(profileKey: string, value: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(PROFILE_AVATAR_EVENT, {
      detail: {
        profileKey,
        value,
      },
    }),
  );
}

export function useProfileAvatar(profileKey: string | null, fallbackSrc: string) {
  const storedAvatar = useSyncExternalStore(
    (onStoreChange) => {
      if (!profileKey || typeof window === "undefined") {
        return () => undefined;
      }

      const handleAvatarUpdated = (event: Event) => {
        const customEvent = event as CustomEvent<{ profileKey?: string }>;
        if (customEvent.detail?.profileKey !== profileKey) {
          return;
        }

        onStoreChange();
      };

      window.addEventListener(PROFILE_AVATAR_EVENT, handleAvatarUpdated);
      return () => {
        window.removeEventListener(PROFILE_AVATAR_EVENT, handleAvatarUpdated);
      };
    },
    () => (profileKey ? readStoredProfileAvatar(profileKey) : null),
    () => null,
  );

  const avatarSrc = storedAvatar || fallbackSrc;

  const actions = useMemo(
    () => ({
      setStoredAvatar(nextValue: string) {
        if (!profileKey || typeof window === "undefined") {
          return;
        }

        window.localStorage.setItem(buildProfileAvatarStorageKey(profileKey), nextValue);
        emitProfileAvatarUpdated(profileKey, nextValue);
      },
      clearStoredAvatar() {
        if (!profileKey || typeof window === "undefined") {
          return;
        }

        window.localStorage.removeItem(buildProfileAvatarStorageKey(profileKey));
        emitProfileAvatarUpdated(profileKey, null);
      },
    }),
    [profileKey],
  );

  return {
    avatarSrc,
    ...actions,
  };
}
