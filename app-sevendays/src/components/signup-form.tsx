"use client";

import { useMemo, useRef, useState } from "react";

import type {
  SignupFieldErrors,
  SignupFieldName,
} from "@/components/signup-steps/signup-step-types";
import { SignupStepOne } from "@/components/signup-steps/signup-step-one";
import { SignupStepTwo } from "@/components/signup-steps/signup-step-two";
import { SignupStepsIndicator } from "@/components/signup-steps/signup-steps-indicator";
import { Field, FieldDescription, FieldError, FieldGroup } from "@/components/ui/field";
import {
  buildSignupPayload,
  signupFormSchema,
  signupStepOneSchema,
  signupStepTwoSchema,
  type SignupFormValues,
  type SignupStatus,
} from "@/lib/signup-payload";

import { cn } from "@/lib/utils";
import { sevendaysapi } from "@/lib/sevendaysapi";

interface SignupFormProps {
  userType: string;
}

type SignupStep = 1 | 2;
type ValidationIssue = { path: readonly PropertyKey[]; message: string };

const stepOneFieldNames: SignupFieldName[] = [
  "first_name",
  "last_name",
  "username",
  "email",
  "password",
  "password_confirmation",
  "cpf",
  "birth_date",
];

const stepTwoFieldNames: SignupFieldName[] = [
  "address",
  "neighborhood",
  "city",
  "state",
];

const apiErrorFieldMap: Record<string, SignupFieldName> = {
  first_name: "first_name",
  last_name: "last_name",
  username: "username",
  email: "email",
  password: "password",
  password_confirmation: "password_confirmation",
  cpf: "cpf",
  birth_date: "birth_date",
  address: "address",
  "address.address": "address",
  city: "city",
  "address.city": "city",
  state: "state",
  "address.state": "state",
  neighborhood: "neighborhood",
  "address.neighborhood": "neighborhood",
};

function getSignupStatus(userType: string): SignupStatus {
  return userType === "owner" ? "owner" : "user";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getApiErrorMessage(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.find((item): item is string => typeof item === "string");
  }

  return undefined;
}

function mapApiFieldErrors(responseData: unknown): SignupFieldErrors {
  if (!isRecord(responseData) || !isRecord(responseData.error)) {
    return {};
  }

  const error = responseData.error;
  if (!isRecord(error.details)) {
    return {};
  }

  const details = error.details;
  const fieldErrors: SignupFieldErrors = {};

  for (const [field, value] of Object.entries(details)) {
    if (isRecord(value)) {
      for (const [nestedField, nestedValue] of Object.entries(value)) {
        const mappedField = apiErrorFieldMap[`${field}.${nestedField}`];
        const message = getApiErrorMessage(nestedValue);
        if (mappedField && message && !fieldErrors[mappedField]) {
          fieldErrors[mappedField] = message;
        }
      }
      continue;
    }

    const mappedField = apiErrorFieldMap[field];
    const message = getApiErrorMessage(value);
    if (mappedField && message && !fieldErrors[mappedField]) {
      fieldErrors[mappedField] = message;
    }
  }

  return fieldErrors;
}

function getApiFormError(responseData: unknown): string {
  if (!isRecord(responseData) || !isRecord(responseData.error)) {
    return "Nao foi possivel criar sua conta.";
  }

  const message = responseData.error.message;
  if (typeof message === "string" && message.trim().length > 0) {
    return message;
  }

  return "Nao foi possivel criar sua conta.";
}

function mapIssuesToFieldErrors(
  issues: readonly ValidationIssue[],
  allowedFields?: readonly SignupFieldName[]
): SignupFieldErrors {
  const allowed = allowedFields ? new Set(allowedFields) : null;
  const fieldErrors: SignupFieldErrors = {};

  for (const issue of issues) {
    const fieldName = issue.path[0];
    if (typeof fieldName !== "string" || fieldName === "status") {
      continue;
    }

    const typedFieldName = fieldName as SignupFieldName;
    if (allowed && !allowed.has(typedFieldName)) {
      continue;
    }

    if (!fieldErrors[typedFieldName]) {
      fieldErrors[typedFieldName] = issue.message;
    }
  }

  return fieldErrors;
}

