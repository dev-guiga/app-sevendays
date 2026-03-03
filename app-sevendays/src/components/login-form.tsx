"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useUser, type UserStatus } from "@/contexts/user-context";
import { sevendaysapi } from "@/lib/sevendaysapi";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserIcon } from "@phosphor-icons/react";
import { toast } from "sonner";

type LoginPayload = {
  user: {
    email: string;
    password: string;
  };
};

type LoginResponse = {
  message?: string;
  success?: boolean;
  user?: {
    id?: number;
    status?: UserStatus;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getLoginErrorMessage(error: unknown): string {
  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  if (isRecord(error) && isRecord(error.error)) {
    const message = error.error.message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }

  if (isRecord(error)) {
    const message = error.message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }

  return "Nao foi possivel realizar o login.";
}

function resolveLoginDestination(user: { id?: number; status?: UserStatus } | null) {
  if (!user?.id) {
    return null;
  }

  if (user.status === "owner") {
    return `/admin/${user.id}/dashboard`;
  }

  return `/${user.id}/portal`;
}

export function LoginForm({
  className,
  onSubmit,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const { refreshCurrentUser } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.(event);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      toast.error("Email e senha sao obrigatorios.");
      return;
    }

    setIsSubmitting(true);

    const payload: LoginPayload = {
      user: {
        email,
        password,
      },
    };

    const loginResult = await sevendaysapi.post<LoginResponse, LoginPayload>(
      "/users/sign_in",
      payload,
      { withCredentials: true },
    );

    if (loginResult.error || loginResult.statusCode !== 200) {
      toast.error(getLoginErrorMessage(loginResult.error));
      setIsSubmitting(false);
      return;
    }

    const currentUser = await refreshCurrentUser({ silent: false });
    const resolvedUser = currentUser ?? loginResult.data?.user ?? null;
    const destination = resolveLoginDestination(resolvedUser);

    if (!destination) {
      toast.error("Login realizado, mas nao foi possivel definir o destino.");
      setIsSubmitting(false);
      return;
    }

    toast.success("Login realizado com sucesso.");
    router.push(destination);
    router.refresh();
    setIsSubmitting(false);
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">
            Faça login na sua conta do Google
          </h1>
          <p className="text-muted-foreground text-sm text-balance">
            Digite seu e-mail abaixo para acessar sua conta
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="email" className="font-bold text-base">
            Username
          </FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="m@example.com"
            required
            disabled={isSubmitting}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="password" className="font-bold text-base">
            Senha
          </FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Digite sua senha"
            required
            disabled={isSubmitting}
          />
        </Field>

        <FieldSeparator>Agora continue com</FieldSeparator>

        <Field>
          <Button type="button" disabled={isSubmitting}>
            <UserIcon size={32} />
            sign-in
          </Button>

          <FieldDescription className="text-center">
            Não tem uma conta?{" "}
            <Link href="/cadastro" className="no-underline">
              <span className="underline underline-offset-4 hover:text-foreground">
                Cadastre-se
              </span>
            </Link>
          </FieldDescription>
        </Field>

        <FieldSeparator>Caso seja Parceiro</FieldSeparator>

        <Field>
          <Button variant="outline" type="submit" className="w-full" isLoading={isSubmitting}>
            {isSubmitting ? "Entrando..." : "sign-in como profissional"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
