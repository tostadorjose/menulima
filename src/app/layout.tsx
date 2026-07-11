import type { Metadata } from "next";
import { Sora, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const fontDisplay = Sora({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-display",
});

const fontBody = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});
import { AuthProvider } from "@/context/AuthContext";
import { AuthModalProvider } from "@/context/AuthModalContext";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import AuthModal from "@/components/AuthModal";
import CartDrawer from "@/components/CartDrawer";

export const metadata: Metadata = {
  title: "menulima — El menú del día, listo para pedir",
  description:
    "Cada día un menú diferente: entrada + segundo + refresco del día. Delivery y recojo en tienda en Lima, con carta completa disponible todo el día.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://menulima.pe"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${fontDisplay.variable} ${fontBody.variable}`}>
      <body className="flex min-h-screen flex-col font-body">
        <AuthProvider>
          <AuthModalProvider>
            <CartProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
              <WhatsAppButton />
              <AuthModal />
              <CartDrawer />
            </CartProvider>
          </AuthModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
