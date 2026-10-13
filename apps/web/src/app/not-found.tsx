import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <h2 className="text-3xl font-display font-bold text-text-primary">404 - Page Not Found</h2>
      <p className="text-text-secondary text-sm">
        The requested page does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-hover transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
}
