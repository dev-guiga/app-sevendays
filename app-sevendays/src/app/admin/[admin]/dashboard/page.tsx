"use client";

import ReceptionistImage from "@/app/assets/image/recepcionista.jpg";
import AvatarProfile from "@/components/Avatar";
import { TableClients } from "@/components/TableClients";
import { Separator } from "@/components/ui/separator";
import { MapPin } from "@phosphor-icons/react/dist/ssr";

const partner = {
  id: 1,
  image: ReceptionistImage,
  name: "Dr. Roschman",
  content: "Psiquiatra, Unoeste. Atendendo a mais de 10 anos",
  address: {
    street: "Rua dos Bobos",
    number: 0,
    city: "São Paulo",
    state: "SP",
  },
  agenda: {
    url: "/agenda/dr-roscman",
    access: "Acesse Já",
  },
};

export default function HomeAdmin() {
  return (
    <div className="w-full max-w-7xl flex flex-col items-start justify-start gap-10  sm:mx-auto mx-0 px-4">
      <div className="w-full flex flex-col items-start justify-start  lg:items-start py-10">
        <div className="flex flex-row justify-start items-center gap-5">
          <div className="flex flex-row justify-center items-center gap-2">
            <AvatarProfile
              src="https://github.com/shadcn.png"
              className="w-20 rounded-full border-solid border-2 border-primary/50"
            />
          </div>

          <div className="flex flex-col align-start gap">
            <div className="w-max">
              <h1 className="text-2xl font-bold">{partner.name}</h1>
              <Separator className="h-[1px] bg-primary/50" />
            </div>

            <div className="flex flex-col justify-start items-start gap-2">
              <div>
                <span className="text-sm text-muted-foreground">
                  {partner.content}
                </span>

                <Separator className="w-full h-[1px] bg-primary/50" />
              </div>

              <div className="flex flex-col justify-start items-center">
                <div className="flex flex-row justify-center items-center gap-2">
                  <MapPin size={16} className="text-primary" />

                  <span className="text-sm text-muted-foreground">
                    {partner.address.street} - {partner.address.number},
                  </span>

                  <span className="text-sm text-muted-foreground">
                    {partner.address.city}, {partner.address.state}
                  </span>
                </div>
                <Separator className="w-full h-[1px] bg-primary/50" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col gap-7 pb-10 overflow-hidden">
        <h1 className="text-3xl text-primary/90 font-bold">
          Lista de agendamento
        </h1>
        <TableClients />
      </div>
    </div>
  );
}
