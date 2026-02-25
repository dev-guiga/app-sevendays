import type { SignupFormValues } from "@/lib/signup-payload";

export type SignupFieldName = Exclude<keyof SignupFormValues, "status">;
export type SignupFieldErrors = Partial<Record<SignupFieldName, string>>;
