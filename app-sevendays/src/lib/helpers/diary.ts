import type { DiaryDetail, DiaryListItem, DiaryProfessional } from "@/types/diary";

type DiaryAddressSource = Pick<DiaryListItem, "address" | "city" | "state">;

type DiaryWithProfessionalSource = Pick<
  DiaryDetail,
  | "professional"
  | "user_name"
  | "user_email"
  | "professional_branch"
  | "professional_document"
  | "professional_document_type"
  | "professional_description"
  | "address"
  | "city"
  | "state"
  | "neighborhood"
>;

function hasProfessionalSource(
  diary: DiaryAddressSource | DiaryWithProfessionalSource,
): diary is DiaryWithProfessionalSource {
  return "professional" in diary || "user_name" in diary;
}

export function getProfessionalFromDiary(
  diary: DiaryWithProfessionalSource,
): DiaryProfessional {
  if (diary.professional) {
    return {
      ...diary.professional,
      professional_description:
        diary.professional.professional_description ??
        diary.professional.description,
    };
  }

  return {
    name: diary.user_name,
    email: diary.user_email,
    branch: diary.professional_branch,
    document: diary.professional_document,
    document_type: diary.professional_document_type,
    professional_description: diary.professional_description,
    address: diary.address,
    city: diary.city,
    state: diary.state,
    neighborhood: diary.neighborhood,
  };
}

export function buildAddressText(
  diary?: DiaryAddressSource | DiaryWithProfessionalSource,
) {
  if (!diary) {
    return "Endereco nao informado";
  }

  const source = hasProfessionalSource(diary) ? getProfessionalFromDiary(diary) : diary;
  const street = source.address?.trim();
  const city = source.city?.trim();
  const state = source.state?.trim();

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
