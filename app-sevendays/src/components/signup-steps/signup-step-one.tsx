import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type {
  SignupFieldErrors,
  SignupFieldName,
} from "@/components/signup-steps/signup-step-types";

interface SignupStepOneProps {
  className?: string;
  fieldErrors: SignupFieldErrors;
  onFieldChange: (fieldName: SignupFieldName) => void;
  onContinue: () => void;
}

export function SignupStepOne({
  className,
  fieldErrors,
  onFieldChange,
  onContinue,
}: SignupStepOneProps) {
  return (
    <div className={className}>
      <FieldDescription className="text-center">
        Dados de acesso e informacoes pessoais.
      </FieldDescription>
      <div className="flex flex-col gap-5">
        <Field className="flex flex-col gap-0">
          <FieldLabel htmlFor="first_name">Nome</FieldLabel>
          <div className="flex flex-col gap-0">
            <Input
              id="first_name"
              name="first_name"
              type="text"
              placeholder="Joao"
              aria-invalid={Boolean(fieldErrors.first_name)}
              onChange={() => onFieldChange("first_name")}
              required
            />
            <FieldError
              className="text-xs"
              errors={[{ message: fieldErrors.first_name }]}
            />
          </div>
        </Field>

        <Field className="flex flex-col gap-0">
          <FieldLabel htmlFor="last_name">Sobrenome</FieldLabel>
          <div className="flex flex-col gap-1">
            <Input
              id="last_name"
              name="last_name"
              type="text"
              placeholder="Silva"
              aria-invalid={Boolean(fieldErrors.last_name)}
              onChange={() => onFieldChange("last_name")}
              required
            />
            <FieldError
              className="text-xs"
              errors={[{ message: fieldErrors.last_name }]}
            />
          </div>
        </Field>

        <Field className="flex flex-col gap-0">
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <div className="flex flex-col gap-1">
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="joao_silva"
              aria-invalid={Boolean(fieldErrors.username)}
              onChange={() => onFieldChange("username")}
              required
            />
            <FieldError
              className="text-xs"
              errors={[{ message: fieldErrors.username }]}
            />
          </div>
        </Field>

        <Field className="flex flex-col gap-0">
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <div className="flex flex-col gap-1">
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="joao@example.com"
              aria-invalid={Boolean(fieldErrors.email)}
              onChange={() => onFieldChange("email")}
              required
            />
            <FieldError
              className="text-xs"
              errors={[{ message: fieldErrors.email }]}
            />
          </div>
        </Field>

        <Field className="flex flex-col gap-0">
          <FieldLabel htmlFor="password">Senha</FieldLabel>
          <div className="flex flex-col gap-1">
            <Input
              id="password"
              name="password"
              type="password"
              aria-invalid={Boolean(fieldErrors.password)}
              onChange={() => onFieldChange("password")}
              required
            />
            <FieldError
              className="text-xs"
              errors={[{ message: fieldErrors.password }]}
            />
          </div>
        </Field>

        <Field className="flex flex-col gap-0">
          <FieldLabel htmlFor="password_confirmation">
            Confirmar senha
          </FieldLabel>
          <div className="flex flex-col gap-1">
            <Input
              id="password_confirmation"
              name="password_confirmation"
              type="password"
              aria-invalid={Boolean(fieldErrors.password_confirmation)}
              onChange={() => onFieldChange("password_confirmation")}
              required
            />
            <FieldError
              className=" text-xs"
              errors={[{ message: fieldErrors.password_confirmation }]}
            />
          </div>
        </Field>

        <Field className="flex flex-col gap-0">
          <FieldLabel htmlFor="cpf">CPF</FieldLabel>
          <div className="flex flex-col gap-1">
            <Input
              id="cpf"
              name="cpf"
              type="text"
              inputMode="numeric"
              placeholder="12345678901"
              aria-invalid={Boolean(fieldErrors.cpf)}
              onChange={() => onFieldChange("cpf")}
              required
            />
            <FieldError
              className="text-xs"
              errors={[{ message: fieldErrors.cpf }]}
            />
          </div>
        </Field>

        <Field className="flex flex-col gap-0">
          <FieldLabel htmlFor="birth_date">Data de nascimento</FieldLabel>
          <div className="flex flex-col gap-1">
            <Input
              id="birth_date"
              name="birth_date"
              type="date"
              aria-invalid={Boolean(fieldErrors.birth_date)}
              onChange={() => onFieldChange("birth_date")}
              required
            />
            <FieldError
              className="text-xs"
              errors={[{ message: fieldErrors.birth_date }]}
            />
          </div>
        </Field>
        <Field>
          <Button type="button" onClick={onContinue} className="w-full">
            Continuar para endereco
          </Button>
        </Field>
      </div>
    </div>
  );
}
