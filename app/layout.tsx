import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";
import { DataProvider, FilterProvider } from "@/components/providers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CANONICAL_SUMMARY } from "@/lib/canonical";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "New York FEMA Public Assistance Recovery Monitor",
  description:
    "An independent analytical prototype exploring FEMA Public Assistance grant portfolio monitoring for New York State, with an NYC-related analytical view, using OpenFEMA data.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${ibmPlexSans.variable} font-sans`}>
        <DataProvider initialSummary={CANONICAL_SUMMARY}>
          <FilterProvider>
            <div className="flex min-h-screen flex-col">
              <SiteHeader />
              <main className="page-wrap flex-1 py-6">{children}</main>
              <SiteFooter />
            </div>
          </FilterProvider>
        </DataProvider>
      </body>
    </html>
  );
}
