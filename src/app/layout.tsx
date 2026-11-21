import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { portfolio } from "@/content/portfolio";
import "@fontsource-variable/lexend-deca";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://emmanuelolivo.com"),
  title: portfolio.title,
  description: portfolio.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: portfolio.title,
    description: portfolio.description,
  },
  twitter: {
    card: "summary",
    title: portfolio.title,
    description: portfolio.description,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        {process.env.VERCEL_ENV === "production" && <><Analytics /><SpeedInsights /></>}
      </body>
    </html>
  );
}
