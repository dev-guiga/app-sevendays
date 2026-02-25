"use client";

import { CheckCircle } from "@phosphor-icons/react";

import { Separator } from "@radix-ui/react-dropdown-menu";

import AvatarProfile from "@/components/Avatar";
import * as Card from "@/components/ui/card";
import NextImage from "next/image";

import Logo from "@/app/assets/image/seven-days.svg";
import LogoSevenDays from "@/app/assets/image/logo-seven-days.png";
import UserOne from "../../public/image/avatars/guilherme.png";
import UserTwo from "../../public/image/avatars/giovana.jpg";
import UserThree from "../../public/image/avatars/kerolin.jpg";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import TemplateCards from "@/components/TemplateCards";

const users = [
  {
    name: "guilherme",
    src: UserOne.src,
    comment: "Sistema simples e incrível!",
  },
  {
    name: "giovana",
    src: UserTwo.src,
    comment: "Fácil com a aplicação, agendei meu horário em minutos!",
  },

  {
    name: "kerolin",
    src: UserThree.src,
    comment: "Acessível prático e fácil, muito obrigada!",
  },
];

export default function Home() {
  return (
    <main>
      <div className="w-100vw flex flex-col items-start justify-center gap-10  sm:mx-auto mx-0 bg-accent">
        <div className="w-full max-w-7xl flex flex-row flex-wrap items-center justify-between gap-10 sm:mx-auto mx-0  px-4">
          <div className="flex flex-col items-start gap-3">
            <h1 className="text-4xl font-extrabold">
              Agende seu horário com o melhor
            </h1>
            <div>
              <div className="flex items-center justify-start gap-2">
                <CheckCircle
                  size={16}
                  weight="bold"
                  className="text-muted-foreground"
                />
                <span className="text-muted-foreground">
                  Agendamento em tempo real
                </span>
              </div>

              <div className="flex items-center justify-start gap-2">
                <CheckCircle
                  size={16}
                  weight="bold"
                  className="text-muted-foreground"
                />
                <span className="text-muted-foreground">
                  Agendamente e cancelamentos a qualquer momento
                </span>
              </div>

              <div className="flex items-center justify-start gap-2">
                <CheckCircle
                  size={16}
                  weight="bold"
                  className="text-muted-foreground"
                />
                <span className="text-muted-foreground">
                  Contato direto com a profissional
                </span>
              </div>
            </div>
          </div>
          <NextImage src={Logo} alt="Logo" width={440} height={440} />
        </div>
      </div>
      <div className="w-full max-w-7xl flex flex-row flex-wrap items-center justify-between gap-10 px-4 pt-10 sm:pb-20 pb-10 sm:mx-auto mx-0 sm:pt-20">
        <TemplateCards />

        <div className="flex flex-col items-start justify-center gap-8">
          <div>
            <h1 className="text-2xl font-bold text-primary leading-[0.5]">
              Depoimentos e avaliações
            </h1>
            <span className="text-sm text-muted-foreground">
              Veja o que nossos usuários estão falando sobre nós
            </span>{" "}
            <Separator className="w-full border-1 border-primary border-solid" />
          </div>

          <div className="flex flex-col items-start justify-center gap-4">
            {users.map((user, index) => (
              <div
                key={index}
                className="flex flex-col items-start justify-center gap-4"
              >
                <div className="flex flex-row items-start justify-center gap-4">
                  <AvatarProfile
                    src={user.src}
                    className="w-15 h-15 border-1 border-primary rounded-full object-cover"
                  />
                  <div className="flex flex-col items-start justify-center gap-0">
                    <h1 className="text-xl font-bold text-primary">
                      {user.name}
                    </h1>
                    <span className="text-sm text-muted-foreground">
                      {user.comment}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-100vw  flex flex-row items-start justify-center gap-10  sm:mx-auto mx-0 bg-accent">
        <div className="max-w-7xl flex flex-row md:flex-nowrap flex-wrap items-center md:justify-between justify-center gap-4 px-4 pt-10 pb-10 sm:pb-20 sm:pt-20">
          <div className="w-full max-w-7xl flex flex-col flex-wrap items-start md:justify-start justify-center gap-4 px-4 pt-10 pb-10 sm:pb-20 sm:mx-auto mx-0 sm:pt-20">
            <h1 className="text-4xl font-extrabold">agende já seus horários</h1>
            <div className="flex flex-row items-center justify-start gap-1">
              <h1 className="text-4xl font-extrabold">ou</h1>
              <h1 className="text-4xl font-extrabold text-primary">
                crie seu perfil profissional
              </h1>
            </div>
            <div>
              <div>
                <h1 className="text-xl font-bold">cadastre-se já</h1>
                <div className="flex flex-row items-center justify-start gap-2">
                  <Button variant="default" className="">
                    <Link href="/login" className="text-lg font-bold">
                      cliente/Paciente
                    </Link>
                  </Button>

                  <Button
                    variant="default"
                    className="bg-chart-2 hover:bg-chart-2/90"
                  >
                    <Link href="/login" className="text-lg font-bold">
                      profissional
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <NextImage src={LogoSevenDays} alt="Logo" width={220} height={220} />
        </div>
      </div>
    </main>
  );
}
