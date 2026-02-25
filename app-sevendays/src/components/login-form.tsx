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

import GoogleIcon from "@/app/assets/image/google-icon.svg";

import NextImage from "next/image";
import Link from "next/link";
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
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
          <Input id="email" type="email" placeholder="m@example.com" required />
        </Field>

        <FieldSeparator>Agora continue com</FieldSeparator>

        <Field>
          <Button variant="outline" type="button">
            <NextImage
              src={GoogleIcon}
              alt="Google Icon"
              width={16}
              height={16}
            />
            Login com Google
          </Button>

          <FieldDescription className="text-center">
            Não tem uma conta?{" "}
            <a href="/cadastro" className="no-underline">
              <span className="underline underline-offset-4 hover:text-foreground">
                Cadastre-se
              </span>
            </a>
          </FieldDescription>
        </Field>

        <FieldSeparator>Caso seja Parceiro</FieldSeparator>

        <Field>
          <Link href="/login" className="text-center font-bold text-lg">
            <Button type="submit" className="w-full">Login</Button>
          </Link>
        </Field>
      </FieldGroup>
    </form>
  );
}
