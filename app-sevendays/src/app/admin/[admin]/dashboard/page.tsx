"use client";

import { useEffect, useMemo, useState } from "react";

import AvatarProfile from "@/components/Avatar";
import { TableClients } from "@/components/TableClients";
import { Separator } from "@/components/ui/separator";
import { sevendaysapi } from "@/lib/sevendaysapi";
import { MapPin, User } from "@phosphor-icons/react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

type CurrentOwnerResponse = {
  user?: {
    id?: number;
    full_name?: string;
    username?: string;
    email?: string;
    status?: "owner" | "user";
    address?: {
      address?: string;
      city?: string;
      state?: string;
      neighborhood?: string;
    };
  };
};

type Owner = NonNullable<CurrentOwnerResponse["user"]>;

function formatAddress(address?: Owner["address"]) {
  if (!address) {
    return "Endereço não cadastrado";
  }

  const firstLine = [address.address, address.neighborhood]
    .filter((value): value is string => Boolean(value))
    .join(", ");
  const secondLine = [address.city, address.state]
    .filter((value): value is string => Boolean(value))
    .join(" - ");

  const fullAddress = [firstLine, secondLine]
    .filter((value): value is string => Boolean(value))
    .join(" | ");

  return fullAddress || "Endereço não cadastrado";
}

function getOwnerName(owner: NonNullable<CurrentOwnerResponse["user"]>) {
  return owner.full_name || owner.username || "Owner";
}

export default function HomeAdmin() {
  const params = useParams<{ admin?: string }>();
  const router = useRouter();

  const [owner, setOwner] = useState<Owner | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const routeOwnerId = Number(params?.admin);

  const ownerAddress = useMemo(() => formatAddress(owner?.address), [owner?.address]);
  const ownerDescription = useMemo(() => {
    if (!owner) {
      return "";
    }

    return `@${owner.username ?? "owner"} • ${owner.email ?? "sem e-mail"}`;
  }, [owner]);

  const ownerAvatar = useMemo(() => {
    if (!owner) {
      return "https://api.dicebear.com/9.x/initials/svg?seed=owner";
    }

    const seed = getOwnerName(owner);
    return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed)}`;
  }, [owner]);

  useEffect(() => {
    let ignore = false;

    async function loadOwner() {
      setIsLoading(true);

      const result = await sevendaysapi.get<CurrentOwnerResponse>("/user", {
        withCredentials: true,
      });

      if (ignore) {
        return;
      }

      if (result.error || result.statusCode !== 200 || !result.data?.user) {
        toast.error("Nao foi possivel carregar os dados do owner.");
        setIsLoading(false);
        return;
      }

      const currentOwner = result.data.user;
      if (currentOwner.status !== "owner") {
        toast.error("Usuario autenticado nao e um owner.");
        setIsLoading(false);
        return;
      }

      if (currentOwner.id && Number.isFinite(routeOwnerId) && currentOwner.id !== routeOwnerId) {
        router.replace(`/admin/${currentOwner.id}/dashboard`);
      }

      setOwner(currentOwner);
      setIsLoading(false);
    }

    void loadOwner();

    return () => {
      ignore = true;
    };
  }, [routeOwnerId, router]);

  return (
    <div className="w-full max-w-7xl flex flex-col items-start justify-start gap-10 sm:mx-auto mx-0 px-4">
      <div className="w-full flex flex-col items-start justify-start lg:items-start py-10">
        <div className="flex flex-row justify-start items-center gap-5">
          <div className="flex flex-row justify-center items-center gap-2">
            <AvatarProfile
              src={ownerAvatar}
              className="w-20 h-20 rounded-full border-solid border-2 border-primary/50 object-cover"
            />
          </div>

          <div className="flex flex-col items-start gap-2">
            <div className="w-max">
              <h1 className="text-2xl font-bold">
                {isLoading ? "Carregando owner..." : owner ? getOwnerName(owner) : "Owner"}
              </h1>
              <Separator className="h-[1px] bg-primary/50" />
            </div>

            <div className="flex flex-col justify-start items-start gap-2">
              <div>
                <div className="flex flex-row items-center gap-2">
                  <User size={16} className="text-primary" />
                  <span className="text-[14px] text-muted-foreground">
                    <span className="text-[14px] font-semibold">Descrição:</span>{" "}
                    {isLoading ? "Carregando..." : ownerDescription}
                  </span>
                </div>
                <Separator className="w-full h-[1px] bg-primary/50" />
              </div>

              <div className="flex flex-col justify-start items-start">
                <div className="flex flex-row items-center gap-2">
                  <MapPin size={16} className="text-primary" />
                  <span className="text-[14px] text-muted-foreground">
                    <span className="text-[14px] font-semibold">Endereço:</span>{" "}
                    {isLoading ? "Carregando..." : ownerAddress}
                  </span>
                </div>
                <Separator className="w-full h-[1px] bg-primary/50" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-7 pb-10 overflow-hidden">
        <h1 className="text-3xl text-primary/90 font-bold">Lista de agendamento</h1>
        <TableClients />
      </div>
    </div>
  );
}
