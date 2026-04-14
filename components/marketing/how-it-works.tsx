import Container from "@/components/ui/container";
import SectionHeading from "@/components/ui/section-heading";
import { HOW_IT_WORKS } from "@/lib/constants";

export default function HowItWorks() {
  return (
    <section id="product" className="border-y border-slate-200 bg-slate-50 py-20">
      <Container>
        <SectionHeading
          eyebrow="How It Works"
          title="A structured path from deal intake to closing package"
          description="The workflow is designed around the way real acquisition deals move."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {HOW_IT_WORKS.map((item) => (
            <div
              key={item.step}
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
            >
              <div className="text-sm font-semibold text-slate-500">{item.step}</div>
              <h3 className="mt-3 text-xl font-semibold text-slate-950">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}