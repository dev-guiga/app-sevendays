import { format, parseISO } from "date-fns";

import type { UserProfile } from "@/types/user";

export function formatAddress(address?: UserProfile["address"]) {
  if (!address) {
    return "Endereco nao cadastrado";
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

  return fullAddress || "Endereco nao cadastrado";
}

export function formatBirthDate(value?: string) {
  if (!value) {
    return "Nascimento nao informado";
  }

  try {
    return format(parseISO(value), "dd/MM/yyyy");
  } catch {
    return value;
  }
}

export function getUserName(user: UserProfile | null) {
  if (!user) {
    return "Usuario";
  }

  return (
    user.full_name ||
    [user.first_name, user.last_name].filter(Boolean).join(" ").trim() ||
    user.username ||
    "Usuario"
  );
}
