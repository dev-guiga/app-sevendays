import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@radix-ui/react-separator";
import Link from "next/link";
import AvatarProfile from "@/components/Avatar";
import { UserCircle, MapPin, Info } from "@phosphor-icons/react";

import BarberShopImage from "@/app/assets/image/barbearia.jpg";
import ReceptionistImage from "@/app/assets/image/recepcionista.jpg";

const services = [
  {
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
  },
  {
    id: 2,
    image: BarberShopImage,
    name: "Barbeiro do João",
    content: "Barbearia",
    address: {
      street: "Rua das Flores",
      number: 0,
      city: "São José dos Campos",
      state: "SP",
    },
    agenda: {
      url: "/agenda/barbeiro-do-joao",
      access: "Acesse Já",
    },
  },
  {
    id: 2,
    image: BarberShopImage,
    name: "Dr. Maria",
    content: "Psiquiatra, Unoeste",
    address: {
      street: "Rua das Flores",
      number: 0,
      city: "São José dos Campos",
      state: "SP",
    },
    agenda: {
      url: "/agenda/dr-maria",
      access: "Acesse Já",
    },
  },
  {
    id: 2,
    image: BarberShopImage,
    name: "Dr. Luana",
    content: "fisioterapeuta, Unoeste",
    address: {
      street: "Rua das Árvores",
      number: 0,
      city: "São Paulo",
      state: "SP",
    },
    agenda: {
      url: "/agenda/dr-luana",
      access: "Acesse Já",
    },
  },
];

export default function PartnersCard() {
  return (
    <div className="w-full max-w-7xl flex flex-col items-start justify-center gap-10  sm:mx-auto mx-0 px-4 p-15">
      <h1 className="text-2xl font-bold">
        Escolha o profissional que deseja agendar
      </h1>
      <div className="flex flex-row flex-wrap gap-10">
        {services.map((service, index) => (
          <Link href={service.agenda.url} key={index}>
            <Card
              key={index}
              className="w-[270px] flex flex-col gap-2 border-solid  border-1 border-border rounded-md py-5 hover:shadow-md transition-all duration-300"
            >
              <CardHeader className="flex flex-row items-center justify-center pb-2">
                <AvatarProfile
                  src={service.image.src}
                  className="w-35 rounded-full border-solid border-2 border-primary/50"
                />
              </CardHeader>

              <Separator className="w-full h-[1px] bg-border" />

              <CardContent>
                <CardTitle className="flex flex-col gap-2">
                  <div className="flex flex-row items-center gap-2">
                    <UserCircle size={20} className="text-primary " />
                    <span className=" text-sm font-light text-muted-foreground">
                      {" "}
                      {service.name}
                    </span>
                  </div>

                  <div className="flex flex-row items-start gap-2 ">
                    <div>
                      <MapPin size={20} className="text-primary" />
                    </div>
                    <span className=" text-sm font-light text-muted-foreground">
                      {service.address?.street} {service.address?.number}
                      {" • "} {service.address?.city}, {service.address?.state}
                    </span>
                  </div>
                </CardTitle>
              </CardContent>

              <Separator className="w-full h-[1px] bg-border" />

              <CardFooter className="min-h-[100px] flex flex-col gap-2 items-start justify-start">
                <CardDescription className="flex flex-row  gap-2 items-start justify-start">
                  <div>
                    <Info size={20} className="text-primary" />
                  </div>
                  <span className=" text-sm font-light text-muted-foreground ">
                    {service.content}
                  </span>
                </CardDescription>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
