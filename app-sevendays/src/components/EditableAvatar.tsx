"use client";

import { useId } from "react";

import { PencilSimple } from "@phosphor-icons/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type EditableAvatarProps = {
  src: string;
  alt: string;
  initials: string;
  className?: string;
  overlayClassName?: string;
  isUploading?: boolean;
  onFileSelect: (file: File) => void;
};

export function EditableAvatar({
  src,
  alt,
  initials,
  className,
  overlayClassName,
  isUploading = false,
  onFileSelect,
}: EditableAvatarProps) {
  const inputId = useId();

  const handleInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    onFileSelect(file);
  };

  return (
    <div className={cn("group relative", className)}>
      <Avatar className="size-full border-2 border-primary/50">
        <AvatarImage src={src} alt={alt} className="object-cover" />
        <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>

      <input
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleInputChange}
      />

      <label
        htmlFor={inputId}
        className={cn(
          "absolute inset-0 flex cursor-pointer items-center justify-center gap-1 rounded-full bg-black/0 text-white opacity-0 transition-all group-hover:bg-black/55 group-hover:opacity-100",
          overlayClassName,
          isUploading && "bg-black/55 opacity-100",
        )}
      >
        <PencilSimple size={10} weight="bold" />
        <span className="text-[10px] font-semibold uppercase leading-none tracking-wide">
          {isUploading ? "Enviando" : "Editar"}
        </span>
      </label>
    </div>
  );
}