function readFormValues(formData: FormData, status: SignupStatus): SignupFormValues {
  return {
    first_name: String(formData.get("first_name") ?? ""),
    last_name: String(formData.get("last_name") ?? ""),
    username: String(formData.get("username") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    password_confirmation: String(formData.get("password_confirmation") ?? ""),
    cpf: String(formData.get("cpf") ?? ""),
    birth_date: String(formData.get("birth_date") ?? ""),
    status,
    address: String(formData.get("address") ?? ""),
    city: String(formData.get("city") ?? ""),
    state: String(formData.get("state") ?? ""),
    neighborhood: String(formData.get("neighborhood") ?? ""),
  };
}

function pickStepOneValues(values: SignupFormValues) {
  return {
    first_name: values.first_name,
    last_name: values.last_name,
    username: values.username,
    email: values.email,
    password: values.password,
    password_confirmation: values.password_confirmation,
    cpf: values.cpf,
    birth_date: values.birth_date,
    status: values.status,
  };
}

function pickStepTwoValues(values: SignupFormValues) {
  return {
    address: values.address,
    city: values.city,
    state: values.state,
    neighborhood: values.neighborhood,
  };
}

export function SignupForm({
  userType,
  className,
  onSubmit,
  ...props
}: React.ComponentProps<"form"> & SignupFormProps) {
  const [currentStep, setCurrentStep] = useState<SignupStep>(1);
  const [fieldErrors, setFieldErrors] = useState<SignupFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const status = useMemo(() => getSignupStatus(userType), [userType]);

  const clearStepErrors = (stepFields: readonly SignupFieldName[]) => {
    setFieldErrors((previous) => {
      const next = { ...previous };
      let hasChanges = false;

      for (const field of stepFields) {
        if (next[field]) {
          delete next[field];
          hasChanges = true;
        }
      }

      return hasChanges ? next : previous;
    });
  };

  const setStepErrors = (
    stepFields: readonly SignupFieldName[],
    nextStepErrors: SignupFieldErrors
  ) => {
    setFieldErrors((previous) => {
      const next = { ...previous };
      for (const field of stepFields) {
        delete next[field];
      }

      return { ...next, ...nextStepErrors };
    });
  };

  const clearFieldError = (fieldName: SignupFieldName) => {
    setFieldErrors((previous) => {
      if (!previous[fieldName]) {
        return previous;
      }

      const next = { ...previous };
      delete next[fieldName];
      return next;
    });
  };

  const clearFormMessages = () => {
    if (formError) {
      setFormError(null);
    }

    if (successMessage) {
      setSuccessMessage(null);
    }
  };

  const handleFieldChange = (fieldName: SignupFieldName) => {
    clearFieldError(fieldName);
    clearFormMessages();
  };

  const validateStepOne = (formValues: SignupFormValues): boolean => {
    const parsedStepOne = signupStepOneSchema.safeParse(pickStepOneValues(formValues));
    if (parsedStepOne.success) {
      clearStepErrors(stepOneFieldNames);
      return true;
    }

    const stepOneErrors = mapIssuesToFieldErrors(parsedStepOne.error.issues, stepOneFieldNames);
    setStepErrors(stepOneFieldNames, stepOneErrors);
    return false;
  };

  const validateStepTwo = (formValues: SignupFormValues): boolean => {
    const parsedStepTwo = signupStepTwoSchema.safeParse(pickStepTwoValues(formValues));
    if (parsedStepTwo.success) {
      clearStepErrors(stepTwoFieldNames);
      return true;
    }

    const stepTwoErrors = mapIssuesToFieldErrors(parsedStepTwo.error.issues, stepTwoFieldNames);
    setStepErrors(stepTwoFieldNames, stepTwoErrors);
    return false;
  };

  const getFormValuesFromRef = (): SignupFormValues | null => {
    const formElement = formRef.current;
    if (!formElement) {
      return null;
    }

    return readFormValues(new FormData(formElement), status);
  };

  const handleContinueToAddress = () => {
    const currentValues = getFormValuesFromRef();
    if (!currentValues) {
      return;
    }

    if (validateStepOne(currentValues)) {
      setCurrentStep(2);
    }
  };

  const handleBackToPreviousStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    onSubmit?.(event);
    if (event.defaultPrevented) {
      return;
    }

    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const formElement = event.currentTarget;
    const formValues = readFormValues(new FormData(formElement), status);

    if (currentStep === 1) {
      if (validateStepOne(formValues)) {
        setCurrentStep(2);
      }
      return;
    }

    if (!validateStepTwo(formValues)) {
      return;
    }

    const parsedValues = signupFormSchema.safeParse(formValues);
    if (!parsedValues.success) {
      const zodFieldErrors = mapIssuesToFieldErrors(parsedValues.error.issues);
      setFieldErrors(zodFieldErrors);

      const hasStepOneErrors = stepOneFieldNames.some((field) => zodFieldErrors[field]);
      setCurrentStep(hasStepOneErrors ? 1 : 2);
      return;
    }

    const payload = buildSignupPayload(parsedValues.data);

    setIsSubmitting(true);
    setFieldErrors({});

    const result = await sevendaysapi.post("/users", payload);

    if (result.error === null) {
      formElement.reset();
      setCurrentStep(1);
      setFieldErrors({});
      setSuccessMessage("Conta criada com sucesso.");
      setIsSubmitting(false);
      return;
    }

    if (result.statusCode !== -1) {
      const responseData = result.error;
      const apiFieldErrors = mapApiFieldErrors(responseData);
      setFieldErrors(apiFieldErrors);

      const hasStepOneErrors = stepOneFieldNames.some((field) => apiFieldErrors[field]);
      setCurrentStep(hasStepOneErrors ? 1 : 2);
      setFormError(getApiFormError(responseData));
    } else {
      setFormError("Nao foi possivel conectar com a API.");
    }

    setIsSubmitting(false);
  };

  return (
    <form
      ref={formRef}
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      noValidate
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Crie sua conta</h1>
          <p className="text-muted-foreground text-sm text-balance">
            {status === "owner"
              ? "Preencha os dados para criar sua conta de parceiro."
              : "Preencha os dados para criar sua conta de usuario."}
          </p>
        </div>

        <SignupStepsIndicator currentStep={currentStep} />

        <SignupStepOne
          className={cn("flex flex-col gap-4", currentStep === 1 ? "block" : "hidden")}
          fieldErrors={fieldErrors}
          onFieldChange={handleFieldChange}
          onContinue={handleContinueToAddress}
        />

        <SignupStepTwo
          className={cn("flex flex-col gap-4", currentStep === 2 ? "block" : "hidden")}
          fieldErrors={fieldErrors}
          onFieldChange={handleFieldChange}
          onBack={handleBackToPreviousStep}
          isSubmitting={isSubmitting}
        />

        {formError ? (
          <Field>
            <FieldError className="mt-1 text-xs">{formError}</FieldError>
          </Field>
        ) : null}

        {successMessage ? (
          <Field>
            <FieldDescription className="text-center text-green-600">
              {successMessage}
            </FieldDescription>
          </Field>
        ) : null}
      </FieldGroup>
    </form>
  );
}
