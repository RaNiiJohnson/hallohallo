"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";

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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, XIcon } from "lucide-react";
import { toast } from "sonner";
import { JobOfferDetails } from "@/lib/convexTypes";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";

const jobTypes = [
  "Au pair",
  "Formation",
  "Volontariat",
  "Stage",
  "Mini-job",
  "Emploi",
  "Freelance",
  "Bourse d'étude",
];

const contractTypes = [
  "CDI",
  "CDD",
  "FSJ/FOJ/BFD",
  "Temps plein",
  "Temps partiel",
  "Freelance",
  "Apprentissage",
];

const formSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  type: z.string().min(1, "Le type d'offre est requis"),
  contractType: z.string().min(1, "Le type de contrat est requis"),
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
    .min(0)
    .max(5, "Vous pouvez ajouter jusqu'à 5 certificats."),
  salary: z.string().min(1, "Le salaire est requis"),
});

interface EditJobOfferFormProps {
  jobOffer: JobOfferDetails;
  onSuccess?: () => void;
}

export function EditJobOfferForm({
  jobOffer,
  onSuccess,
}: EditJobOfferFormProps) {
  const uptdateJob = useMutation(api.jobs.updateJob);
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: jobOffer?.title,
      type: jobOffer?.type,
      contractType: jobOffer?.contractType,
      city: jobOffer?.city,
      duration: jobOffer?.duration,
      startDate: jobOffer?.startDate,
      company: jobOffer?.company,
      description: jobOffer?.description,
      certificates:
        jobOffer?.certificates && jobOffer?.certificates?.length > 0
          ? jobOffer?.certificates.map((cert) => ({ certificate: cert }))
          : [{ certificate: "" }],
      salary: jobOffer?.salary,
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
    let fieldsToValidate: (keyof z.infer<typeof formSchema>)[] = [];

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

  function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      uptdateJob({
        id: jobOffer._id,
        title: data.title,
        type: data.type,
        contractType: data.contractType,
        city: data.city,
        duration: data.duration,
        startDate: data.startDate,
        company: data.company,
        description: data.description,
        certificates:
          data.certificates
            ?.map((cert) => cert.certificate)
            .filter((cert) => cert.trim() !== "") || [],
        salary: data.salary,
      });
      toast.success("Offre mise à jour avec succès");
      onSuccess?.();
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  }

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
        id="edit-job-offer-form"
        onSubmit={form.handleSubmit(onSubmit)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
            e.preventDefault();
          }
        }}
      >
        {/* Step 1 - Same as creation form */}
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
                    {jobTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
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
                    {contractTypes.map((contract) => (
                      <SelectItem key={contract} value={contract}>
                        {contract}
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
                <FieldLabel htmlFor="job-city">Ville *</FieldLabel>
                <Input
                  {...field}
                  id="job-city"
                  aria-invalid={fieldState.invalid}
                  placeholder="Berlin, Munich, Hamburg..."
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="startDate"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="job-start-date">
                  Date de début *
                </FieldLabel>
                <Input
                  {...field}
                  id="job-start-date"
                  type="date"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="salary"
            control={form.control}
            render={({ field, fieldState }) => {
              const parseExistingSalary = (
                value: string | null | undefined,
              ) => {
                if (!value || typeof value !== "string") {
                  return { amount: "", period: "" };
                }

                if (value.toLowerCase().includes("négocier")) {
                  return { amount: "", period: "negotiable" };
                }

                const amountMatch = value.match(/(\d+(?:\.\d+)?)/);
                const amount = amountMatch ? amountMatch[1] : "";

                let period = "";
                if (value.includes("/mois") || value.includes("mois")) {
                  period = "month";
                } else if (value.includes("/an") || value.includes("annuel")) {
                  period = "year";
                } else if (
                  value.includes("/heure") ||
                  value.includes("heure")
                ) {
                  period = "hour";
                }

                return { amount, period };
              };

              const { amount, period } = parseExistingSalary(field.value);

              const updateSalary = (newAmount: string, newPeriod: string) => {
                if (newPeriod === "negotiable") {
                  field.onChange("À négocier");
                } else if (newAmount && newPeriod) {
                  const periodText =
                    {
                      month: "/mois",
                      year: "/an",
                      hour: "/heure",
                    }[newPeriod] || "";
                  field.onChange(`${newAmount}€${periodText}`);
                } else if (newAmount && !newPeriod) {
                  field.onChange(`${newAmount}€`);
                } else {
                  field.onChange("");
                }
              };

              return (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="job-salary">Salaire *</FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      id="job-salary"
                      type="number"
                      value={period === "negotiable" ? "" : amount}
                      onChange={(e) => {
                        const newAmount = e.target.value;
                        updateSalary(newAmount, period);
                      }}
                      aria-invalid={fieldState.invalid}
                      placeholder={
                        period === "negotiable"
                          ? "Salaire à négocier"
                          : "Montant"
                      }
                      autoComplete="off"
                      disabled={period === "negotiable"}
                      className="flex-1"
                    />
                    <Select
                      value={period || ""}
                      onValueChange={(newPeriod) => {
                        if (newPeriod === "negotiable") {
                          updateSalary("", newPeriod);
                        } else {
                          updateSalary(amount, newPeriod);
                        }
                      }}
                    >
                      <SelectTrigger
                        className="w-[180px]"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="Période" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="month">€/mois</SelectItem>
                        <SelectItem value="year">€/an</SelectItem>
                        <SelectItem value="hour">€/heure</SelectItem>
                        <SelectItem value="negotiable">À négocier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <FieldDescription>
                    {period === "negotiable"
                      ? "Le salaire sera à négocier avec le candidat"
                      : "Entrez le montant et sélectionnez la période"}
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              );
            }}
          />

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

        <Button
          type="button"
          onClick={form.handleSubmit(onSubmit)}
          disabled={form.formState.isSubmitting}
          className="flex items-center gap-2"
        >
          {form.formState.isSubmitting
            ? "Mise à jour..."
            : "Mettre à jour l'offre"}
        </Button>

        {currentStep < totalSteps && (
          <Button
            type="button"
            onClick={nextStep}
            className="flex items-center gap-2"
          >
            Suivant
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </Field>
    </div>
  );
}
