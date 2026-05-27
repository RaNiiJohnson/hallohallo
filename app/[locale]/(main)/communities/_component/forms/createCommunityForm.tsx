"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const privacyValues = ["public", "private", "secret"] as const;

interface CreateCommunityFormProps {
  onSuccess?: () => void;
}

export function CreateCommunityForm({ onSuccess }: CreateCommunityFormProps) {
  const router = useRouter();
  const createCommunity = useMutation(api.communities.mutations.createCommunty);
  const t = useTranslations("communities.forms.createCommunity");

  const formSchema = z.object({
    name: z.string().min(3, t("errorNameMin")).max(60, t("errorNameMax")),
    description: z
      .string()
      .min(10, t("errorDescMin"))
      .max(200, t("errorDescMax")),
    privacy: z.enum(privacyValues),
  });

  type FormSchema = z.infer<typeof formSchema>;

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
      const { slug } = await createCommunity({
        name: data.name,
        description: data.description,
        privacy: data.privacy,
      });
      toast.success(t("successToast"));
      form.reset();
      onSuccess?.();
      router.push(`/communities/${slug}`);
    } catch {
      toast.error(t("errorToast"));
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
                  {t("nameLabel")}
                </FieldLabel>
                <Input
                  {...field}
                  id="community-name"
                  aria-invalid={fieldState.invalid}
                  placeholder={t("namePlaceholder")}
                  autoComplete="off"
                />
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
                  {t("descLabel")}
                </FieldLabel>
                <InputGroup>
                  <InputGroupTextarea
                    {...field}
                    id="community-description"
                    placeholder={t("descPlaceholder")}
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
                  {t("privacyLabel")}
                </FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="community-privacy"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder={t("privacyPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {privacyValues.map((privacy) => (
                      <SelectItem key={privacy} value={privacy}>
                        {t(
                          `privacy${privacy.charAt(0).toUpperCase() + privacy.slice(1)}` as const,
                        )}
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
        {form.formState.isSubmitting ? t("submiting") : t("submit")}
      </Button>
    </div>
  );
}
