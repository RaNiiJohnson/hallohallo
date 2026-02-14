"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
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
import { api } from "@convex/_generated/api";
import { LocationPicker } from "@/lib/LocationPicker";
import { useFileUpload } from "@/hooks/use-file-upload";

const listingTypeValues = [
  "room",
  "apartment",
  "house",
  "studio",
  "shared",
] as const;

const listingModeValues = ["rent", "sale"] as const;

const listingTypeLabels: Record<(typeof listingTypeValues)[number], string> = {
  room: "Chambre",
  apartment: "Appartement",
  house: "Maison",
  studio: "Studio",
  shared: "Colocation",
};

const listingModeLabels: Record<(typeof listingModeValues)[number], string> = {
  rent: "À louer",
  sale: "À vendre",
};

const formSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  propertyType: z.enum(listingTypeValues),
  listingMode: z.enum(listingModeValues),
  location: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
  city: z.string().min(1, "La ville est requise"),
  price: z.string().min(1, "Le prix est requis"),
  charges: z.string().optional(),
  deposit: z.string().optional(),
  area: z.string().min(1, "La surface est requise"),
  bathrooms: z.string().min(1, "Le nombre de salles de bain est requis"),
  bedrooms: z.string().min(1, "Le nombre de chambres est requis"),
  floor: z.string().min(1, "L'étage est requis"),
  pets: z.boolean(),
  description: z
    .string()
    .min(10, "La description doit contenir au moins 10 caractères"),
  extras: z.array(z.string()).optional(),
  availableFrom: z.string().optional(),
});

interface ListingFormProps {
  onSuccess?: () => void;
}

