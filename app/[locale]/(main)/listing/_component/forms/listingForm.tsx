"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import * as z from "zod";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useMutation } from "convex/react";
import {
  AlertCircleIcon,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  PlusIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import { MarkdownHint } from "@/components/markdown-hint";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useTypedR2Upload } from "@/hooks/use-r2-typed-upload";
import type { ListingListDetails } from "@/lib/convexTypes";
import { LocationPicker } from "@/lib/LocationPicker";
import { api } from "@convex/_generated/api";
import imageCompression from "browser-image-compression";

export const listingTypeValues = [
  "room",
  "apartment",
  "house",
  "studio",
  "shared",
] as const;

export const listingModeValues = ["rent", "sale"] as const;

const missingImagePreview =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23e5e7eb'/%3E%3C/svg%3E";

function formatLocalCalendarDate(timestamp: number) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseLocalCalendarDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

interface ListingFormProps {
  listing?: ListingListDetails;
  onSuccess?: () => void;
}

export function ListingForm({ listing, onSuccess }: ListingFormProps) {
  const t = useTranslations("listing");

  const { upload: uploadListingImages } = useTypedR2Upload(
    api.integrations.r2.generateListingUploadUrl,
    api.integrations.r2.syncMetadata,
    { accept: "image/*" },
  );

  const createListing = useMutation(api.listings.mutations.createListing);
  const updateListing = useMutation(api.listings.mutations.updateListing);
  const isEditing = listing !== undefined;

  const formSchema = z
    .object({
    title: z.string().min(1, t("form.validation.titleReq")),
    propertyType: z.enum(listingTypeValues),
    listingMode: z.enum(listingModeValues),
    location: z
      .object({
        lat: z.number(),
        lng: z.number(),
      })
      .optional(),
    city: z.string().min(1, t("form.validation.cityReq")),
    neighborhood: z.string().trim().max(80).optional(),
    price: z.string().min(1, t("form.validation.priceReq")),
    charges: z.string().optional(),
    deposit: z.string().optional(),
    area: z.string().min(1, t("form.validation.areaReq")),
    bathrooms: z.string().min(1, t("form.validation.bathroomsReq")),
    bedrooms: z.string().min(1, t("form.validation.bedroomsReq")),
    floor: z.string().min(1, t("form.validation.floorReq")),
    pets: z.boolean(),
    images: z.array(
      z.object({
        storageId: z.string().optional(),
        url: z.string().optional(),
        publicId: z.string().optional(),
        secureUrl: z.string().optional(),
      }),
    ),
    description: z.string().min(10, t("form.validation.descMin")),
    extras: z.array(z.string()).optional(),
    availableFrom: z.string().min(1, t("form.validation.availableFromReq")),
    contactEmail: z
      .string()
      .trim()
      .email(t("form.validation.emailInvalid"))
      .or(z.literal("")),
    contactPhone: z
      .string()
      .trim()
      .regex(/^\+?[0-9 ()-]{6,30}$/, t("form.validation.phoneInvalid"))
      .or(z.literal("")),
    })
    .superRefine((values, ctx) => {
      if (!values.contactEmail && !values.contactPhone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("form.validation.contactReq"),
          path: ["contactEmail"],
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("form.validation.contactReq"),
          path: ["contactPhone"],
        });
      }
    });

  const [currentStep, setCurrentStep] = useState(1);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [extraInput, setExtraInput] = useState("");

  // Image upload hook
  const maxSizeMB = 20;
  const maxSize = maxSizeMB * 1024 * 1024;
  const maxFiles = 10;

  const initialImageEntries = useMemo(
    () =>
      (listing?.images ?? []).map((image, index) => {
        const url = image.url || image.secureUrl || missingImagePreview;
        const id = `existing-image-${index}`;
        return {
          id,
          image,
          file: {
            id,
            name: `${t("form.labels.existingPhoto")} ${index + 1}`,
            size: 0,
            type: "image/jpeg",
            url,
          },
        };
      }),
    [listing, t],
  );

  const existingImagesByFileId = useMemo(
    () => new Map(initialImageEntries.map(({ id, image }) => [id, image])),
    [initialImageEntries],
  );

  const [
    { files, isDragging, errors: uploadErrors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      clearFiles,
      getInputProps,
    },
  ] = useFileUpload({
    accept: "image/png,image/jpeg,image/jpg,image/webp",
    initialFiles: initialImageEntries.map(({ file }) => file),
    maxFiles,
    maxSize,
    multiple: true,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: listing?.title ?? "",
      propertyType: listing?.propertyType ?? "apartment",
      listingMode: listing?.listingMode ?? "rent",
      location: listing?.location,
      city: listing?.city ?? "",
      neighborhood: listing?.neighborhood ?? "",
      price: listing ? String(listing.price) : "",
      charges: listing?.charges !== undefined ? String(listing.charges) : "",
      deposit: listing?.deposit !== undefined ? String(listing.deposit) : "",
      area: listing ? String(listing.area) : "",
      bathrooms: listing ? String(listing.bathrooms) : "",
      bedrooms: listing ? String(listing.bedrooms) : "",
      floor: listing ? String(listing.floor) : "",
      pets: listing?.pets ?? false,
      images: listing?.images ?? [],
      description: listing?.description ?? "",
      extras: listing?.extras ?? [],
      availableFrom: listing?.availableFrom
        ? formatLocalCalendarDate(listing.availableFrom)
        : "",
      contactEmail: listing?.contact?.email ?? "",
      contactPhone: listing?.contact?.phone ?? "",
    },
  });

  const listingMode = useWatch({ control: form.control, name: "listingMode" });
  const extras = useWatch({ control: form.control, name: "extras" }) ?? [];
  const preview = useWatch({ control: form.control });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const stepTitles = [
    t("form.steps.typeAndLocation"),
    t("form.steps.mainInfo"),
    t("form.steps.priceAndAvailability"),
    t("form.steps.media"),
  ];

  const nextStep = async () => {
    let fieldsToValidate: (keyof z.infer<typeof formSchema>)[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = ["title", "propertyType", "listingMode", "city"];
        break;
      case 2:
        fieldsToValidate = ["area", "bedrooms", "bathrooms", "floor"];
        break;
      case 3:
        fieldsToValidate = [
          "price",
          "availableFrom",
          "contactEmail",
          "contactPhone",
        ];
        break;
      case 4:
        fieldsToValidate = ["description", "images"];
        break;
    }

    const isValid =
      fieldsToValidate.length === 0 || (await form.trigger(fieldsToValidate));
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addExtra = () => {
    const trimmed = extraInput.trim();
    if (!trimmed) return;
    const current = form.getValues("extras") ?? [];
    if (current.includes(trimmed)) return;
    form.setValue("extras", [...current, trimmed]);
    setExtraInput("");
  };

  const removeExtra = (index: number) => {
    const current = form.getValues("extras") ?? [];
    form.setValue(
      "extras",
      current.filter((_, i) => i !== index),
    );
  };

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const requiresImage = !isEditing || (listing?.images.length ?? 0) > 0;
    if (requiresImage && files.length === 0) {
      toast.error(t("form.messages.imagesRequired"));
      return;
    }

    try {
      const uploadPromises = files.map(async (file) => {
        if (file.file instanceof File) {
          const compressedFile = await imageCompression(file.file, {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          });

          const storageId = await uploadListingImages(compressedFile);
          if (!storageId) {
            throw new Error("Erreur lors de l'upload de l'image");
          }

          return { storageId };
        }

        const existingImage = existingImagesByFileId.get(file.id);
        if (!existingImage) {
          throw new Error("Existing image metadata not found");
        }

        // Never persist a temporary signed R2 URL. R2 images are identified by
        // their stable storageId; legacy Cloudinary images keep their metadata.
        if (existingImage.storageId) {
          return { storageId: existingImage.storageId };
        }

        return {
          publicId: existingImage.publicId,
          secureUrl: existingImage.secureUrl || existingImage.url,
        };
      });

      const images = await Promise.all(uploadPromises);
      const isRental = data.listingMode === "rent";
      const values = {
        title: data.title,
        propertyType: data.propertyType,
        listingMode: data.listingMode,
        city: data.city,
        neighborhood: data.neighborhood || undefined,
        price: Number(data.price),
        area: Number(data.area),
        bedrooms: Number(data.bedrooms),
        bathrooms: Number(data.bathrooms),
        floor: Number(data.floor),
        pets: data.pets,
        description: data.description,
        extras: data.extras ?? [],
        images,
      };
      const contact = {
        email: data.contactEmail.trim() || undefined,
        phone: data.contactPhone.trim() || undefined,
      };

      if (listing) {
        await updateListing({
          listingId: listing._id,
          contact,
          patch: {
            ...values,
            location: data.location ?? null,
            charges: isRental && data.charges ? Number(data.charges) : null,
            deposit: isRental && data.deposit ? Number(data.deposit) : null,
            availableFrom: data.availableFrom
              ? parseLocalCalendarDate(data.availableFrom).getTime()
              : null,
          },
        });
      } else {
        await createListing({
          ...values,
          contact,
          location: data.location,
          charges: isRental && data.charges ? Number(data.charges) : undefined,
          deposit: isRental && data.deposit ? Number(data.deposit) : undefined,
          availableFrom: data.availableFrom
            ? parseLocalCalendarDate(data.availableFrom).getTime()
            : undefined,
        });
      }

      toast.success(
        t(isEditing ? "form.messages.updateSuccess" : "form.messages.success"),
      );
      form.reset();
      clearFiles();
      setCurrentStep(1);
      onSuccess?.();
    } catch {
      toast.error(
        t(isEditing ? "form.messages.updateError" : "form.messages.error"),
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            {t("form.progress.step", {
              current: currentStep,
              total: totalSteps,
            })}
          </span>
          <span>
            {t("form.progress.completed", { progress: Math.round(progress) })}
          </span>
        </div>
        <Progress value={progress} className="w-full" />
        <h3 className="text-lg font-medium">{stepTitles[currentStep - 1]}</h3>
      </div>

      <form
        id="listing-form"
        onSubmit={form.handleSubmit(onSubmit)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
            e.preventDefault();
          }
        }}
      >
        {/* ─── Step 1: Type du bien ─── */}
        <FieldGroup
          className={`space-y-4 ${currentStep !== 1 ? "hidden" : ""}`}
        >
          <Controller
            name="title"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="listing-title">
                  {t("form.labels.title")}
                </FieldLabel>
                <Input
                  {...field}
                  id="listing-title"
                  aria-invalid={fieldState.invalid}
                  placeholder={t("form.placeholders.title")}
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="propertyType"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="propertyType">
                  {t("form.labels.propertyType")}
                </FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="propertyType"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue
                      placeholder={t("form.placeholders.selectType")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {listingTypeValues.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(
                          `labels.listingTypes.${type}` as Parameters<
                            typeof t
                          >[0],
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

          <Controller
            name="listingMode"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="listingMode">
                  {t("form.labels.listingMode")}
                </FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    const nextMode = value as (typeof listingModeValues)[number];
                    field.onChange(nextMode);
                    if (nextMode === "sale") {
                      form.setValue("deposit", "", { shouldDirty: true });
                    }
                  }}
                >
                  <SelectTrigger
                    id="listingMode"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue
                      placeholder={t("form.placeholders.selectMode")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {listingModeValues.map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {t(
                          `labels.listingModes.${mode}` as Parameters<
                            typeof t
                          >[0],
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
          <Controller
            name="city"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="city">{t("form.labels.city")}</FieldLabel>
                <Input
                  {...field}
                  id="city"
                  aria-invalid={fieldState.invalid}
                  placeholder={t("form.placeholders.city")}
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="neighborhood"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="neighborhood">{t("form.labels.neighborhood")}</FieldLabel>
                <Input {...field} id="neighborhood" placeholder={t("form.placeholders.neighborhood")} autoComplete="off" />
              </Field>
            )}
          />
          <Controller
            name="location"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("form.labels.mapPosition")}</FieldLabel>
                <FieldDescription>{t("form.labels.mapDesc")}</FieldDescription>
                <LocationPicker
                  value={field.value}
                  onChange={field.onChange}
                  onCityChange={(city) => form.setValue("city", city)}
                  privacyMode
                />
              </Field>
            )}
          />
        </FieldGroup>

        {/* ─── Step 2: Informations sur le bien ─── */}
        <FieldGroup
          className={`space-y-4 ${currentStep !== 2 ? "hidden" : ""}`}
        >
          <Controller
            name="area"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="area">{t("form.labels.area")}</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    id="area"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.1"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  <InputGroupAddon align="inline-end" variant="boxed">
                    <InputGroupText>m²</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Controller
              name="bedrooms"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="bedrooms">
                    {t("form.labels.bedrooms")}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="bedrooms"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="bathrooms"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="bathrooms">
                    {t("form.labels.bathrooms")}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="bathrooms"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="floor"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="floor">
                    {t("form.labels.floor")}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="floor"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
        </FieldGroup>

        {/* ─── Step 3: Prix, disponibilité et contact ─── */}
        <FieldSet className={`space-y-4 ${currentStep !== 3 ? "hidden" : ""}`}>
          <Controller
            name="price"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="price">
                  {listingMode === "sale"
                    ? t("form.labels.priceSale")
                    : t("form.labels.priceRent")}
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    id="price"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  <InputGroupAddon align="inline-end" variant="boxed">
                    <InputGroupText>€</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          {listingMode === "rent" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller
                name="deposit"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="deposit">
                      {t("form.labels.deposit")}
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id="deposit"
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                      />
                      <InputGroupAddon align="inline-end" variant="boxed">
                        <InputGroupText>€</InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="charges"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="charges">
                      {t("form.labels.charges")}
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id="charges"
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                      />
                      <InputGroupAddon align="inline-end" variant="boxed">
                        <InputGroupText>€/mois</InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          )}

          <Controller
            name="pets"
            control={form.control}
            render={({ field }) => (
              <Field orientation="horizontal">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="pets"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <FieldLabel htmlFor="pets" className="cursor-pointer">
                    {t("form.labels.pets")}
                  </FieldLabel>
                </div>
              </Field>
            )}
          />

          <Controller
            name="availableFrom"
            control={form.control}
            render={({ field, fieldState }) => {
                const selectedDate = field.value
                  ? parseLocalCalendarDate(field.value)
                  : undefined;

                return (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="availableFrom">
                      {t("form.labels.availableFrom")}
                    </FieldLabel>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          id="availableFrom"
                          className="w-full justify-between font-normal"
                          aria-invalid={fieldState.invalid}
                        >
                          {selectedDate
                            ? selectedDate.toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })
                            : t("form.placeholders.selectDate")}
                          <CalendarIcon className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto overflow-hidden p-0"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          captionLayout="dropdown"
                          onSelect={(date) => {
                            if (date) {
                              field.onChange(
                                formatLocalCalendarDate(date.getTime()),
                              );
                            }
                            setCalendarOpen(false);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                );
            }}
          />

          <Field>
            <FieldLabel>{t("form.labels.contactMethods")}</FieldLabel>
            <FieldDescription>{t("form.labels.contactMethodsHint")}</FieldDescription>
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="contactPhone"
              control={form.control}
              render={({ field, fieldState }) => {
                const isChoiceError =
                  fieldState.error?.message === t("form.validation.contactReq");

                return (
                <Field data-invalid={fieldState.invalid && !isChoiceError}>
                  <FieldLabel htmlFor="contactPhone">{t("form.labels.contactPhone")}</FieldLabel>
                  <Input {...field} id="contactPhone" type="tel" autoComplete="tel" placeholder={t("form.placeholders.contactPhone")} aria-invalid={fieldState.invalid && !isChoiceError} />
                  {fieldState.invalid && !isChoiceError && <FieldError errors={[fieldState.error]} />}
                </Field>
                );
              }}
            />
            <Controller
              name="contactEmail"
              control={form.control}
              render={({ field, fieldState }) => {
                const isChoiceError =
                  fieldState.error?.message === t("form.validation.contactReq");

                return (
                <Field data-invalid={fieldState.invalid && !isChoiceError}>
                  <FieldLabel htmlFor="contactEmail">
                    {t("form.labels.contactEmail")}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="contactEmail"
                    type="email"
                    autoComplete="email"
                    placeholder={t("form.placeholders.contactEmail")}
                    aria-invalid={fieldState.invalid && !isChoiceError}
                  />
                  {fieldState.invalid && !isChoiceError && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
                );
              }}
            />
          </div>
          <FieldError
            errors={[
              form.formState.errors.contactPhone,
              form.formState.errors.contactEmail,
            ].filter((error) => error?.message === t("form.validation.contactReq"))}
          />
        </FieldSet>

        {/* ─── Step 4: Contenu & médias ─── */}
        <FieldGroup
          className={`space-y-4 ${currentStep !== 4 ? "hidden" : ""}`}
        >
          {/* Description */}
          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="listing-description">
                  {t("form.labels.description")}
                </FieldLabel>
                <InputGroup>
                  <InputGroupTextarea
                    {...field}
                    id="listing-description"
                    placeholder={t("form.placeholders.description")}
                    rows={6}
                    className="min-h-32 resize-none"
                    aria-invalid={fieldState.invalid}
                  />
                  <InputGroupAddon align="block-end">
                    <InputGroupText className="tabular-nums">
                      {field.value.length} {t("form.messages.chars")}
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                <FieldDescription>{t("form.labels.descHint")}</FieldDescription>
                <MarkdownHint label={t("form.labels.markdownHint")} />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Image Upload */}
          <Field>
            <FieldLabel>{t("form.labels.photos")}</FieldLabel>
            <FieldDescription>
              {t("form.labels.photosDesc", { maxFiles, maxSize: maxSizeMB })}
            </FieldDescription>
            <div
              className="relative flex min-h-52 flex-col items-center not-data-files:justify-center overflow-hidden rounded-xl border border-input border-dashed p-4 transition-colors has-[input:focus]:border-ring has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50"
              data-dragging={isDragging || undefined}
              data-files={files.length > 0 || undefined}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                {...getInputProps()}
                aria-label={t("form.aria.uploadImages")}
                className="sr-only"
              />
              {files.length > 0 ? (
                <div className="flex w-full flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate font-medium text-sm">
                      {t("form.labels.photosAdded", { count: files.length })}
                    </h3>
                    <Button
                      type="button"
                      disabled={files.length >= maxFiles}
                      onClick={openFileDialog}
                      size="sm"
                      variant="outline"
                    >
                      <UploadIcon
                        aria-hidden="true"
                        className="-ms-0.5 size-3.5 opacity-60"
                      />
                      {t("form.actions.addPhoto")}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {files.map((file) => (
                      <div
                        className="relative aspect-square rounded-md bg-accent overflow-hidden"
                        key={file.id}
                      >
                        <Image
                          alt={file.file.name}
                          className="size-full object-cover"
                          src={file.preview || ""}
                          width={300}
                          height={300}
                          unoptimized
                        />
                        <Button
                          type="button"
                          aria-label={t("form.aria.removeImage", {
                            name: file.file.name,
                          })}
                          className="absolute right-2 top-2 z-10 size-7 rounded-full border border-border bg-background/90 text-foreground shadow-sm backdrop-blur-sm hover:bg-background"
                          onClick={() => removeFile(file.id)}
                          size="icon"
                          variant="secondary"
                        >
                          <XIcon className="size-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
                  <div
                    aria-hidden="true"
                    className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border bg-background"
                  >
                    <ImageIcon className="size-4 opacity-60" />
                  </div>
                  <p className="mb-1.5 font-medium text-sm">
                    {t("form.placeholders.photosDrop")}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {t("form.labels.photosDesc", {
                      maxFiles,
                      maxSize: maxSizeMB,
                    })}
                  </p>
                  <Button
                    type="button"
                    className="mt-4"
                    onClick={openFileDialog}
                    variant="outline"
                  >
                    <UploadIcon
                      aria-hidden="true"
                      className="-ms-1 opacity-60"
                    />
                    {t("form.actions.addPhoto")}
                  </Button>
                </div>
              )}
            </div>

            {uploadErrors.length > 0 && (
              <div
                className="flex items-center gap-1 text-destructive text-xs"
                role="alert"
              >
                <AlertCircleIcon className="size-3 shrink-0" />
                <span>{uploadErrors[0]}</span>
              </div>
            )}
          </Field>

          {/* Extras */}
          <Field>
            <FieldLabel>{t("form.labels_extra.extras")}</FieldLabel>
            <FieldDescription>
              {t("form.labels_extra.extrasDesc")}
            </FieldDescription>
            <div className="flex gap-2">
              <Input
                value={extraInput}
                onChange={(e) => setExtraInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addExtra();
                  }
                }}
                placeholder={t("form.placeholders.extras")}
                autoComplete="off"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={addExtra}
                disabled={!extraInput.trim()}
              >
                <PlusIcon className="size-4" />
              </Button>
            </div>
            {extras.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {extras.map((extra, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-sm"
                  >
                    {extra}
                    <button
                      type="button"
                      onClick={() => removeExtra(index)}
                      className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                      aria-label={t("form.actions.removeExtra", { extra })}
                    >
                      <XIcon className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </Field>
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
            <h4 className="font-semibold">{t("form.preview.title")}</h4>
            <p className="text-sm text-muted-foreground">
              {t("form.preview.hint")}
            </p>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{preview.title || t("form.preview.untitled")}</p>
              <p>{[preview.city, preview.neighborhood].filter(Boolean).join(" · ")}</p>
              <p>
                {preview.price || "—"} € · {preview.area || "—"} m² · {preview.bedrooms || "—"} {t("form.preview.rooms")}
              </p>
              <p className="line-clamp-3">{preview.description || t("form.preview.noDescription")}</p>
              <p className="text-muted-foreground">
                {preview.contactEmail && t("form.preview.email")}
                {preview.contactEmail && preview.contactPhone && " · "}
                {preview.contactPhone && t("form.preview.whatsapp")}
              </p>
            </div>
          </div>
        </FieldGroup>
      </form>

      {/* Navigation Buttons */}
      <Field orientation="horizontal" className="pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          {t("form.actions.prev")}
        </Button>

        {currentStep < totalSteps ? (
          <Button
            type="button"
            onClick={nextStep}
            className="flex items-center gap-2"
          >
            {t("form.actions.next")}
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={form.handleSubmit(onSubmit)}
            disabled={form.formState.isSubmitting}
            className="flex items-center gap-2"
          >
            {form.formState.isSubmitting
              ? t(isEditing ? "form.actions.saving" : "form.actions.publishing")
              : t(isEditing ? "form.actions.save" : "form.actions.publish")}
          </Button>
        )}
      </Field>
    </div>
  );
}
