"use client";
import { useState } from "react";

import { SignupForm } from "@/components/signup-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

import LogoSevenDays from "@/app/assets/image/logo-seven-days.png";
import homePageBgImage from "../assets/image/hex-purple-bg.svg";

import NextImage from "next/image";

export default function CadastroPage() {
  const [userType, setUserType] = useState("user");

  const handleUserTypeChange = (value: string) => {
    setUserType(value);
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10 ">
        <div className="flex justify-center gap-2">
          <a
            href="#"
            className="flex items-center justify-center gap-2 font-medium"
          >
            <NextImage src={LogoSevenDays} alt="Logo" width={50} height={50} />

            <h1 className="text-2xl font-bold text-primary text-shadow-sm">
              Se7en Days
            </h1>
          </a>
        </div>

        <RadioGroup
          value={userType}
          onValueChange={handleUserTypeChange}
          defaultValue="user"
          className="flex items-center justify-center gap-2"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="user" />
            <Label htmlFor="user">Usuário</Label>
          </div>

          <div className="flex items-center gap-2">
            <RadioGroupItem value="partner" />
            <Label htmlFor="partner">Parceiro</Label>
          </div>
        </RadioGroup>

        {userType === "user" ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-md items-center justify-center">
              <SignupForm userType={userType} />
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-1 items-center justify-center">
              <div className="w-full max-w-md">
                <SignupForm userType={userType} />
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="relative hidden bg-muted lg:block">
        <NextImage
          src={homePageBgImage}
          alt="Fundo hexagonal roxo"
          fill
          className="object-cover"
        />
      </div>
    </div>
  );
}
