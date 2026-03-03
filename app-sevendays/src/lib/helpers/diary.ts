import type { DiaryListItem } from "@/types/diary";

export function buildAddressText(diary: DiaryListItem) {
  const street = diary.address?.trim();
  const city = diary.city?.trim();
  const state = diary.state?.trim();

  if (street && city && state) {
    return `${street} • ${city}, ${state}`;
  }

  if (street) {
    return street;
  }

  if (city && state) {
    return `${city}, ${state}`;
  }

  return "Endereco nao informado";
}

export function getProfessionalDescription(diary: DiaryListItem) {
  return (
    diary.professional_description?.trim() ||
    diary.professional?.professional_description?.trim() ||
    diary.professional?.description?.trim() ||
    "Sem descricao profissional informada."
  );
}
