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
import { sevendaysapi } from "@/lib/sevendaysapi";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserIcon } from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";

type LoginPayload = {
  user: {
    email: string;
    password: string;
  };
};

type LoginResponse = {
  message: string;
};

type CurrentUserResponse = {
  user?: {
    username?: string;
    status?: "user" | "owner";
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

export function LoginForm({
  className,
  onSubmit,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
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

    const currentUserResult = await sevendaysapi.get<CurrentUserResponse>(
      "/user",
      {
        withCredentials: true,
      },
    );

    if (currentUserResult.error || currentUserResult.statusCode !== 200) {
      toast.error("Login realizado, mas nao foi possivel carregar o usuario.");
      setIsSubmitting(false);
      return;
    }

    const currentUser = currentUserResult.data?.user;

    if (!currentUser?.username) {
      toast.error(
        "Login realizado, mas faltam dados do usuario para redirecionar.",
      );
      setIsSubmitting(false);
      return;
    }

    const destination =
      currentUser.status === "owner"
        ? `/admin/${currentUser.username}/dashboard`
        : `/${currentUser.username}/portal`;

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
          <Button
            variant="outline"
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Entrando..." : "sign-in como profissional"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
