import Link from "next/link";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

export default function Button({
  children,
  href = "#",
  variant = "primary",
  className,
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold leading-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-300";

  const variants = {
    primary:
      "border border-slate-900 bg-slate-900 text-white shadow-sm hover:bg-slate-800 hover:text-white",
    secondary:
      "border border-slate-300 bg-white text-slate-900 shadow-sm hover:bg-slate-50 hover:text-slate-900",
    ghost:
      "bg-transparent text-slate-700 hover:text-slate-950",
  };

  return (
    <Link href={href} className={cn(base, variants[variant], className)}>
      <span className="text-inherit">{children}</span>
    </Link>
  );
}