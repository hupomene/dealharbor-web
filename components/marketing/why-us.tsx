import Container from "@/components/ui/container";
import SectionHeading from "@/components/ui/section-heading";
import { WHY_US } from "@/lib/constants";

export default function WhyUs() {
  return (
    <section className="border-y border-slate-200 bg-slate-50 py-20">
      <Container>
        <SectionHeading
          eyebrow="Why Us"
          title="Not a generic template site"
          description="This product is structured around real deal inputs and multi-document output."
        />

        <div className="grid gap-6 md:grid-cols-3">
          {WHY_US.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
            >
              <h3 className="text-xl font-semibold text-slate-950">{item.title}</h3>
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