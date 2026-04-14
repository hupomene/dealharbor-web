import Container from "@/components/ui/container";
import SectionHeading from "@/components/ui/section-heading";
import { FULL_DOCUMENT_LIST } from "@/lib/constants";

export default function DocumentsGrid() {
  return (
    <section id="templates" className="py-20">
      <Container>
        <SectionHeading
          eyebrow="Document Coverage"
          title="Documents you can generate"
          description="The platform is designed to assemble a complete business sale package, not just a single file."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FULL_DOCUMENT_LIST.map((doc) => (
            <div
              key={doc}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-700">
                  DOC
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{doc}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Generated from structured deal terms
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}