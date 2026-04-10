"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "@phosphor-icons/react";

export type OwnerProfileData = {
  username?: string;
  email?: string;
  professional_description?: string | null;
  professional_document?: string | null;
  professional_branch?: string | null;
  address?: {
    address?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
  };
};

export type OwnerProfileUpdateInput = {
  username: string;
  email: string;
  professional_description?: string;
  professional_document?: string;
  professional_branch?: string;
  address_attributes: {
    address: string;
    neighborhood: string;
    city: string;
    state: string;
  };
};

interface OwnerProfileEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  owner: OwnerProfileData | null;
  isSaving: boolean;
  onSubmit: (payload: OwnerProfileUpdateInput) => Promise<void>;
}

function normalizeOptional(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function OwnerProfileEditModal({
  open,
  onOpenChange,
  owner,
  isSaving,
  onSubmit,
}: OwnerProfileEditModalProps) {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const payload: OwnerProfileUpdateInput = {
      username: String(formData.get("username") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      address_attributes: {
        address: String(formData.get("address") ?? "").trim(),
        neighborhood: String(formData.get("neighborhood") ?? "").trim(),
        city: String(formData.get("city") ?? "").trim(),
        state: String(formData.get("state") ?? "").trim(),
      },
      professional_description: normalizeOptional(String(formData.get("professional_description") ?? "")),
      professional_document: normalizeOptional(String(formData.get("professional_document") ?? "")),
      professional_branch: normalizeOptional(String(formData.get("professional_branch") ?? "")),
    };

    await onSubmit(payload);
  };

  const formKey = [
    open ? "open" : "closed",
    owner?.username ?? "",
    owner?.email ?? "",
    owner?.address?.address ?? "",
    owner?.address?.neighborhood ?? "",
    owner?.address?.city ?? "",
    owner?.address?.state ?? "",
    owner?.professional_branch ?? "",
    owner?.professional_document ?? "",
    owner?.professional_description ?? "",
  ].join("|");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0">
        <DialogHeader className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <DialogTitle>Editar perfil</DialogTitle>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={() => onOpenChange(false)}
              aria-label="Fechar modal"
            >
              <X size={18} />
            </button>
          </div>
        </DialogHeader>

        <form key={formKey} onSubmit={handleSubmit}>
          <div className="px-6 py-4 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="profile-username" className="text-sm font-medium">
                  Nome de usuário
                </label>
                <Input
                  id="profile-username"
                  name="username"
                  defaultValue={owner?.username ?? ""}
                  required
                  disabled={isSaving}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="profile-email" className="text-sm font-medium">
                  E-mail
                </label>
                <Input
                  id="profile-email"
                  name="email"
                  type="email"
                  defaultValue={owner?.email ?? ""}
                  required
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="profile-address" className="text-sm font-medium">
                  Endereço
                </label>
                <Input
                  id="profile-address"
                  name="address"
                  defaultValue={owner?.address?.address ?? ""}
                  required
                  disabled={isSaving}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="profile-neighborhood" className="text-sm font-medium">
                  Bairro
                </label>
                <Input
                  id="profile-neighborhood"
                  name="neighborhood"
                  defaultValue={owner?.address?.neighborhood ?? ""}
                  required
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="profile-city" className="text-sm font-medium">
                  Cidade
                </label>
                <Input
                  id="profile-city"
                  name="city"
                  defaultValue={owner?.address?.city ?? ""}
                  required
                  disabled={isSaving}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="profile-state" className="text-sm font-medium">
                  Estado
                </label>
                <Input
                  id="profile-state"
                  name="state"
                  defaultValue={owner?.address?.state ?? ""}
                  required
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="profile-branch" className="text-sm font-medium">
                  Ramo profissional
                </label>
                <Input
                  id="profile-branch"
                  name="professional_branch"
                  defaultValue={owner?.professional_branch ?? ""}
                  disabled={isSaving}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="profile-document" className="text-sm font-medium">
                  Documento profissional
                </label>
                <Input
                  id="profile-document"
                  name="professional_document"
                  defaultValue={owner?.professional_document ?? ""}
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="profile-description" className="text-sm font-medium">
                Descrição
              </label>
              <Textarea
                id="profile-description"
                name="professional_description"
                rows={4}
                defaultValue={owner?.professional_description ?? ""}
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="border-t px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-[90px] bg-transparent border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="w-[90px] bg-transparent border border-green-500 text-green-500 hover:bg-green-50"
              isLoading={isSaving}
            >
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
