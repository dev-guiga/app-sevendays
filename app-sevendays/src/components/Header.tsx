import logo from "@/app/assets/image/logo-seven-days.png";

import { ModeToggle } from "@/components/Mode-toggle";

import NextImage from "next/image";
import { SideBar } from "./SideBar";

export function Header() {
  return (
    <>
      <header className="sticky top-0 w-auto py-2 bg-accent z-1">
        <div className="w-auto max-w-7xl flex flex-col items-start justify-center px-4 sm:mx-auto mx-0">
          <div className="flex items-center justify-center gap-2">
            <div className="">
              <NextImage src={logo} alt="Logo" width={45} height={45} />
            </div>
            <h1 className="text-2xl font-bold">Sev7en Days</h1>
          </div>
        </div>
        <div className="absolute right-4 bottom-4">
          <ModeToggle />
          <SideBar />
        </div>
      </header>
    </>
  );
}
