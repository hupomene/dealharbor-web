import Container from "@/components/ui/container";
import SectionHeading from "@/components/ui/section-heading";
import Button from "@/components/ui/button";

export default function SampleDeal() {
  return (
    <section className="py-20">
      <Container>
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-10">
          <SectionHeading
            eyebrow="Quick Start"
            title="Create a Sample Deal in Under 60 Seconds"
            description="Show the workflow immediately with a guided sample deal experience."
          />

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Business Name" placeholder="North Ridge Auto Care" />
            <Field label="Purchase Price" placeholder="$850,000" />
            <Field label="State" placeholder="Texas" />
            <Field label="Deal Type" placeholder="Asset Purchase" />
          </div>

          <div className="mt-6">
            <Button href="/deals/new" variant="primary">
              Create Sample Contract
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900"
      />
    </label>
  );
}