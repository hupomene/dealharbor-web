import Container from "@/components/ui/container";
import { BRAND_NAME } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8">
      <Container className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-600">
          © 2026 {BRAND_NAME}. Business sale document automation for brokers and acquisition workflows.
        </div>
        <div className="flex items-center gap-5 text-sm text-slate-500">
          <a href="#" className="hover:text-slate-900">
            Privacy
          </a>
          <a href="#" className="hover:text-slate-900">
            Terms
          </a>
          <a href="#" className="hover:text-slate-900">
            Contact
          </a>
        </div>
      </Container>
    </footer>
  );
}