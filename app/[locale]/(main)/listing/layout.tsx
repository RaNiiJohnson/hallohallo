import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Immobilier - Hallo Hallo",
  description: "Trouvez votre logement ou partagez le vôtre avec la communauté",
};
export default function ListingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
