"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";

const formSchema = z.object({
  title: z
    .string()
    .min(3, "Le titre doit contenir au moins 3 caractères")
    .max(100, "Le titre ne peut pas dépasser 100 caractères"),
  content: z
    .string()
    .min(10, "Le contenu doit contenir au moins 10 caractères"),
});

type FormSchema = z.infer<typeof formSchema>;

interface CreatePostFormProps {
  communityId: Id<"communities">;
  onSuccess?: () => void;
}

export function CreatePostForm({
  communityId,
  onSuccess,
}: CreatePostFormProps) {
  const createPost = useMutation(api.posts.posts.createPost);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const onSubmit = async (data: FormSchema) => {
    try {
      await createPost({
        title: data.title,
        content: data.content,
        communityId,
      });
      toast.success("Post créé avec succès !");
      form.reset();
      onSuccess?.();
    } catch {
      toast.error("Erreur lors de la création du post");
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
                <FieldLabel htmlFor="post-title">Titre *</FieldLabel>
                <Input
                  {...field}
                  id="post-title"
                  aria-invalid={fieldState.invalid}
                  placeholder="Un titre accrocheur..."
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
                <FieldLabel htmlFor="post-content">Contenu *</FieldLabel>
                <InputGroup>
                  <InputGroupTextarea
                    {...field}
                    id="post-content"
                    placeholder="Exprimez-vous..."
                    rows={5}
                    className="min-h-32 resize-none"
                    aria-invalid={fieldState.invalid}
                  />
                  <InputGroupAddon align="block-end">
                    <InputGroupText className="tabular-nums">
                      {field.value.length} caractères
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
        {form.formState.isSubmitting ? "Publication..." : "Publier"}
      </Button>
    </div>
  );
}
