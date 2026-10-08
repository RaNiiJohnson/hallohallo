"use client";

import { MarkdownHint } from "@/components/markdown-hint";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
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
import { JobOfferDetails } from "@/lib/convexTypes";
import { api } from "@convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { ChevronLeft, ChevronRight, XIcon } from "lucide-react";
import { toast } from "sonner";

import { LocationPicker } from "@/lib/LocationPicker";
import { runMutationWorkflow } from "@/lib/mutation-workflow";
import {
  contractTypesForJobType,
  contractTypeValues,
  jobTypeValues,
  requiresDurationOrStartDate,
  requiresWeeklyHours,
  workModeValues,
} from "@/lib/job-offer-options";

const salaryPeriodValues = ["hour", "month", "year"] as const;

interface EditJobOfferFormProps {
  jobOffer: JobOfferDetails;
  onSuccess?: () => void;
}

export function EditJobOfferForm({
  jobOffer,
  onSuccess,
}: EditJobOfferFormProps) {
  const t = useTranslations("jobs");
  const updateJob = useMutation(api.jobs.mutations.updateJob);
  const contact = useQuery(api.jobs.queries.getJobContactForEdit, {
    id: jobOffer._id,
  });
  const [currentStep, setCurrentStep] = useState(1);

  const formSchema = z.object({
    title: z.string().min(1, t("form.validation.titleReq")),
    type: z.enum(jobTypeValues),
    location: z
      .object({
        lat: z.number(),
        lng: z.number(),
      })
      .optional(),
    contractType: z.enum(contractTypeValues),
    city: z.string(),
    workMode: z.enum(workModeValues),
    remoteLocation: z.string().optional(),
    duration: z.string().optional(),
    startDate: z.string().optional(),
    applicationDeadline: z.string().optional(),
    company: z.string().min(1, t("form.validation.companyReq")),
    description: z.string().min(10, t("form.validation.descMin")),
    certificates: z
      .array(
        z.object({
          certificate: z.string(),
        }),
      )
      .min(0)
      .max(5, t("form.validation.certMax")),
    salary: z.string().optional(),
    salaryPeriod: z.enum(salaryPeriodValues).optional(),
    sector: z.string().optional(),
    benefits: z.string().optional(),
    externalApplicationUrl: z.string().url().optional().or(z.literal("")),
    weeklyHours: z.string().optional(),
    trainingRequirements: z.string().optional(),
    contactEmail: z.string().email(t("form.validation.contactEmailReq")),
  }).superRefine((data, ctx) => {
    if (data.workMode !== "remote" && !data.city.trim()) {
      ctx.addIssue({ code: "custom", path: ["city"], message: t("form.validation.cityReq") });
    }
    if (requiresDurationOrStartDate(data.type, data.contractType)) {
      if (!data.duration?.trim()) ctx.addIssue({ code: "custom", path: ["duration"], message: t("form.validation.durationReq") });
      if (!data.startDate?.trim()) ctx.addIssue({ code: "custom", path: ["startDate"], message: t("form.validation.startDateReq") });
    }
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: jobOffer?.title,
      type: jobOffer?.type as (typeof jobTypeValues)[number],
      location: jobOffer?.location,
      contractType:
        jobOffer?.contractType as (typeof contractTypeValues)[number],
      city: jobOffer?.city,
      workMode: jobOffer?.workMode ?? "onSite",
      remoteLocation: jobOffer?.remoteLocation ?? "",
      duration: jobOffer?.duration,
      startDate: jobOffer?.startDate,
      applicationDeadline: jobOffer?.applicationDeadline ?? "",
      company: jobOffer?.company,
      description: jobOffer?.description,
      certificates:
        jobOffer?.certificates && jobOffer?.certificates?.length > 0
          ? jobOffer?.certificates.map((cert) => ({ certificate: cert }))
          : [{ certificate: "" }],
      salary: jobOffer?.salary?.toString() ?? "",
      salaryPeriod: jobOffer?.salaryPeriod,
      sector: jobOffer?.sector ?? "",
      benefits: jobOffer?.benefits ?? "",
      externalApplicationUrl: jobOffer?.externalApplicationUrl ?? "",
      weeklyHours: jobOffer?.weeklyHours?.toString() ?? "",
      trainingRequirements: jobOffer?.trainingRequirements ?? "",
      contactEmail: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "certificates",
  });
  const selectedJobType = useWatch({ control: form.control, name: "type" });
  const selectedContractType = useWatch({ control: form.control, name: "contractType" });
  const selectedWorkMode = useWatch({ control: form.control, name: "workMode" });
  const availableContractTypes = contractTypesForJobType(selectedJobType);
  const contractIsFixed = availableContractTypes.length === 1;
  const showDurationAndStart = requiresDurationOrStartDate(selectedJobType, selectedContractType);
  const showWeeklyHours = requiresWeeklyHours(selectedJobType, selectedContractType);

  useEffect(() => {
    if (contact) form.setValue("contactEmail", contact.email);
  }, [contact, form]);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const stepTitles = [
    t("form.steps.basicInfo"),
    t("form.steps.jobDetails"),
    t("form.steps.description"),
    t("form.steps.extraCriteria"),
  ];

  const nextStep = async () => {
    let fieldsToValidate: (keyof z.infer<typeof formSchema>)[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = ["title", "company", "type"];
        break;
      case 2:
        fieldsToValidate = [
          "contractType", "city", "workMode",
        ];
        break;
      case 3:
        fieldsToValidate = ["description"];
        break;
      case 4:
        fieldsToValidate = ["contactEmail"];
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

  async function onSubmit(data: z.infer<typeof formSchema>) {
    await runMutationWorkflow({
      mutation: () =>
        updateJob({
          id: jobOffer._id,
          title: data.title,
          type: data.type,
          location: data.location,
          contractType: data.contractType,
          city: data.city,
          workMode: data.workMode,
          remoteLocation: data.remoteLocation || undefined,
          duration: data.duration || undefined,
          startDate: data.startDate || undefined,
          applicationDeadline: data.applicationDeadline || undefined,
          company: data.company,
          description: data.description,
          certificates:
            data.certificates
              ?.map((cert) => cert.certificate)
              .filter((cert) => cert.trim() !== "") || [],
          salary: data.salary ? Number(data.salary) : undefined,
          salaryPeriod: data.salaryPeriod,
          sector: data.sector || undefined,
          benefits: data.benefits || undefined,
          externalApplicationUrl: data.externalApplicationUrl || undefined,
          weeklyHours: data.weeklyHours ? Number(data.weeklyHours) : undefined,
          trainingRequirements: data.trainingRequirements || undefined,
          contactEmail: data.contactEmail,
        }),
      onSuccess: () => {
        toast.success(t("form.messages.success"));
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(t("form.messages.error"), {
          description: error instanceof Error ? error.message : undefined,
        });
      },
    });
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
                  {t("form.labels.title")}
                </FieldLabel>
                <Input
                  {...field}
                  id="job-title"
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
            name="company"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="job-company">
                  {t("form.labels.company")}
                </FieldLabel>
                <Input
                  {...field}
                  id="job-company"
                  aria-invalid={fieldState.invalid}
                  placeholder={t("form.placeholders.company")}
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
                <FieldLabel htmlFor="job-type">
                  {t("form.labels.jobType")}
                </FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    const jobType = value as (typeof jobTypeValues)[number];
                    field.onChange(jobType);
                    const contractTypes = contractTypesForJobType(jobType);
                    if (!contractTypes.includes(form.getValues("contractType"))) {
                      form.setValue("contractType", contractTypes[0], {
                        shouldValidate: true,
                      });
                    }
                  }}
                >
                  <SelectTrigger
                    id="job-type"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue
                      placeholder={t("form.placeholders.selectType")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTypeValues.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(
                          `labels.jobTypes.${type}` as Parameters<typeof t>[0],
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
                  {t("form.labels.contractType")}
                </FieldLabel>
                {contractIsFixed ? (
                  <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm">
                    {t(`labels.contracts.${field.value}` as Parameters<typeof t>[0])}
                  </div>
                ) : (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="job-contract" aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder={t("form.placeholders.selectContract")} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableContractTypes.map((contract) => (
                        <SelectItem key={contract} value={contract}>
                          {t(`labels.contracts.${contract}` as Parameters<typeof t>[0])}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="workMode"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="job-work-mode">{t("form.labels.workMode")}</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="job-work-mode" aria-invalid={fieldState.invalid}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {workModeValues.map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {t(`labels.workModes.${mode}` as Parameters<typeof t>[0])}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="city"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="job-city">
                  {t(selectedWorkMode === "remote" ? "form.labels.cityOptional" : "form.labels.city")}
                </FieldLabel>
                <Input
                  {...field}
                  id="job-city"
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

          {selectedWorkMode === "remote" && (
            <Controller
              name="remoteLocation"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="job-remote-location">{t("form.labels.remoteLocation")}</FieldLabel>
                  <Input {...field} id="job-remote-location" placeholder={t("form.placeholders.remoteLocation")} autoComplete="off" />
                </Field>
              )}
            />
          )}

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

          {showDurationAndStart && <Controller
            name="startDate"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="job-start-date">
                  {t("form.labels.startDate")}
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
          />}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
            <Controller
              name="salary"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="job-salary">
                    {t("form.labels.salary")}
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id="job-salary"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      aria-invalid={fieldState.invalid}
                      placeholder={t("form.placeholders.amount")}
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
              name="salaryPeriod"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="salary-period">
                    {t("form.labels.period")}
                  </FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="salary-period"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue
                        placeholder={t("form.placeholders.period")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">
                        €/{t("labels.salaryPeriods.month")}
                      </SelectItem>
                      <SelectItem value="year">
                        €/{t("labels.salaryPeriods.year")}
                      </SelectItem>
                      <SelectItem value="hour">
                        €/{t("labels.salaryPeriods.hour")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          {showDurationAndStart && <Controller
            name="duration"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="job-duration">
                  {t("form.labels.duration")}
                </FieldLabel>
                <Input
                  {...field}
                  id="job-duration"
                  aria-invalid={fieldState.invalid}
                  placeholder={t("form.placeholders.duration")}
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />}
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
                <FieldLabel htmlFor="job-description">
                  {t("form.labels.description")}
                </FieldLabel>
                <InputGroup>
                  <InputGroupTextarea
                    {...field}
                    id="job-description"
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
          <Controller name="sector" control={form.control} render={({ field }) => (
            <Field><FieldLabel htmlFor="job-sector">{t("form.labels.sector")}</FieldLabel><Input {...field} id="job-sector" /></Field>
          )} />
          {(selectedJobType === "internship" || selectedJobType === "training") && (
            <Controller name="trainingRequirements" control={form.control} render={({ field }) => (
              <Field><FieldLabel htmlFor="job-training-requirements">{t("form.labels.trainingRequirements")}</FieldLabel><Input {...field} id="job-training-requirements" /></Field>
            )} />
          )}
          {showWeeklyHours && (
            <Controller name="weeklyHours" control={form.control} render={({ field }) => (
              <Field><FieldLabel htmlFor="job-weekly-hours">{t("form.labels.weeklyHours")}</FieldLabel><Input {...field} id="job-weekly-hours" type="number" min="0" /></Field>
            )} />
          )}
          <Controller name="applicationDeadline" control={form.control} render={({ field }) => (
            <Field><FieldLabel htmlFor="job-deadline">{t("form.labels.applicationDeadline")}</FieldLabel><Input {...field} id="job-deadline" type="date" /></Field>
          )} />
          <Controller name="benefits" control={form.control} render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="job-benefits">{t("form.labels.benefits")}</FieldLabel>
              <InputGroup><InputGroupTextarea {...field} id="job-benefits" rows={3} className="min-h-24 resize-y" /></InputGroup>
            </Field>
          )} />
          <Controller name="externalApplicationUrl" control={form.control} render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}><FieldLabel htmlFor="job-external-application">{t("form.labels.externalApplicationUrl")}</FieldLabel><Input {...field} id="job-external-application" type="url" />{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>
          )} />
        </FieldGroup>

        {/* Step 4 */}
        <FieldSet className={`gap-4 ${currentStep !== 4 ? "hidden" : ""}`}>
          <Controller
            name="contactEmail"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="job-contact-email">{t("form.labels.contactEmail")}</FieldLabel>
                <Input {...field} id="job-contact-email" type="email" placeholder={t("form.placeholders.contactEmail")} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <FieldLegend variant="label">
            {t("form.labels.certificates")}
          </FieldLegend>
          <FieldDescription>{t("form.labels.certDesc")}</FieldDescription>
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
                          placeholder={t("form.placeholders.cert")}
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
              {t("form.actions.addCert")}
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
          {t("form.actions.prev")}
        </Button>

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

        {currentStep < totalSteps && (
          <Button
            type="button"
            onClick={nextStep}
            className="flex items-center gap-2"
          >
            {t("form.actions.next")}
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </Field>
    </div>
  );
}
