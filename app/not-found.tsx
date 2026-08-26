import Link from "next/link";

export default function NotFound() {
  return (
    <div className="panel px-5 py-10 text-center">
      <p className="kicker">Not found</p>
      <h2 className="mt-2 font-serif text-2xl text-navy">That page is not in this prototype</h2>
      <p className="mt-2 text-sm text-ink-soft">
        Return to the overview to continue the portfolio review.
      </p>
      <Link href="/" className="btn-secondary mt-4 inline-flex">
        Back to overview
      </Link>
    </div>
  );
}
