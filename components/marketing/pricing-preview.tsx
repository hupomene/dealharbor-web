import Container from "@/components/ui/container";
import SectionHeading from "@/components/ui/section-heading";
import Button from "@/components/ui/button";
import { PRICING } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function PricingPreview() {
  return (
    <section id="pricing" className="py-20">
      <Container>
        <SectionHeading
          eyebrow="Pricing"
          title="Simple pricing for growing deal volume"
          description="Start with a lightweight plan, then expand into team workflows and document operations."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {PRICING.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "rounded-3xl border p-7 shadow-sm",
                plan.highlighted
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-950"
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                {plan.highlighted ? (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                    Most Popular
                  </span>
                ) : null}
              </div>

              <div className="mt-5">
                <div className="text-4xl font-bold">{plan.price}</div>
                <p
                  className={cn(
                    "mt-2 text-sm",
                    plan.highlighted ? "text-slate-300" : "text-slate-600"
                  )}
                >
                  {plan.subtitle}
                </p>
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className={cn(
                      "text-sm",
                      plan.highlighted ? "text-slate-100" : "text-slate-700"
                    )}
                  >
                    • {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Button
                  href="/dashboard"
                  variant={plan.highlighted ? "secondary" : "primary"}
                  className="w-full"
                >
                  Start Free
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}