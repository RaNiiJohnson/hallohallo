"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";

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
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronLeft,
  ChevronRight,
  XIcon,
  CalendarIcon,
  ImageIcon,
  UploadIcon,
  AlertCircleIcon,
  PlusIcon,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { useCloudinaryUpload } from "@imaxis/cloudinary-convex/react";
import { fileToBase64 } from "@/lib/utils";

import { api } from "@convex/_generated/api";
import { LocationPicker } from "@/lib/LocationPicker";
import { useFileUpload } from "@/hooks/use-file-upload";
import imageCompression from "browser-image-compression";

export const listingTypeValues = [
  "room",
  "apartment",
  "house",
  "studio",
  "shared",
] as const;

export const listingModeValues = ["rent", "sale"] as const;

interface ListingFormProps {
  onSuccess?: () => void;
}

export function ListingForm({ onSuccess }: ListingFormProps) {
  const t = useTranslations("listing");
  const { upload } = useCloudinaryUpload(api.cloudinary.upload);

  const createListing = useMutation(api.listings.createListing);

  const formSchema = z.object({
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
    price: z.string().min(1, t("form.validation.priceReq")),
    charges: z.string().optional(),
    deposit: z.string().optional(),
    area: z.string().min(1, t("form.validation.areaReq")),
    bathrooms: z.string().min(1, t("form.validation.bathroomsReq")),
    bedrooms: z.string().min(1, t("form.validation.bedroomsReq")),
    floor: z.string().min(1, t("form.validation.floorReq")),
    pets: z.boolean(),
    images: z.array(z.object({ publicId: z.string(), secureUrl: z.string() })),
    description: z.string().min(10, t("form.validation.descMin")),
    extras: z.array(z.string()).optional(),
    availableFrom: z.string().optional(),
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [extraInput, setExtraInput] = useState("");

  // Image upload hook
  const maxSizeMB = 20;
  const maxSize = maxSizeMB * 1024 * 1024;
  const maxFiles = 10;

  const [
    { files, isDragging, errors: uploadErrors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept: "image/png,image/jpeg,image/jpg,image/webp",
    maxFiles,
    maxSize,
    multiple: true,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      propertyType: "apartment",
      listingMode: "rent",
      city: "",
      price: "",
      charges: "",
      deposit: "",
      area: "",
      bathrooms: "",
      bedrooms: "",
      floor: "",
      pets: false,
      images: [],
      description: "",
      extras: [],
      availableFrom: "",
    },
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const stepTitles = [
    t("form.steps.type"),
    t("form.steps.location"),
    t("form.steps.mainInfo"),
    t("form.steps.conditions"),
    t("form.steps.media"),
  ];

  const nextStep = async () => {
    let fieldsToValidate: (keyof z.infer<typeof formSchema>)[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = ["title", "propertyType", "listingMode"];
        break;
      case 2:
        fieldsToValidate = ["city"];
        break;
      case 3:
        fieldsToValidate = ["price", "area", "bedrooms", "bathrooms", "floor"];
        break;
      case 4:
        // deposit, charges, pets, availableFrom are all optional — no strict validation needed
        break;
      case 5:
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
    if (files.length === 0) return;
    try {
      const uploadPromises = files.map(async (file) => {
        if (file.file instanceof File) {
          const compressedFile = await imageCompression(file.file, {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          });
          const base64 = await fileToBase64(compressedFile);
          const res = await upload(base64, {
            folder: "real_estates",
            tags: ["listing_image"],
          });
          if (!res.publicId || !res.secureUrl) {
            throw new Error("Erreur lors de l'upload de l'image");
          }
          return { publicId: res.publicId, secureUrl: res.secureUrl };
        }

        return {
          publicId: file.file.id,
          secureUrl: file.file.url,
        };
      });

      const images = await Promise.all(uploadPromises);

      await createListing({
        title: data.title,
        propertyType: data.propertyType,
        listingMode: data.listingMode,
        location: data.location,
        city: data.city,
        price: Number(data.price),
        charges: data.charges ? Number(data.charges) : undefined,
        deposit: data.deposit ? Number(data.deposit) : undefined,
        area: Number(data.area),
        bedrooms: Number(data.bedrooms),
        bathrooms: Number(data.bathrooms),
        floor: Number(data.floor),
        pets: data.pets,
        description: data.description,
        extras: data.extras ?? [],
        availableFrom: data.availableFrom
          ? new Date(data.availableFrom).getTime()
          : undefined,
        images,
      });

      toast.success(t("form.messages.success"));
      form.reset();
      setCurrentStep(1);
      onSuccess?.();
    } catch {
      toast.error(t("form.messages.error"));
    }
  }

  const listingMode = useWatch({ control: form.control, name: "listingMode" });
  const extras = useWatch({ control: form.control, name: "extras" }) ?? [];

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
                <Select value={field.value} onValueChange={field.onChange}>
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
        </FieldGroup>

        {/* ─── Step 2: Localisation ─── */}
        <FieldGroup
          className={`space-y-4 ${currentStep !== 2 ? "hidden" : ""}`}
        >
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

          {/* Location Map Picker */}
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
                />
              </Field>
            )}
          />
        </FieldGroup>

        {/* ─── Step 3: Informations principales ─── */}
        <FieldGroup
          className={`space-y-4 ${currentStep !== 3 ? "hidden" : ""}`}
        >
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
                  <Input
                    {...field}
                    id="price"
                    type="number"
                    min="0"
                    aria-invalid={fieldState.invalid}
                    placeholder={t("form.placeholders.price")}
                    autoComplete="off"
                  />
                  <InputGroupAddon align="inline-end">
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
            name="area"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="area">{t("form.labels.area")}</FieldLabel>
                <InputGroup>
                  <Input
                    {...field}
                    id="area"
                    type="number"
                    min="0"
                    aria-invalid={fieldState.invalid}
                    placeholder={t("form.placeholders.area")}
                    autoComplete="off"
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>m²</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="grid grid-cols-3 gap-4">
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
                    min="0"
                    aria-invalid={fieldState.invalid}
                    placeholder={t("form.placeholders.bedrooms")}
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
                    min="0"
                    aria-invalid={fieldState.invalid}
                    placeholder={t("form.placeholders.bathrooms")}
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
                    min="0"
                    aria-invalid={fieldState.invalid}
                    placeholder={t("form.placeholders.floor")}
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

        {/* ─── Step 4: Conditions ─── */}
        <FieldSet className={`space-y-4 ${currentStep !== 4 ? "hidden" : ""}`}>
          {listingMode === "rent" && (
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="deposit"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="deposit">
                      {t("form.labels.deposit")}
                    </FieldLabel>
                    <InputGroup>
                      <Input
                        {...field}
                        id="deposit"
                        type="number"
                        min="0"
                        aria-invalid={fieldState.invalid}
                        placeholder={t("form.placeholders.deposit")}
                        autoComplete="off"
                      />
                      <InputGroupAddon align="inline-end">
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
                      <Input
                        {...field}
                        id="charges"
                        type="number"
                        min="0"
                        aria-invalid={fieldState.invalid}
                        placeholder={t("form.placeholders.charges")}
                        autoComplete="off"
                      />
                      <InputGroupAddon align="inline-end">
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
                ? new Date(field.value)
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
                            field.onChange(date.toISOString().split("T")[0]);
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
        </FieldSet>

        {/* ─── Step 5: Contenu & médias ─── */}
        <FieldGroup
          className={`space-y-4 ${currentStep !== 5 ? "hidden" : ""}`}
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
                          className="-top-2 -right-2 absolute size-6 z-10 rounded-full border-2 border-background shadow-none focus-visible:border-background"
                          onClick={() => removeFile(file.id)}
                          size="icon"
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
            <FieldLabel>{t("form.labels.extras")}</FieldLabel>
            <FieldDescription>{t("form.labels.extrasDesc")}</FieldDescription>
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
              ? t("form.actions.publishing")
              : t("form.actions.publish")}
          </Button>
        )}
      </Field>
    </div>
  );
}
