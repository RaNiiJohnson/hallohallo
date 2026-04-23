"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm, FieldPath } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
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
import { ChevronLeft, ChevronRight, XIcon, CalendarIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { LocationPicker } from "@/lib/LocationPicker";

export const jobTypeValues = [
  "auPair",
  "training",
  "voluntary",
  "internship",
  "miniJob",
  "job",
  "freelance",
  "scholarship",
] as const;

export const contractTypeValues = [
  "CDI",
  "CDD",
  "FSJ/FOJ/BFD",
  "fullTime",
  "partTime",
  "freelance",
  "apprenticeship",
] as const;

export const jobTypeLabels: Record<(typeof jobTypeValues)[number], string> = {
  auPair: "Au pair",
  training: "Formation",
  voluntary: "Volontariat",
  internship: "Stage",
  miniJob: "Mini-job",
  job: "Emploi",
  freelance: "Freelance",
  scholarship: "Bourse d'étude",
};

export const contractTypeLabels: Record<
  (typeof contractTypeValues)[number],
  string
> = {
  CDI: "CDI",
  CDD: "CDD",
  "FSJ/FOJ/BFD": "FSJ/FOJ/BFD",
  fullTime: "Temps plein",
  partTime: "Temps partiel",
  freelance: "Freelance",
  apprenticeship: "Apprentissage",
};

const salaryPeriodValues = ["hour", "month", "year"] as const;

export const salaryPeriodLabels: Record<
  (typeof salaryPeriodValues)[number],
  string
> = {
  hour: "heure",
  month: "mois",
  year: "année",
};

const formSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  type: z.enum(jobTypeValues),
  location: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
  contractType: z.enum(contractTypeValues),
  city: z.string().min(1, "La ville est requise"),
  duration: z.string().min(1, "La durée est requise"),
  startDate: z.string().min(1, "La date de début est requise"),
  company: z.string().min(1, "L'entreprise est requise"),
  description: z
    .string()
    .min(10, "La description doit contenir au moins 10 caractères"),
  certificates: z
    .array(
      z.object({
        certificate: z.string(),
      }),
    )
    .min(1, "Ajoutez au moins un certificat.")
    .max(5, "Vous pouvez ajouter jusqu'à 5 certificats."),
  salary: z.string().min(1, "Le salaire est requis"),
  salaryPeriod: z.enum(salaryPeriodValues),
});

type FormSchema = z.infer<typeof formSchema>;

interface JobOfferFormProps {
  onSuccess?: () => void;
}

