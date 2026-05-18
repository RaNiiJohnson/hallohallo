"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { useTranslations } from "next-intl";

export function SignupForm() {
  const router = useRouter();
  const t = useTranslations("auth.register.form");
  const tToast = useTranslations("auth.register.toast");

  const SignupFormSchema = z
    .object({
      name: z.string().min(2, {
        message: t("nameError"),
      }),
      email: z.email({
        message: t("emailError"),
      }),
      password: z.string().min(8, {
        message: t("passwordError"),
      }),
      passwordConfirmation: z
        .string()
        .min(1, { message: t("confirmPasswordError") }),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: t("passwordMismatch"),
      path: ["passwordConfirmation"],
    });

  const form = useForm<z.infer<typeof SignupFormSchema>>({
    resolver: zodResolver(SignupFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });
  const {
    formState: { isSubmitting },
  } = form;

  async function onSubmit(values: z.infer<typeof SignupFormSchema>) {
    await authClient.signUp.email({
      email: values.email,
      password: values.password,
      name: values.name,
      fetchOptions: {
        onSuccess: () => {
          toast.success(tToast("success"));
          router.push("/");
        },
        onError: (error) => {
          toast.error(error.error.message);
        },
      },
    });
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
                <FormLabel>{t("name")}</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder={t("namePlaceholder")}
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
                <FormLabel>{t("email")}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t("emailPlaceholder")}
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("password")}</FormLabel>
                <FormControl>
                  <PasswordInput
                    autoComplete="new-password"
                    placeholder={t("passwordPlaceholder")}
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
                <FormLabel>{t("confirmPassword")}</FormLabel>
                <FormControl>
                  <PasswordInput
                    autoComplete="new-password"
                    placeholder={t("confirmPasswordPlaceholder")}
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
                {t("submitting")}
              </>
            ) : (
              t("submit")
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
