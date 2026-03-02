"use client";

import { Fragment, useEffect, useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import AvatarProfile from "@/components/Avatar";
import Calendar20 from "@/components/calendar-20";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { sevendaysapi } from "@/lib/sevendaysapi";
import {
  BadgeCheck,
  Briefcase,
  FileText,
  Mail,
  MapPin,
  UserRound,
} from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

type DiaryProfessional = {
  id?: number;
  name?: string;
  email?: string;
  branch?: string;
  document?: string;
  document_type?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  neighborhood?: string;
};

type DiaryDetail = {
  id?: number;
  title?: string;
  description?: string;
  professional?: DiaryProfessional;
  user_name?: string;
  user_email?: string;
  address?: string;
  city?: string;
  state?: string;
  neighborhood?: string;
  professional_branch?: string;
  professional_document?: string;
  professional_document_type?: string;
  professional_description?: string;
};

type DiaryShowResponse = {
  success?: boolean;
  diary_data?: DiaryDetail;
};

function buildAddressText(diary?: DiaryDetail) {
  if (!diary) {
    return "Endereco nao informado";
  }

  const professional = getProfessionalFromDiary(diary);
  const street = professional.address?.trim();
  const city = professional.city?.trim();
  const state = professional.state?.trim();

  if (street && city && state) {
    return `${street} • ${city}, ${state}`;
  }

  if (street) {
    return street;
  }

  if (city && state) {
    return `${city}, ${state}`;
  }

  return "Endereco nao informado";
}

function getProfessionalFromDiary(diary: DiaryDetail): DiaryProfessional {
  if (diary.professional) {
    return diary.professional;
  }

  return {
    name: diary.user_name,
    email: diary.user_email,
    branch: diary.professional_branch,
    document: diary.professional_document,
    document_type: diary.professional_document_type,
    description: diary.professional_description,
    address: diary.address,
    city: diary.city,
    state: diary.state,
    neighborhood: diary.neighborhood,
  };
}

function extractApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  if (error && typeof error === "object") {
    const candidate = error as {
      error?: {
        message?: string;
      };
      message?: string;
    };

    if (
      typeof candidate.error?.message === "string" &&
      candidate.error.message.trim().length > 0
    ) {
      return candidate.error.message;
    }

    if (
      typeof candidate.message === "string" &&
      candidate.message.trim().length > 0
    ) {
      return candidate.message;
    }
  }

  return fallback;
}

export default function PortalPage() {
  const params = useParams<{ partner?: string | string[] }>();
  const partnerParam = Array.isArray(params?.partner)
    ? params.partner[0]
    : params?.partner;
  const diaryId = Number(partnerParam);
  const isDiaryIdValid = Number.isFinite(diaryId) && diaryId > 0;

  const diaryQuery = useQuery({
    queryKey: ["diary-details", diaryId],
    enabled: isDiaryIdValid,
    queryFn: async () => {
      const result = await sevendaysapi.get<DiaryShowResponse>(
        `/diaries/${diaryId}`,
        {
          withCredentials: true,
        },
      );

      if (
        result.error ||
        result.statusCode !== 200 ||
        !result.data?.success ||
        !result.data.diary_data
      ) {
        throw new Error(
          extractApiErrorMessage(
            result.error,
            "Nao foi possivel carregar a agenda selecionada.",
          ),
        );
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
    if (!diaryQuery.isError) {
      return;
    }

    const errorMessage =
      diaryQuery.error instanceof Error
        ? diaryQuery.error.message
        : "Nao foi possivel carregar a agenda selecionada.";
    toast.error(errorMessage);
  }, [diaryQuery.error, diaryQuery.errorUpdatedAt, diaryQuery.isError]);

  const diary = diaryQuery.data ?? null;
  const isLoading = isDiaryIdValid && diaryQuery.isPending;

  const ownerName = useMemo(() => {
    if (!diary) {
      return "Agenda";
    }

    const professional = getProfessionalFromDiary(diary);
    return professional.name?.trim() || diary.title?.trim() || "Agenda";
  }, [diary]);

  const professional = useMemo(
    () => (diary ? getProfessionalFromDiary(diary) : undefined),
    [diary],
  );

  const professionalInfoItems = useMemo(() => {
    const documentText = professional?.document
      ? `${professional.document_type || "Registro"}: ${professional.document}`
      : "Documento profissional nao informado";

    return [
      { key: "name", icon: UserRound, text: ownerName },
      {
        key: "email",
        icon: Mail,
        text: professional?.email || "Email nao informado",
      },
      {
        key: "branch",
        icon: Briefcase,
        text: professional?.branch || "Area profissional nao informada",
      },
      { key: "document", icon: FileText, text: documentText },
      {
        key: "address",
        icon: MapPin,
        text: buildAddressText(diary ?? undefined),
      },
      {
        key: "owner",
        icon: BadgeCheck,
        text: "Dados do profissional dono da agenda",
      },
    ];
  }, [diary, ownerName, professional]);

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl flex flex-row items-center justify-center gap-10 sm:mx-auto mx-0 px-4">
        <div className="w-full flex flex-col justify-center items-center gap-10 py-20">
          <div className="flex flex-col items-center gap-3">
            <Skeleton className="h-20 w-20 rounded-full" />
            <Skeleton className="h-8 w-60" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="w-full">
            <Skeleton className="h-[420px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!diary || !Number.isFinite(diaryId) || diaryId <= 0) {
    return (
      <div className="w-full max-w-7xl flex flex-row items-center justify-center gap-10 sm:mx-auto mx-0 px-4">
        <div className="w-full flex flex-col justify-center items-center gap-4 py-20">
          <h1 className="text-2xl font-bold">Agenda nao encontrada</h1>
          <p className="text-sm text-muted-foreground">
            Nao foi possivel carregar os dados desta agenda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl flex flex-row items-center justify-center gap-10 sm:mx-auto mx-0 px-4">
      <div className="w-full flex flex-col justify-center items-center gap-10 py-20">
        <div className="flex flex-col justify-start items-center gap-2">
          <div className="flex flex-row justify-center items-center gap-2">
            <AvatarProfile
              src="https://github.com/shadcn.png"
              className="w-20 rounded-full border-solid border-2 border-primary/50"
            />
          </div>
          <h1 className="text-2xl font-bold">{ownerName}</h1>

          <div className="w-full max-w-3xl flex flex-col justify-start items-center gap-3">
            {professional?.description ? (
              <span className="text-sm text-muted-foreground text-center">
                {professional.description}
                <Separator className="w-full h-[1px] bg-primary/50" />
              </span>
            ) : null}

            <div className="w-full flex flex-wrap items-center justify-center gap-2">
              {professionalInfoItems.map((item, index) => {
                const Icon = item.icon;

                return (
                  <Fragment key={item.key}>
                    <span className="items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex flex-row items-center gap-2">
                        <Icon size={16} className="text-primary shrink-0" />
                        <span>{item.text}</span>
                      </div>

                      <Separator className="w-full h-[1px] bg-primary/50" />
                    </span>
                    {index < professionalInfoItems.length - 1 ? (
                      <Separator
                        orientation="vertical"
                        className="h-4 bg-primary/40"
                      />
                    ) : null}
                  </Fragment>
                );
              })}
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col justify-start items-center gap-2">
          <h1 className="text-2xl font-bold text-primary-foreground">
            Agenda de {ownerName}
          </h1>
          <Calendar20 diaryId={diaryId} />
        </div>
      </div>
    </div>
  );
}
