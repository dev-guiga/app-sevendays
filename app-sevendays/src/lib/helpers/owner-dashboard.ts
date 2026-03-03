import type { CurrentOwnerResponse, Owner } from "@/types/owner-dashboard";

const DEFAULT_OWNER_ADDRESS = "Endereço não cadastrado";
const DEFAULT_OWNER_NAME = "Owner";
const DEFAULT_OWNER_DESCRIPTION = "Descrição profissional não cadastrada.";
const DEFAULT_OWNER_AVATAR_SEED = "owner";
const DICEBEAR_INITIALS_URL = "https://api.dicebear.com/9.x/initials/svg?seed=";

export function formatOwnerAddress(address?: Owner["address"]) {
  if (!address) {
    return DEFAULT_OWNER_ADDRESS;
  }

  const firstLine = [address.address, address.neighborhood]
    .filter((value): value is string => Boolean(value))
    .join(", ");
  const secondLine = [address.city, address.state]
    .filter((value): value is string => Boolean(value))
    .join(" - ");

  const fullAddress = [firstLine, secondLine]
    .filter((value): value is string => Boolean(value))
    .join(" | ");

  return fullAddress || DEFAULT_OWNER_ADDRESS;
}

export function getOwnerName(owner: NonNullable<CurrentOwnerResponse["user"]>) {
  return owner.full_name || owner.username || DEFAULT_OWNER_NAME;
}

export function getOwnerInfo(owner: Owner | null) {
  if (!owner) {
    return "";
  }

  return `@${owner.username ?? DEFAULT_OWNER_AVATAR_SEED} • ${owner.email ?? "sem e-mail"}`;
}

export function getOwnerWorkDescription(owner: Owner | null) {
  if (!owner?.professional_description) {
    return DEFAULT_OWNER_DESCRIPTION;
  }

  const trimmedDescription = owner.professional_description.trim();
  return trimmedDescription.length > 0 ? trimmedDescription : DEFAULT_OWNER_DESCRIPTION;
}

export function getOwnerAvatar(owner: Owner | null) {
  if (!owner) {
    return `${DICEBEAR_INITIALS_URL}${DEFAULT_OWNER_AVATAR_SEED}`;
  }

  const seed = getOwnerName(owner);
  return `${DICEBEAR_INITIALS_URL}${encodeURIComponent(seed)}`;
}
