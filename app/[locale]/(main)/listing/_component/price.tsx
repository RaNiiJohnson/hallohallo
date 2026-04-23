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
  if (price === undefined || price === null) {
    return null;
  }

  const formatted = new Intl.NumberFormat("fr-FR").format(price);

  return (
    <span className={`font-medium ${className}`}>
      <span className="font-semibold">{formatted}€</span>
      {listingMode === "rent" && (
        <span className="text-muted-foreground text-xs font-normal">/mois</span>
      )}
    </span>
  );
}
