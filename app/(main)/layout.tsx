import Footer from "@/components/footer";
import { Header } from "@/components/header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto w-full min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
