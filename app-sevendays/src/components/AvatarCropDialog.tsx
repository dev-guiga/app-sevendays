"use client";

import { useState } from "react";

import Cropper, { type Area } from "react-easy-crop";
import { MagnifyingGlassMinus, MagnifyingGlassPlus } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCroppedAvatarBlob } from "@/lib/helpers/avatar-crop";

type AvatarCropDialogProps = {
  open: boolean;
  imageSrc: string | null;
  isSaving?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (file: File) => Promise<void> | void;
};

const INITIAL_CROP = { x: 0, y: 0 };
const INITIAL_ZOOM = 1;

export function AvatarCropDialog({
  open,
  imageSrc,
  isSaving = false,
  onOpenChange,
  onConfirm,
}: AvatarCropDialogProps) {
  const [crop, setCrop] = useState(INITIAL_CROP);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setCrop(INITIAL_CROP);
      setZoom(INITIAL_ZOOM);
      setCroppedAreaPixels(null);
    }

    onOpenChange(nextOpen);
  };

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      return;
    }

    const blob = await getCroppedAvatarBlob(imageSrc, croppedAreaPixels);
    const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
    await onConfirm(file);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Ajustar foto de perfil</DialogTitle>
          <DialogDescription>
            Posicione e aproxime a imagem antes de salvar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative h-[320px] overflow-hidden rounded-2xl bg-black">
            {imageSrc ? (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, areaPixels) => {
                  setCroppedAreaPixels(areaPixels);
                }}
              />
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <MagnifyingGlassMinus size={16} className="text-muted-foreground" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(event) => {
                setZoom(Number(event.target.value));
              }}
              className="w-full"
              aria-label="Zoom da foto"
            />
            <MagnifyingGlassPlus size={16} className="text-muted-foreground" />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm} isLoading={isSaving}>
            Salvar foto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
