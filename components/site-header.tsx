"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { canonicalMeta } from "@/lib/canonical";
import { formatRefreshShort } from "@/lib/format";
import { useData } from "./providers";

const NAV = [
  { href: "/", label: "Overview" },
  { href: "/projects", label: "Projects" },
  { href: "/exceptions", label: "Exception Monitor" },
  { href: "/methodology", label: "Methodology" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { meta } = useData();
  const proven = canonicalMeta(meta);

  return (
    <header className="border-b border-rule bg-paper-3">
      <div className="page-wrap py-4">
        <div>
          <Link href="/" className="block">
            <h1 className="font-serif text-[1.7rem] leading-tight text-navy md:text-[2rem]">
              New York FEMA Public Assistance Recovery Monitor
            </h1>
          </Link>
          <p className="mt-1 text-sm text-ink">
            New York State portfolio · NYC-related analytical view
          </p>
          <p className="mt-0.5 text-xs text-ink-soft">
            OpenFEMA · Snapshot updated {formatRefreshShort(proven.retrievedAt)}
          </p>
        </div>
        <nav
          className="mt-3 flex flex-wrap gap-1 border-t border-rule pt-3"
          aria-label="Primary"
        >
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded px-3 py-1.5 text-sm ${
                  active
                    ? "bg-navy text-paper-3"
                    : "text-navy hover:bg-navy-pale"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
