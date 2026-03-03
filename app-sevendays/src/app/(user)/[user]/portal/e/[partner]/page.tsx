"use client";
import { useParams } from "next/navigation";

import { Fragment, useMemo } from "react";
import {
  Briefcase,
  CheckCircle,
  Envelope,
  FileText,
  MapPin,
  UserCircle,
} from "@phosphor-icons/react";

import AvatarProfile from "@/components/Avatar";
import SchedulingCalendar from "@/components/calendar-20";
import DiaryDetailsSkeleton from "@/components/skeletons/DiaryDetailsSkeleton";
import { Separator } from "@/components/ui/separator";

import { useDiaryDetails } from "@/hooks/useDiaryDetails";

export default function PortalPage() {
  const params = useParams<{ partner?: string | string[] }>();
  const {
    diaryId,
    diary,
    isLoading,
    ownerName,
    professional,
    documentText,
    addressText,
  } = useDiaryDetails({ partnerParam: params?.partner });

  const professionalInfoItems = useMemo(() => {
    return [
      { key: "name", icon: UserCircle, text: ownerName },
      {
        key: "email",
        icon: Envelope,
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
        text: addressText,
      },
      {
        key: "owner",
        icon: CheckCircle,
        text: "Dados do profissional dono da agenda",
      },
    ];
  }, [addressText, documentText, ownerName, professional]);

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl flex flex-row items-center justify-center gap-10 sm:mx-auto mx-0 px-4">
        <div className="w-full flex flex-col justify-center items-center gap-10 py-20">
          <DiaryDetailsSkeleton />
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
            {professional?.professional_description ? (
              <span className="max-w-[300px] text-sm text-muted-foreground text-center">
                {professional.professional_description}
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
          <SchedulingCalendar resourceId={diaryId} />
        </div>
      </div>
    </div>
  );
}
