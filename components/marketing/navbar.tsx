import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import { BRAND_NAME } from "@/lib/constants";

const navItems = ["Product", "Features", "Pricing", "Templates"];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-10">
          <a href="#" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
              P
            </div>
            <span className="text-base font-semibold text-slate-950">
              {BRAND_NAME}
            </span>
          </a>

          <nav className="hidden items-center gap-7 md:flex">
            {navItems.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
              >
                {item}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/dashboard"
            className="hidden text-sm font-medium text-slate-600 transition hover:text-slate-950 sm:inline-flex"
          >
            Log In
          </a>
          <Button href="/dashboard" variant="primary" className="px-4 py-2.5">
            Start Free
          </Button>
        </div>
      </Container>
    </header>
  );
}