import { z } from "zod";

const statusSchema = z.enum(["user", "owner"]);

const requiredMessage = (fieldLabel: string) => `${fieldLabel} e obrigatorio`;

const nameSchema = z.string().trim().min(1, requiredMessage("Nome"));
const lastNameSchema = z.string().trim().min(1, requiredMessage("Sobrenome"));
const usernameSchema = z.string().trim().min(1, requiredMessage("Username"));
const emailSchema = z
  .string()
  .trim()
  .min(1, requiredMessage("Email"))
  .email("Email invalido");
const passwordSchema = z
  .string()
  .trim()
  .min(1, requiredMessage("Senha"))
  .min(8, "Senha deve ter ao menos 8 caracteres");
const birthDateSchema = z
  .string()
  .trim()
  .min(1, requiredMessage("Data de nascimento"))
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Data de nascimento deve estar no formato AAAA-MM-DD");
const cpfSchema = z
  .string()
  .trim()
  .min(1, requiredMessage("CPF"))
  .transform((value) => value.replace(/\D/g, ""))
  .refine((value) => value.length === 11, "CPF deve conter 11 digitos");

const addressAttributesSchema = z.object({
  address: z.string().trim().min(1, requiredMessage("Endereco")),
  city: z.string().trim().min(1, requiredMessage("Cidade")),
  state: z.string().trim().min(1, requiredMessage("Estado")),
  neighborhood: z.string().trim().min(1, requiredMessage("Bairro")),
});

const signupStepOneFields = {
  first_name: nameSchema,
  last_name: lastNameSchema,
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  password_confirmation: passwordSchema,
  cpf: cpfSchema,
  birth_date: birthDateSchema,
  status: statusSchema,
};

const signupStepTwoFields = {
  address: addressAttributesSchema.shape.address,
  city: addressAttributesSchema.shape.city,
  state: addressAttributesSchema.shape.state,
  neighborhood: addressAttributesSchema.shape.neighborhood,
};

const userPayloadSchema = z
  .object({
    ...signupStepOneFields,
    address_attributes: addressAttributesSchema,
  })
  .superRefine((value, context) => {
    if (value.password !== value.password_confirmation) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password_confirmation"],
        message: "A confirmacao de senha deve ser igual a senha",
      });
    }
  });

export const signupPayloadSchema = z.object({
  user: userPayloadSchema,
});

export const signupStepOneSchema = z
  .object(signupStepOneFields)
  .superRefine((value, context) => {
    if (value.password !== value.password_confirmation) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password_confirmation"],
        message: "A confirmacao de senha deve ser igual a senha",
      });
    }
  });

export const signupStepTwoSchema = z.object(signupStepTwoFields);

export const signupFormSchema = z
  .object({
    ...signupStepOneFields,
    ...signupStepTwoFields,
  })
  .superRefine((value, context) => {
    if (value.password !== value.password_confirmation) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password_confirmation"],
        message: "A confirmacao de senha deve ser igual a senha",
      });
    }
  });

export type SignupStatus = z.infer<typeof statusSchema>;
export type SignupFormValues = z.infer<typeof signupFormSchema>;
export type SignupPayload = z.infer<typeof signupPayloadSchema>;

export function buildSignupPayload(values: SignupFormValues): SignupPayload {
  const parsedValues = signupFormSchema.parse(values);

  const payload: SignupPayload = {
    user: {
      first_name: parsedValues.first_name,
      last_name: parsedValues.last_name,
      username: parsedValues.username,
      email: parsedValues.email,
      password: parsedValues.password,
      password_confirmation: parsedValues.password_confirmation,
      cpf: parsedValues.cpf,
      birth_date: parsedValues.birth_date,
      status: parsedValues.status,
      address_attributes: {
        address: parsedValues.address,
        city: parsedValues.city,
        state: parsedValues.state,
        neighborhood: parsedValues.neighborhood,
      },
    },
  };

  return signupPayloadSchema.parse(payload);
}
