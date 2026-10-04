"use client";

import { useLocale } from "next-intl";

interface PriceDisplayProps {
  price: number | undefined;
  listingMode?: "rent" | "sale";
  className?: string;
}

export function PriceDisplay({
  price,
  listingMode,
  className = "",
}: PriceDisplayProps) {
  const locale = useLocale();

  if (price === undefined || price === null) {
    return null;
  }

  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
  }).format(price);

  return (
    <span className={`font-medium ${className}`}>
      <span className="font-semibold">
        {formatted}
        {"\u00a0"}€
      </span>
      {listingMode === "rent" && (
        <span className="text-muted-foreground text-xs font-normal">/mois</span>
      )}
    </span>
  );
}
