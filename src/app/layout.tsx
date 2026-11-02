import { currentLocale, t } from "@/lib/i18n";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "../../styles/strike-first.css";
import "./globals.css";

const montserrat = localFont({
  src: "./fonts/Montserrat-Variable.ttf",
  variable: "--font-montserrat",
  weight: "100 900",
  style: "normal",
  display: "swap",
});

export const metadata: Metadata = {
  title: t("site.title"),
  description: t("site.description"),
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang={currentLocale} className={montserrat.variable}><body>{children}</body></html>;
}
