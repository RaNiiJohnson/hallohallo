import { Wallet } from "lucide-react";

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
  salary: string | null | undefined;
  className?: string;
  showIcon?: boolean;
}

export function SalaryDisplay({
  salary,
  className = "",
  showIcon = true,
}: SalaryDisplayProps) {
  const parsed = parseSalary(salary);

  if (parsed.isNegotiable) {
    return (
      <span className={`text-muted-foreground italic ${className}`}>
        À négocier
      </span>
    );
  }

  if (!parsed.amount) {
    return null;
  }

  return (
    <span className={`font-medium  ${className}`}>
      <Wallet className={showIcon ? "h-4 w-4 mr-1 inline" : "hidden"} />
      <span className="font-semibold">{parsed.amount}€ </span>
      {parsed.period && (
        <span className="text-muted-foreground text-xs font-normal">
          /{parsed.period}
        </span>
      )}
    </span>
  );
}