export function ListingForm({ onSuccess }: ListingFormProps) {
  const createListing = useMutation(api.listings.createListing);
  const [currentStep, setCurrentStep] = useState(1);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [extraInput, setExtraInput] = useState("");

  // Image upload hook
  const maxSizeMB = 5;
  const maxSize = maxSizeMB * 1024 * 1024;
  const maxFiles = 6;

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
      description: "",
      extras: [],
      availableFrom: "",
    },
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const stepTitles = [
    "Type du bien",
    "Localisation",
    "Informations principales",
    "Conditions",
    "Contenu & médias",
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
        fieldsToValidate = ["description"];
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
    try {
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
        // images: handled via Cloudinary separately
      });

      toast.success("Annonce publiée avec succès !");
      form.reset();
      setCurrentStep(1);
      onSuccess?.();
    } catch {
      toast.error("Erreur lors de la publication de l'annonce");
    }
  }

  const extras = form.watch("extras") ?? [];

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Étape {currentStep} sur {totalSteps}
          </span>
          <span>{Math.round(progress)}% complété</span>
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
                  Titre de l&apos;annonce *
                </FieldLabel>
                <Input
                  {...field}
                  id="listing-title"
                  aria-invalid={fieldState.invalid}
                  placeholder="Ex: Appartement 3 pièces lumineux, centre-ville"
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
                <FieldLabel htmlFor="propertyType">Type de bien *</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="propertyType"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Sélectionnez le type de bien" />
                  </SelectTrigger>
                  <SelectContent>
                    {listingTypeValues.map((type) => (
                      <SelectItem key={type} value={type}>
                        {listingTypeLabels[type]}
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
                  Mode d&apos;annonce *
                </FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="listingMode"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Location ou vente" />
                  </SelectTrigger>
                  <SelectContent>
                    {listingModeValues.map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {listingModeLabels[mode]}
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
                <FieldLabel htmlFor="city">Ville / Localité *</FieldLabel>
                <Input
                  {...field}
                  id="city"
                  aria-invalid={fieldState.invalid}
                  placeholder="Ex: Königstein im Taunus, Hesse"
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
                <FieldLabel>Position sur la carte (optionnel)</FieldLabel>
                <FieldDescription>
                  Cliquez sur la carte pour indiquer la position exacte du bien.
                  La ville sera mise à jour automatiquement.
                </FieldDescription>
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
                <FieldLabel htmlFor="price">Prix *</FieldLabel>
                <InputGroup>
                  <Input
                    {...field}
                    id="price"
                    type="number"
                    min="0"
                    aria-invalid={fieldState.invalid}
                    placeholder="Ex: 850"
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
                <FieldLabel htmlFor="area">Surface *</FieldLabel>
                <InputGroup>
                  <Input
                    {...field}
                    id="area"
                    type="number"
                    min="0"
                    aria-invalid={fieldState.invalid}
                    placeholder="Ex: 65"
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
                  <FieldLabel htmlFor="bedrooms">Chambres *</FieldLabel>
                  <Input
                    {...field}
                    id="bedrooms"
                    type="number"
                    min="0"
                    aria-invalid={fieldState.invalid}
                    placeholder="Ex: 3"
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
                  <FieldLabel htmlFor="bathrooms">Sdb *</FieldLabel>
                  <Input
                    {...field}
                    id="bathrooms"
                    type="number"
                    min="0"
                    aria-invalid={fieldState.invalid}
                    placeholder="Ex: 1"
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
                  <FieldLabel htmlFor="floor">Étage *</FieldLabel>
                  <Input
                    {...field}
                    id="floor"
                    type="number"
                    min="0"
                    aria-invalid={fieldState.invalid}
                    placeholder="Ex: 2"
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
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="deposit"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="deposit">Caution</FieldLabel>
                  <InputGroup>
                    <Input
                      {...field}
                      id="deposit"
                      type="number"
                      min="0"
                      aria-invalid={fieldState.invalid}
                      placeholder="Ex: 1700"
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
                  <FieldLabel htmlFor="charges">Charges</FieldLabel>
                  <InputGroup>
                    <Input
                      {...field}
                      id="charges"
                      type="number"
                      min="0"
                      aria-invalid={fieldState.invalid}
                      placeholder="Ex: 150"
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
                    Animaux de compagnie autorisés
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
                    Disponible à partir du
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
                          : "Sélectionner une date"}
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
                  Description *
                </FieldLabel>
                <InputGroup>
                  <InputGroupTextarea
                    {...field}
                    id="listing-description"
                    placeholder="Décrivez le bien : état général, équipements, luminosité, proximité transports et commerces…"
                    rows={6}
                    className="min-h-32 resize-none"
                    aria-invalid={fieldState.invalid}
                  />
                  <InputGroupAddon align="block-end">
                    <InputGroupText className="tabular-nums">
                      {field.value.length} caractères
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                <FieldDescription>
                  Une bonne description augmente vos chances de trouver un
                  locataire rapidement
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Image Upload */}
          <Field>
            <FieldLabel>Photos du bien</FieldLabel>
            <FieldDescription>
              Ajoutez jusqu&apos;à {maxFiles} photos (max. {maxSizeMB}MB
              chacune)
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
                aria-label="Télécharger des images"
                className="sr-only"
              />
              {files.length > 0 ? (
                <div className="flex w-full flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate font-medium text-sm">
                      Photos ajoutées ({files.length})
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
                      Ajouter
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
                          aria-label="Supprimer l'image"
                          className="-top-2 -right-2 absolute size-6 rounded-full border-2 border-background shadow-none focus-visible:border-background"
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
                    Glissez vos photos ici
                  </p>
                  <p className="text-muted-foreground text-xs">
                    PNG, JPG ou WebP (max. {maxSizeMB}MB)
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
                    Sélectionner des images
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
            <FieldLabel>Extras / Équipements</FieldLabel>
            <FieldDescription>
              Ajoutez les équipements et atouts du bien (ex: Parking, Balcon,
              Cave, Ascenseur…)
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
                placeholder="Ex: Parking, Balcon, Cave…"
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
                      aria-label={`Supprimer ${extra}`}
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
          Précédent
        </Button>

        {currentStep < totalSteps ? (
          <Button
            type="button"
            onClick={nextStep}
            className="flex items-center gap-2"
          >
            Suivant
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
              ? "Publication..."
              : "Publier l'annonce"}
          </Button>
        )}
      </Field>
    </div>
  );
}
