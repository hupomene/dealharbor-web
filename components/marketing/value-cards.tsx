import Container from "@/components/ui/container";
import SectionHeading from "@/components/ui/section-heading";
import { VALUE_CARDS } from "@/lib/constants";

export default function ValueCards() {
  return (
    <section id="features" className="py-20">
      <Container>
        <SectionHeading
          eyebrow="Core Value"
          title="Built for faster, cleaner business sale closings"
          description="A focused legal-tech workflow for generating and managing business acquisition contract packages."
        />

        <div className="grid gap-6 md:grid-cols-3">
          {VALUE_CARDS.map((card) => (
            <div
              key={card.title}
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white">
                +
              </div>
              <h3 className="text-xl font-semibold text-slate-950">
                {card.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}