export function JobOfferForm({ onSuccess }: JobOfferFormProps) {
  const createJob = useMutation(api.jobs.createJob);
  const [currentStep, setCurrentStep] = useState(1);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: "auPair",
      contractType: "CDI",
      city: "",
      duration: "",
      startDate: "",
      company: "",
      description: "",
      certificates: [],
      salary: "",
      salaryPeriod: "month",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "certificates",
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const stepTitles = [
    "Informations de base",
    "Détails du poste",
    "Description et contact",
    "Critères supplémentaires",
  ];

  const nextStep = async () => {
    let fieldsToValidate: FieldPath<FormSchema>[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = ["title", "company", "type"];
        break;
      case 2:
        fieldsToValidate = [
          "contractType",
          "city",
          "startDate",
          "salary",
          "salaryPeriod",
          "duration",
        ];
        break;
      case 3:
        fieldsToValidate = ["description"];
        break;
      case 4:
        fieldsToValidate = ["certificates"];
        break;
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: FormSchema) => {
    try {
      await createJob({
        title: data.title,
        type: data.type,
        location: data.location,
        contractType: data.contractType,
        city: data.city,
        duration: data.duration,
        startDate: data.startDate,
        company: data.company,
        description: data.description,
        certificates:
          data.certificates
            ?.map((cert: { certificate: string }) => cert.certificate)
            .filter((cert: string) => cert.trim() !== "") || [],
        salary: Number(data.salary),
        salaryPeriod: data.salaryPeriod,
      });
      toast.success("Offre créée avec succès");
      form.reset();
      onSuccess?.();
    } catch {
      toast.success("Erreur lors de la création de l'offre");
    }
  };

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
        id="job-offer-form"
        onSubmit={form.handleSubmit(onSubmit)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
            e.preventDefault();
          }
        }}
      >
        {/* Step 1 */}
        <FieldGroup
          className={`space-y-4 ${currentStep !== 1 ? "hidden" : ""}`}
        >
          <Controller
            name="title"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="job-title">
                  Titre de l&apos;offre *
                </FieldLabel>
                <Input
                  {...field}
                  id="job-title"
                  aria-invalid={fieldState.invalid}
                  placeholder="Ex: Développeur Frontend React"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="company"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="job-company">Entreprise *</FieldLabel>
                <Input
                  {...field}
                  id="job-company"
                  aria-invalid={fieldState.invalid}
                  placeholder="Nom de l'entreprise"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="type"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="job-type">Type d&apos;offre *</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="job-type"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Sélectionnez le type" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTypeValues.map((type) => (
                      <SelectItem key={type} value={type}>
                        {jobTypeLabels[type]}
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

        {/* Step 2 */}
        <FieldGroup
          className={`space-y-4 ${currentStep !== 2 ? "hidden" : ""}`}
        >
          <Controller
            name="contractType"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="job-contract">
                  Type de contrat *
                </FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="job-contract"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Sélectionnez le contrat" />
                  </SelectTrigger>
                  <SelectContent>
                    {contractTypeValues.map((contract) => (
                      <SelectItem key={contract} value={contract}>
                        {contractTypeLabels[contract]}
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
                <FieldLabel htmlFor="job-city">Ville / Localité *</FieldLabel>
                <Input
                  {...field}
                  id="job-city"
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
                  Cliquez sur la carte pour indiquer la position exacte du
                  poste. La ville sera mise à jour automatiquement.
                </FieldDescription>
                <LocationPicker
                  value={field.value}
                  onChange={field.onChange}
                  onCityChange={(city) => form.setValue("city", city)}
                />
              </Field>
            )}
          />
          <Controller
            name="startDate"
            control={form.control}
            render={({ field, fieldState }) => {
              // Parse the string date to Date object for calendar
              const selectedDate = field.value
                ? new Date(field.value)
                : undefined;

              return (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="job-start-date">
                    Date de début *
                  </FieldLabel>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="job-start-date"
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
                            // Store as ISO string for the form
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

          <div className="flex gap-4">
            <Controller
              name="salary"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="flex-1" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="job-salary">Salaire *</FieldLabel>
                  <Input
                    {...field}
                    id="job-salary"
                    type="number"
                    min="0"
                    aria-invalid={fieldState.invalid}
                    placeholder="Montant"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="salaryPeriod"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="w-[180px]" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="salary-period">Période *</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="salary-period"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Période" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">€/mois</SelectItem>
                      <SelectItem value="year">€/an</SelectItem>
                      <SelectItem value="hour">€/heure</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <Controller
            name="duration"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="job-duration">Durée *</FieldLabel>
                <Input
                  {...field}
                  id="job-duration"
                  aria-invalid={fieldState.invalid}
                  placeholder="Ex: 6 mois, 2 ans, Indéterminée"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        {/* Step 3 */}
        <FieldGroup
          className={`space-y-4 ${currentStep !== 3 ? "hidden" : ""}`}
        >
          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="job-description">Description *</FieldLabel>
                <InputGroup>
                  <InputGroupTextarea
                    {...field}
                    id="job-description"
                    placeholder="Décrivez le poste, les missions, les compétences requises..."
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
                  Décrivez le poste, les missions et les compétences requises
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        {/* Step 4 */}
        <FieldSet className={`gap-4 ${currentStep !== 4 ? "hidden" : ""}`}>
          <FieldLegend variant="label">Certificats requis</FieldLegend>
          <FieldDescription>
            Ajoutez jusqu&apos;à 5 certificats requis pour ce poste (optionnel).
          </FieldDescription>
          <FieldGroup className="gap-4">
            {fields.map((field, index) => (
              <Controller
                key={field.id}
                name={`certificates.${index}.certificate`}
                control={form.control}
                render={({ field: controllerField, fieldState }) => (
                  <Field
                    orientation="horizontal"
                    data-invalid={fieldState.invalid}
                  >
                    <FieldContent>
                      <InputGroup>
                        <InputGroupInput
                          {...controllerField}
                          id={`certificate-${index}`}
                          aria-invalid={fieldState.invalid}
                          placeholder="Ex: Permis B, Allemand B2..."
                          type="text"
                          autoComplete="off"
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupButton
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => remove(index)}
                            aria-label={`Supprimer certificat ${index + 1}`}
                          >
                            <XIcon />
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </FieldContent>
                  </Field>
                )}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ certificate: "" })}
              disabled={fields.length >= 5}
            >
              Ajouter un certificat
            </Button>
          </FieldGroup>
          {form.formState.errors.certificates?.root && (
            <FieldError errors={[form.formState.errors.certificates.root]} />
          )}
        </FieldSet>
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
            {form.formState.isSubmitting ? "Publication..." : "Publier l'offre"}
          </Button>
        )}
      </Field>
    </div>
  );
}
