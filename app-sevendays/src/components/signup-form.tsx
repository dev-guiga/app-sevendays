import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,

} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";

import GoogleIcon from "@/app/assets/image/google-icon.svg";

import NextImage from "next/image";


interface SignupFormProps {
  userType: string;
}

export function SignupForm({
  userType,
  className,
  ...props
}: React.ComponentProps<"form"> & SignupFormProps) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      {userType === "user" ? (
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Crie sua conta</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Preencha o formulário abaixo para criar sua conta
            </p>
          </div>
          <Field>
            <FieldLabel htmlFor="name">Nome Completo</FieldLabel>
            <Input id="name" type="text" placeholder="John Doe" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="email">E-mail</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
            />
            <FieldDescription>
              Usaremos este e-mail para contato. Não compartilharemos seu e-mail
              com ninguém.
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Username</FieldLabel>
            <Input id="password" type="text" required />
            <FieldDescription></FieldDescription>
          </Field>

          <Field>
            <Button type="submit" className="flex items-center gap-2">
              <NextImage
                src={GoogleIcon}
                alt="Google Icon"
                width={16}
                height={16}
              />
              Continuar com o Google
            </Button>
          </Field>
        </FieldGroup>
      ) : (
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Crie sua conta</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Preencha o formulário abaixo para criar sua conta
            </p>
          </div>
          <Field>
            <FieldLabel htmlFor="name">Nome Completo</FieldLabel>
            <Input id="name" type="text" placeholder="John Doe" required />
          </Field>

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
            />
            <FieldDescription>
              Usaremos este e-mail para contato. Não compartilharemos seu e-mail
              com ninguém.
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Username</FieldLabel>
            <Input id="password" type="text" required />
            <FieldDescription></FieldDescription>
          </Field>

          <Field className="flex items-center gap-2 justify-center w-full">
            <div className="flex items-center gap-2">
              <Checkbox id="terms" className="size-4" />
              <FieldLabel htmlFor="terms">Deseja ser um parceiro?</FieldLabel>
            </div>
          </Field>

          <Field>
            <FieldLabel htmlFor="description">BIO</FieldLabel>
            <Textarea
              id="description"
              placeholder="Lauren, 28 anos, psicóloga, USP, São Paulo..."
              required
            />
          </Field>

          <Field>
            <Button type="submit" className="flex items-center gap-2">
              <NextImage
                src={GoogleIcon}
                alt="Google Icon"
                width={16}
                height={16}
              />
              Continuar com o Google
            </Button>
          </Field>
        </FieldGroup>
      )}
    </form>
  );
}
