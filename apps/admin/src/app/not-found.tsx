import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <h2 className="text-3xl font-display font-bold text-white">404 - Page Not Found</h2>
      <p className="text-slate-400 text-sm">
        The requested administrative resource could not be found.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-hover transition-colors"
      >
        Return to Admin Dashboard
      </Link>
    </div>
  );
}
