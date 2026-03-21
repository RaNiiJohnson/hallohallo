import { ChatWidget } from "@/components/ChatWidget";
import Footer from "@/components/footer";
import { Header } from "@/components/header";
import { NotificationWidget } from "@/components/notificationBell";
import { WidgetProvider } from "@/components/WidgetContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="mx-auto w-full min-h-screen">{children}</main>
      <Footer />
      <WidgetProvider>
        <ChatWidget />
        <NotificationWidget />
      </WidgetProvider>
    </>
  );
}
