"use client";

import { useEffect, useState } from "react";

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
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [professionalDescription, setProfessionalDescription] = useState("");
  const [professionalDocument, setProfessionalDocument] = useState("");
  const [professionalBranch, setProfessionalBranch] = useState("");

  useEffect(() => {
    if (!open || !owner) {
      return;
    }

    setUsername(owner.username ?? "");
    setEmail(owner.email ?? "");
    setAddress(owner.address?.address ?? "");
    setNeighborhood(owner.address?.neighborhood ?? "");
    setCity(owner.address?.city ?? "");
    setState(owner.address?.state ?? "");
    setProfessionalDescription(owner.professional_description ?? "");
    setProfessionalDocument(owner.professional_document ?? "");
    setProfessionalBranch(owner.professional_branch ?? "");
  }, [open, owner]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: OwnerProfileUpdateInput = {
      username: username.trim(),
      email: email.trim(),
      address_attributes: {
        address: address.trim(),
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        state: state.trim(),
      },
      professional_description: normalizeOptional(professionalDescription),
      professional_document: normalizeOptional(professionalDocument),
      professional_branch: normalizeOptional(professionalBranch),
    };

    await onSubmit(payload);
  };

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

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="profile-username" className="text-sm font-medium">
                  Username
                </label>
                <Input
                  id="profile-username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
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
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
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
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
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
                  value={neighborhood}
                  onChange={(event) => setNeighborhood(event.target.value)}
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
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
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
                  value={state}
                  onChange={(event) => setState(event.target.value)}
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
                  value={professionalBranch}
                  onChange={(event) => setProfessionalBranch(event.target.value)}
                  disabled={isSaving}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="profile-document" className="text-sm font-medium">
                  Documento profissional
                </label>
                <Input
                  id="profile-document"
                  value={professionalDocument}
                  onChange={(event) => setProfessionalDocument(event.target.value)}
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
                rows={4}
                value={professionalDescription}
                onChange={(event) => setProfessionalDescription(event.target.value)}
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
              disabled={isSaving}
            >
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
