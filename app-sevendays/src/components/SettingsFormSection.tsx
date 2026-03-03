import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type SettingsFormSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
  contentClassName?: string;
};

export function SettingsFormSection({
  title,
  description,
  children,
  contentClassName = "flex flex-col gap-4",
}: SettingsFormSectionProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
}

