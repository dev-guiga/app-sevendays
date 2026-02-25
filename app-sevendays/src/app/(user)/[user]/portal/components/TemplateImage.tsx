"use client";
import NextImage from "next/image";

import AgendaImage from "@/app/assets/image/agenda.jpg";
import BarberShopImage from "@/app/assets/image/barbearia.jpg";
import ReceptionistImage from "@/app/assets/image/recepcionista.jpg";
import calendarIcon from "@/app/assets/image/calendar.png";
import Image from "next/image";

export default function TemplateImage() {
  return (
    <div className="w-full max-w-7xl flex flex-row items-center justify-center gap-10  sm:mx-auto mx-0 px-4">
      <div className="flex flex-col items-center justify-center lg:w-1/2 w-full lg:items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary-foreground">
            Agende seu horário com o melhor
          </h1>
          <h4 className="text-lg font-medium text-start text-primary-foreground">
            Agendamento em tempo real
          </h4>
        </div>
        <Image
          src={calendarIcon}
          alt="Image"
          width={300}
          height={300}
          className="rounded-full"
        />
      </div>

      <div className="w-full h-full items-center justify-center hidden lg:block">
        <div className="w-full items-center justify-center hidden lg:block">
          <div className="relative w-full max-w-[500px]">
            <NextImage
              src={AgendaImage}
              alt="Image"
              width={220}
              height={220}
              className="absolute top-0 -right-25 rounded-full"
            />

            <NextImage
              src={BarberShopImage}
              alt="Image"
              width={300}
              height={300}
              className="absolute -top-15 left-9 rounded-full"
            />

            <NextImage
              src={ReceptionistImage}
              alt="Image"
              width={220}
              height={220}
              className="absolute bottom-0 right-0 rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
