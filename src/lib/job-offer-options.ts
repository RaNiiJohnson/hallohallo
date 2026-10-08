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

export const workModeValues = ["onSite", "hybrid", "remote"] as const;

export type JobType = (typeof jobTypeValues)[number];
export type ContractType = (typeof contractTypeValues)[number];
export type WorkMode = (typeof workModeValues)[number];

export const contractTypesByJobType: Record<JobType, readonly ContractType[]> = {
  auPair: ["CDD"],
  training: ["apprenticeship"],
  voluntary: ["FSJ/FOJ/BFD"],
  internship: ["CDD"],
  miniJob: ["partTime"],
  job: ["CDI", "CDD", "fullTime", "partTime"],
  freelance: ["freelance"],
  scholarship: ["CDD"],
};

export function contractTypesForJobType(jobType: JobType) {
  return contractTypesByJobType[jobType];
}

export function isContractTypeAllowedForJobType(
  jobType: JobType,
  contractType: ContractType,
) {
  return contractTypesForJobType(jobType).includes(contractType);
}

export function requiresDurationOrStartDate(
  jobType: JobType,
  contractType: ContractType,
) {
  return (
    jobType === "internship" ||
    jobType === "training" ||
    contractType === "CDD" ||
    contractType === "freelance"
  );
}

export function requiresWeeklyHours(jobType: JobType, contractType: ContractType) {
  return jobType === "miniJob" || contractType === "CDI" || contractType === "partTime";
}
