import Container from "@/components/ui/container";
import Button from "@/components/ui/button";

export default function FinalCta() {
  return (
    <section className="pb-20 pt-6">
      <Container>
        <div className="rounded-[32px] border border-slate-200 bg-slate-900 px-6 py-12 text-white sm:px-10 sm:py-14">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">
              Final CTA
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Start Creating Business Sale Contracts Faster
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Move from fragmented templates to a deal-aware contract generation
              workflow built for business sale transactions.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/dashboard" variant="secondary">
                Start Free
              </Button>
              <Button href="/deals/new" variant="ghost" className="text-white hover:text-slate-200">
                Create Sample Deal
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}