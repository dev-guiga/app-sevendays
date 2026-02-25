import NextImage from "next/image";
import { LoginForm } from "@/components/login-form";
import LogoSevenDays from "@/app/assets/image/logo-seven-days.png";

import homePageBgImage from "../assets/image/hex-purple-bg.svg";


export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <NextImage src={LogoSevenDays} alt="Logo" width={50} height={50} />

            <h1 className="text-2xl font-bold text-primary text-shadow-sm">
              Se7en Days
            
            </h1>
          </a>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>
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
