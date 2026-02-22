"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";

const privacyValues = ["public", "private", "secret"] as const;

const privacyLabels: Record<(typeof privacyValues)[number], string> = {
  public: "Public — visible par tous",
  private: "Privé — visible mais accès sur invitation",
  secret: "Secret — invisible et accès sur invitation",
};

const formSchema = z.object({
  name: z
    .string()
    .min(3, "Le nom doit contenir au moins 3 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),
  description: z
    .string()
    .min(10, "La description doit contenir au moins 10 caractères")
    .max(500, "La description ne peut pas dépasser 500 caractères"),
  privacy: z.enum(privacyValues),
});

type FormSchema = z.infer<typeof formSchema>;

interface CreateCommunityFormProps {
  onSuccess?: () => void;
}

export function CreateCommunityForm({ onSuccess }: CreateCommunityFormProps) {
  const createCommunity = useMutation(api.communities.createCommunty);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      privacy: "public",
    },
  });

  const onSubmit = async (data: FormSchema) => {
    try {
      await createCommunity({
        name: data.name,
        description: data.description,
        privacy: data.privacy,
      });
      toast.success("Communauté créée avec succès !");
      form.reset();
      onSuccess?.();
    } catch {
      toast.error("Erreur lors de la création de la communauté");
    }
  };

  return (
    <div className="space-y-6">
      <form
        id="create-community-form"
        onSubmit={form.handleSubmit(onSubmit)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
            e.preventDefault();
          }
        }}
      >
        <FieldGroup className="space-y-4">
          {/* Nom */}
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="community-name">
                  Nom de la communauté *
                </FieldLabel>
                <Input
                  {...field}
                  id="community-name"
                  aria-invalid={fieldState.invalid}
                  placeholder="Ex: Francophones en Allemagne"
                  autoComplete="off"
                />
                <FieldDescription>
                  Le nom sera utilisé pour générer l&apos;URL de la communauté.
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Description */}
          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="community-description">
                  Description *
                </FieldLabel>
                <InputGroup>
                  <InputGroupTextarea
                    {...field}
                    id="community-description"
                    placeholder="Décrivez le but et le thème de votre communauté..."
                    rows={4}
                    className="min-h-24 resize-none"
                    aria-invalid={fieldState.invalid}
                  />
                  <InputGroupAddon align="block-end">
                    <InputGroupText className="tabular-nums">
                      {field.value.length} / 500
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Privacy */}
          <Controller
            name="privacy"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="community-privacy">
                  Visibilité *
                </FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="community-privacy"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Choisir la visibilité" />
                  </SelectTrigger>
                  <SelectContent>
                    {privacyValues.map((privacy) => (
                      <SelectItem key={privacy} value={privacy}>
                        {privacyLabels[privacy]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </form>

      {/* Submit */}
      <Button
        type="button"
        onClick={form.handleSubmit(onSubmit)}
        disabled={form.formState.isSubmitting}
        className="w-full"
      >
        {form.formState.isSubmitting
          ? "Création en cours..."
          : "Créer la communauté"}
      </Button>
    </div>
  );
}
