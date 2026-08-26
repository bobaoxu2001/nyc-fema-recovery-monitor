export function LoadingState({ label }: { label: string }) {
  return (
    <div className="panel px-5 py-10 text-center text-ink-soft">
      <p className="kicker">Loading</p>
      <p className="mt-2 font-serif text-xl text-navy">{label}</p>
      <p className="mx-auto mt-2 max-w-md text-sm">
        The dashboard reads a processed OpenFEMA snapshot. Filters run in the
        browser after that file loads.
      </p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="panel px-5 py-10 text-center">
      <p className="kicker text-terracotta">Snapshot not available</p>
      <p className="mt-2 font-serif text-xl text-navy">
        The processed OpenFEMA file could not be loaded.
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">{message}</p>
      <p className="mx-auto mt-3 max-w-md text-sm text-ink-soft">
        From the project folder, run <code>python3 scripts/fetch_fema_data.py</code>{" "}
        and restart the app.
      </p>
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded border border-dashed border-rule bg-paper px-4 py-8 text-center">
      <p className="font-medium text-navy">{title}</p>
      <p className="mt-1 text-sm text-ink-soft">{body}</p>
    </div>
  );
}
