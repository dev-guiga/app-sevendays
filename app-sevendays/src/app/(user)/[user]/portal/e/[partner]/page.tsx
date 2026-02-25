import AvatarProfile from "@/components/Avatar";


import { Separator } from "@radix-ui/react-separator";
import { MapPin } from "lucide-react";
import Calendar20 from "@/components/calendar-20";

import ReceptionistImage from "@/app/assets/image/recepcionista.jpg";

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

export default function PortalPage() {
  return (
    <div className="w-full max-w-7xl flex flex-row items-center justify-center gap-10  sm:mx-auto mx-0 px-4">
      <div className="w-full flex flex-col justify-center items-center gap-10 py-20">
        <div className="flex flex-col justify-start items-center gap-2">
          <div className="flex flex-row justify-center items-center gap-2">
            <AvatarProfile
              src="https://github.com/shadcn.png"
              className="w-20 rounded-full border-solid border-2 border-primary/50"
            />
          </div>
          <h1 className="text-2xl font-bold">{partner.name}</h1>

          <div className="flex flex-col justify-start items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {partner.content}
            </span>

            <Separator className="w-full h-[1px] bg-primary/50" />

            <div className="flex flex-col justify-start items-center gap-2">
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

        <div className="w-full flex flex-col justify-start items-center gap-2">
          <h1 className="text-2xl font-bold text-primary-foreground">
            Agenda de{` ${partner.name}`}
          </h1>
          <Calendar20 />
        </div>
      </div>
    </div>
  );
}
