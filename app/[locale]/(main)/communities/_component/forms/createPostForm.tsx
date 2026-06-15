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
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface CreatePostFormProps {
  communityId: Id<"communities">;
  onSuccess?: () => void;
}

export function CreatePostForm({
  communityId,
  onSuccess,
}: CreatePostFormProps) {
  const createPost = useMutation(api.posts.mutations.createPost);
  const t = useTranslations("communities.forms.createPost");

  const formSchema = z.object({
    title: z.string().min(3, t("errorTitleMin")).max(100, t("errorTitleMax")),
    content: z.string().min(10, t("errorContentMin")),
  });

  type FormSchema = z.infer<typeof formSchema>;

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const onSubmit = async (data: FormSchema) => {
    try {
      const result = await createPost({
        title: data.title,
        content: data.content,
        communityId,
      });

      if (typeof result === "object" && result !== null && "retryAfter" in result) {
        const seconds = Math.ceil(result.retryAfter / 1000);
        toast.error(t("errorRateLimit", { seconds }));
        return;
      }

      toast.success(t("successToast"));
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error(t("errorToast"));
    }
  };

  return (
    <div className="space-y-6">
      <form
        id="create-post-form"
        onSubmit={form.handleSubmit(onSubmit)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
            e.preventDefault();
          }
        }}
      >
        <FieldGroup className="space-y-4">
          {/* Titre */}
          <Controller
            name="title"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="post-title">{t("titleLabel")}</FieldLabel>
                <Input
                  {...field}
                  id="post-title"
                  aria-invalid={fieldState.invalid}
                  placeholder={t("titlePlaceholder")}
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Contenu */}
          <Controller
            name="content"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="post-content">
                  {t("contentLabel")}
                </FieldLabel>
                <InputGroup>
                  <InputGroupTextarea
                    {...field}
                    id="post-content"
                    placeholder={t("contentPlaceholder")}
                    rows={5}
                    className="min-h-32 resize-none"
                    aria-invalid={fieldState.invalid}
                  />
                  <InputGroupAddon align="block-end">
                    <InputGroupText className="tabular-nums">
                      {field.value.length} {t("characters")}
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </form>

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
