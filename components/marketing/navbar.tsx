import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
            P
          </div>
          <span className="text-lg font-semibold text-slate-900">PactAnchor</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="#product" className="text-sm text-slate-600 hover:text-slate-900">
            Product
          </Link>
          <Link href="#features" className="text-sm text-slate-600 hover:text-slate-900">
            Features
          </Link>
          <Link href="#pricing" className="text-sm text-slate-600 hover:text-slate-900">
            Pricing
          </Link>
          <Link href="#templates" className="text-sm text-slate-600 hover:text-slate-900">
            Templates
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            Start Free
          </Link>
        </div>
      </div>
    </header>
  );
}