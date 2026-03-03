import Link from "next/link";
import { Info, MapPin, UserCircle } from "@phosphor-icons/react";

import AvatarProfile from "@/components/Avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { buildAddressText, getProfessionalDescription } from "@/lib/helpers/diary";
import type { DiaryListItem } from "@/types/diary";

type DiaryCardProps = {
  diary: DiaryListItem;
  href: string;
};

export default function DiaryCard({ diary, href }: DiaryCardProps) {
  const ownerName = diary.user_name?.trim() || diary.title?.trim() || "Agenda";

  return (
    <Link href={href} className="flex w-full justify-center">
      <Card className="w-full max-w-[300px] min-h-[290px] flex flex-col gap-2 border-solid border border-border rounded-md py-5 hover:shadow-md transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-center pb-2">
          <AvatarProfile
            src="https://github.com/shadcn.png"
            className="w-24 rounded-full border-solid border-2 border-primary/50"
          />
        </CardHeader>

        <Separator className="w-full h-[1px] bg-border" />

        <CardContent>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center gap-2">
              <UserCircle size={20} className="text-primary" />
              <span className="text-sm font-light text-muted-foreground">
                {ownerName}
              </span>
            </div>

            <div className="flex flex-row items-start gap-2">
              <MapPin size={20} className="text-primary mt-0.5 shrink-0" />
              <span className="text-sm font-light text-muted-foreground">
                {buildAddressText(diary)}
              </span>
            </div>
          </div>
        </CardContent>

        <Separator className="w-full h-[1px] bg-border" />

        <CardFooter className="min-h-[100px] flex flex-col gap-2 items-start justify-start">
          <CardDescription className="flex flex-row gap-2 items-start justify-start">
            <Info size={20} className="text-primary mt-0.5 shrink-0" />
            <span className="w-full text-sm font-light text-muted-foreground">
              {getProfessionalDescription(diary)}
            </span>
          </CardDescription>
        </CardFooter>
      </Card>
    </Link>
  );
}
