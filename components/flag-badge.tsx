import type { ProjectFlag } from "@/lib/types";

export function FlagBadge({ flag }: { flag: ProjectFlag }) {
  return (
    <span className="flag-chip" title={flag.reason}>
      {flag.label}
    </span>
  );
}

export function FlagStack({ flags }: { flags: ProjectFlag[] }) {
  if (!flags.length) {
    return <span className="text-xs text-ink-faint">No flag</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {flags.map((flag) => (
        <FlagBadge key={flag.code} flag={flag} />
      ))}
    </div>
  );
}
