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
      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 lg:px-8 min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  );
}
