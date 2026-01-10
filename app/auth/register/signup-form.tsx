"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  SelectContent,
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const roleOptions = [
  {
    value: "CANDIDATE",
    label: "Candidat à l'emploi ou à la recherche d'un logement",
  },
  {
    value: "RECRUITER",
    label: "Responsable du recrutement",
  },
  {
    value: "OWNER",
    label: "Propriétaire de biens immobiliers",
  },
];

const SignupFormSchema = z
  .object({
    name: z.string().min(2, {
      message: "Le nom doit contenir au moins 2 caractères.",
    }),
    email: z.email({
      message: "Adresse email invalide.",
    }),
    company: z.optional(z.string()),
    roles: z.string(),
    password: z.string().min(8, {
      message: "Le mot de passe doit contenir au moins 8 caractères.",
    }),
    passwordConfirmation: z
      .string()
      .min(1, { message: "Le mot de passe de confirmation est requis." }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["passwordConfirmation"],
  });

export function SignupForm() {
  const router = useRouter();

  const form = useForm<z.infer<typeof SignupFormSchema>>({
    resolver: zodResolver(SignupFormSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      roles: "",
      password: "",
      passwordConfirmation: "",
    },
  });
  const {
    formState: { isSubmitting },
  } = form;

  const roles = useWatch({ control: form.control, name: "roles" });

  async function onSubmit(values: z.infer<typeof SignupFormSchema>) {
    await authClient.signUp.email({
      email: values.email,
      password: values.password,
      name: values.name,
      roles: values.roles,
      company: values.company,
      fetchOptions: {
        onSuccess: () => {
          toast.success("Inscription réussie.");
          router.push("/");
        },
        onError: () => {
          toast.error("Une erreur est survenue.");
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Dupont"
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="nom@exemple.com"
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="roles"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Votre rôle</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="job-type">
                      <SelectValue placeholder="Sélectionnez votre rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {roles === "RECRUITER" && (
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entreprise</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="entreprise"
                      className="h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe</FormLabel>
                <FormControl>
                  <PasswordInput
                    autoComplete="new-password"
                    placeholder="Entrez votre mot de passe"
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="passwordConfirmation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmer le mot de passe</FormLabel>
                <FormControl>
                  <PasswordInput
                    autoComplete="new-password"
                    placeholder="Confirmer votre mot de passe"
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Création du compte...
              </>
            ) : (
              "Créer un compte"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
