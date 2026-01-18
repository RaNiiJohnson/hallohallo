export interface ParsedPrice {
  amount: string;
  period: string;
  raw: string;
}

export function parsePrice(value: string | null | undefined): ParsedPrice {
  if (!value || typeof value !== "string") {
    return { amount: "", period: "", raw: "" };
  }

  // Extract number from string
  const amountMatch = value.match(/(\d+(?:\.\d+)?)/);
  const amount = amountMatch ? amountMatch[1] : "";

  // Determine period
  let period = "";
  if (value.includes("/mois") || value.includes("mois")) {
    period = "mois";
  } else if (value.includes("/semaine") || value.includes("semaine")) {
    period = "semaine";
  } else if (value.includes("/jour") || value.includes("jour")) {
    period = "jour";
  }

  return { amount, period, raw: value };
}

interface PriceDisplayProps {
  price: string | null | undefined;
  className?: string;
}

export function PriceDisplay({ price, className = "" }: PriceDisplayProps) {
  const parsed = parsePrice(price);

  if (!parsed.amount) {
    return null;
  }

  return (
    <span className={`font-medium ${className}`}>
      <span className="font-semibold">{parsed.amount}€</span>
      {parsed.period && (
        <span className="text-muted-foreground text-xs font-normal">
          /{parsed.period}
        </span>
      )}
    </span>
  );
}
