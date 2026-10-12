export type PublicationStatus = "active" | "closed" | "archived";

export function isAllowedPublicationTransition(
  currentStatus: PublicationStatus | undefined,
  nextStatus: PublicationStatus,
) {
  const current = currentStatus ?? "active";
  return (
    (current === "active" && nextStatus === "closed") ||
    (current === "closed" &&
      (nextStatus === "active" || nextStatus === "archived")) ||
    (current === "archived" && nextStatus === "active")
  );
}
