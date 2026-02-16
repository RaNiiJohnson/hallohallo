export interface ParsedSalary {
  amount: string;
  period: string;
  isNegotiable: boolean;
  raw: string;
}

export function parseSalary(value: string | null | undefined): ParsedSalary {
  if (!value || typeof value !== "string") {
    return { amount: "", period: "", isNegotiable: false, raw: "" };
  }

  // Check for "À négocier" or similar
  if (value.toLowerCase().includes("négocier")) {
    return { amount: "", period: "", isNegotiable: true, raw: value };
  }

  // Extract number from string
  const amountMatch = value.match(/(\d+(?:\.\d+)?)/);
  const amount = amountMatch ? amountMatch[1] : "";

  // Determine period
  let period = "";
  if (value.includes("/mois") || value.includes("mois")) {
    period = "mois";
  } else if (value.includes("/an") || value.includes("annuel")) {
    period = "an";
  } else if (value.includes("/heure") || value.includes("heure")) {
    period = "heure";
  }

  return { amount, period, isNegotiable: false, raw: value };
}

interface SalaryDisplayProps {
  salary: string | number;
  className?: string;
}

export function SalaryDisplay({ salary, className }: SalaryDisplayProps) {
  const parsed = parseSalary(typeof salary === "string" ? salary : null);

  if (parsed.isNegotiable) {
    return (
      <span className={`text-muted-foreground italic ${className}`}>
        À négocier
      </span>
    );
  }

  if (typeof salary === "number") {
    return (
      <span className={`font-medium ${className}`}>
        <span className="font-semibold">
          {salary.toLocaleString()}
          <span className="text-primary ml-0.5">€</span>
        </span>
      </span>
    );
  }
}
