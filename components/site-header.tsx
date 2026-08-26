"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { formatRefreshedAt } from "@/lib/format";
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

  return (
    <header className="border-b border-rule bg-paper-3">
      <div className="page-wrap py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="kicker">Independent analytical prototype</p>
            <Link href="/" className="mt-2 block">
              <h1 className="font-serif text-[1.85rem] leading-tight text-navy md:text-[2.15rem]">
                NYC FEMA Public Assistance Recovery Monitor
              </h1>
            </Link>
            <p className="mt-2 max-w-2xl text-sm text-ink-soft">
              A lightweight analytical prototype for grant portfolio monitoring
              and exception review.
            </p>
          </div>
          <div className="rounded border border-rule bg-paper px-3 py-2 text-right text-xs text-ink-soft">
            <div>New York State OpenFEMA snapshot</div>
            <div className="mt-1 text-ink">
              Data last refreshed: {formatRefreshedAt(meta?.retrievedAt)}
            </div>
          </div>
        </div>
        <nav
          className="mt-5 flex flex-wrap gap-1 border-t border-rule pt-3"
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
