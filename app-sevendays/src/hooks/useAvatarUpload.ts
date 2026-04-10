"use client";

import { useCallback, useState } from "react";

import { toast } from "sonner";

import { sevendaysapi } from "@/lib/sevendaysapi";

type AvatarPresignResponse = {
  upload_url?: string;
  avatar_storage_key?: string;
  content_type?: string;
};

type CurrentUserResponse = {
  user?: {
    id?: number;
    avatar_url?: string | null;
  };
};

type UseAvatarUploadParams = {
  refreshCurrentUser: (options?: { silent?: boolean; force?: boolean }) => Promise<unknown> | void;
};

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_CONTENT_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function useAvatarUpload({ refreshCurrentUser }: UseAvatarUploadParams) {
  const [isUploading, setIsUploading] = useState(false);

  const uploadAvatar = useCallback(
    async (file: File | Blob) => {
      const uploadFile =
        file instanceof File
          ? file
          : new File([file], "avatar.jpg", { type: file.type || "image/jpeg" });

      if (!ALLOWED_CONTENT_TYPES.has(uploadFile.type)) {
        toast.error("Selecione uma imagem JPG, PNG ou WEBP.");
        return false;
      }

      if (uploadFile.size > MAX_FILE_SIZE_BYTES) {
        toast.error("A imagem deve ter no máximo 5 MB.");
        return false;
      }

      setIsUploading(true);

      try {
        const presignResult = await sevendaysapi.post<AvatarPresignResponse>(
          "/user/avatar_presign",
          {
            filename: uploadFile.name,
            content_type: uploadFile.type,
            file_size: uploadFile.size,
          },
          {
            withCredentials: true,
          },
        );

        const uploadUrl = presignResult.data?.upload_url;
        const avatarStorageKey = presignResult.data?.avatar_storage_key;
        const contentType = presignResult.data?.content_type || uploadFile.type;

        if (
          presignResult.error ||
          presignResult.statusCode !== 200 ||
          !uploadUrl ||
          !avatarStorageKey
        ) {
          toast.error("Não foi possível preparar o upload da foto.");
          return false;
        }

        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": contentType,
          },
          body: uploadFile,
        });

        if (!uploadResponse.ok) {
          toast.error("Não foi possível enviar a foto para o storage.");
          return false;
        }

        const saveResult = await sevendaysapi.patch<CurrentUserResponse>(
          "/user",
          {
            user: {
              avatar_storage_key: avatarStorageKey,
            },
          },
          {
            withCredentials: true,
          },
        );

        if (saveResult.error || saveResult.statusCode !== 200 || !saveResult.data?.user) {
          toast.error("Não foi possível salvar a foto de perfil.");
          return false;
        }

        await refreshCurrentUser({ silent: true, force: true });
        toast.success("Foto de perfil atualizada com sucesso.");
        return true;
      } catch {
        toast.error("Não foi possível concluir o upload da foto.");
        return false;
      } finally {
        setIsUploading(false);
      }
    },
    [refreshCurrentUser],
  );

  return {
    isUploading,
    uploadAvatar,
  };
}
