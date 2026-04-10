"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { buildAddressText, getProfessionalFromDiary } from "@/lib/helpers/diary";
import { extractApiErrorMessage } from "@/lib/helpers/api";
import { sevendaysapi } from "@/lib/sevendaysapi";
import type { DiaryShowResponse } from "@/types/diary";

type UseDiaryDetailsParams = {
  partnerParam?: string | string[];
};

const FALLBACK_ERROR_MESSAGE = "Nao foi possivel carregar a agenda selecionada.";

export function useDiaryDetails({ partnerParam }: UseDiaryDetailsParams) {
  const parsedPartnerId = Array.isArray(partnerParam) ? partnerParam[0] : partnerParam;
  const diaryId = Number(parsedPartnerId);
  const isDiaryIdValid = Number.isFinite(diaryId) && diaryId > 0;

  const query = useQuery({
    queryKey: ["diary-details", diaryId],
    enabled: isDiaryIdValid,
    queryFn: async () => {
      const result = await sevendaysapi.get<DiaryShowResponse>(`/diaries/${diaryId}`, {
        withCredentials: true,
      });

      if (
        result.error ||
        result.statusCode !== 200 ||
        !result.data?.success ||
        !result.data.diary_data
      ) {
        throw new Error(extractApiErrorMessage(result.error, FALLBACK_ERROR_MESSAGE));
      }

      return result.data.diary_data;
    },
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!isDiaryIdValid) {
      toast.error("Agenda invalida.");
    }
  }, [isDiaryIdValid]);

  useEffect(() => {
    if (!query.isError) {
      return;
    }

    const errorMessage =
      query.error instanceof Error ? query.error.message : FALLBACK_ERROR_MESSAGE;
    toast.error(errorMessage);
  }, [query.error, query.errorUpdatedAt, query.isError]);

  const diary = query.data ?? null;
  const isLoading = isDiaryIdValid && query.isPending;
  const professional = useMemo(
    () => (diary ? getProfessionalFromDiary(diary) : undefined),
    [diary],
  );
  const ownerName = useMemo(() => {
    if (!diary) {
      return "Agenda";
    }

    return professional?.name?.trim() || diary.title?.trim() || "Agenda";
  }, [diary, professional?.name]);

  const documentText = professional?.document
    ? `${professional.document_type || "Registro"}: ${professional.document}`
    : "Documento profissional nao informado";
  const addressText = buildAddressText(diary ?? undefined);

  return {
    diaryId,
    isDiaryIdValid,
    diary,
    isLoading,
    ownerName,
    professional,
    documentText,
    addressText,
  };
}
