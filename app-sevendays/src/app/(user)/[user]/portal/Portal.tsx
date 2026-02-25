"use client";

import PartnersCard from "@/components/PartnerCard";

import TemplateImage from "@/app/(user)/[user]/portal/components/TemplateImage";

export default function Portal() {
  return (
    <>
      <div className="flex flex-col items-center justify-center py-35 bg-primary">
        <TemplateImage />
      </div>

      <PartnersCard />
    </>
  );
}
