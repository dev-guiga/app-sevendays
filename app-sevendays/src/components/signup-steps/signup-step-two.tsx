import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { CircleNotchIcon } from "@phosphor-icons/react";
import type {
  SignupFieldErrors,
  SignupFieldName,
} from "@/components/signup-steps/signup-step-types";

interface SignupStepTwoProps {
  className?: string;
  fieldErrors: SignupFieldErrors;
  onFieldChange: (fieldName: SignupFieldName) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export function SignupStepTwo({
  className,
  fieldErrors,
  onFieldChange,
  onBack,
  isSubmitting,
}: SignupStepTwoProps) {
  return (
    <div className={className}>
      <FieldDescription className="text-center">
        Dados de endereco para finalizar o cadastro.
      </FieldDescription>

      <div className="flex flex-col gap-5">
        <Field className="flex flex-col gap-0">
          <FieldLabel htmlFor="address">Endereco</FieldLabel>
          <div className="flex flex-col gap-1">
            <Input
              id="address"
              name="address"
              type="text"
              placeholder="Rua Um, 10"
              aria-invalid={Boolean(fieldErrors.address)}
              onChange={() => onFieldChange("address")}
              required
            />
            <FieldError
              className="text-xs"
              errors={[{ message: fieldErrors.address }]}
            />
          </div>
        </Field>

        <Field className="flex flex-col gap-0">
          <FieldLabel htmlFor="neighborhood">Bairro</FieldLabel>
          <div className="flex flex-col gap-1">
            <Input
              id="neighborhood"
              name="neighborhood"
              type="text"
              placeholder="Centro"
              aria-invalid={Boolean(fieldErrors.neighborhood)}
              onChange={() => onFieldChange("neighborhood")}
              required
            />
            <FieldError
              className="text-xs"
              errors={[{ message: fieldErrors.neighborhood }]}
            />
          </div>
        </Field>

        <Field className="flex flex-col gap-0">
          <FieldLabel htmlFor="city">Cidade</FieldLabel>
          <div className="flex flex-col gap-1">
            <Input
              id="city"
              name="city"
              type="text"
              placeholder="Sao Paulo"
              aria-invalid={Boolean(fieldErrors.city)}
              onChange={() => onFieldChange("city")}
              required
            />
            <FieldError
              className="text-xs"
              errors={[{ message: fieldErrors.city }]}
            />
          </div>
        </Field>

        <Field className="flex flex-col gap-0">
          <FieldLabel htmlFor="state">Estado</FieldLabel>
          <div className="flex flex-col gap-1">
            <Input
              id="state"
              name="state"
              type="text"
              placeholder="SP"
              aria-invalid={Boolean(fieldErrors.state)}
              onChange={() => onFieldChange("state")}
              required
            />
            <FieldError
              className="text-xs"
              errors={[{ message: fieldErrors.state }]}
            />
          </div>
        </Field>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="w-30"
          >
            Voltar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex-1"
          >
            {isSubmitting ? (
              <>
                <CircleNotchIcon size={14} className="animate-spin" />
                Criando conta...
              </>
            ) : (
              "Criar conta"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
