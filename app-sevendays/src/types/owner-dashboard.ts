import type { OwnerProfileUpdateInput } from "@/components/OwnerProfileEditModal";

export type CurrentOwnerResponse = {
  user?: {
    id?: number;
    full_name?: string;
    username?: string;
    email?: string;
    status?: "owner" | "user" | "standard";
    professional_description?: string | null;
    professional_document?: string | null;
    professional_branch?: string | null;
    address?: {
      address?: string;
      city?: string;
      state?: string;
      neighborhood?: string;
    };
  };
};

export type Owner = NonNullable<CurrentOwnerResponse["user"]>;

export type OwnerUpdateRequest = {
  user: OwnerProfileUpdateInput;
};
