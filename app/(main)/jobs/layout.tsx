import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Emplois - Hallo Hallo",
  description: "Trouvez l'opportunité idéale pour votre projet de vie.",
};
export default function JobsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
