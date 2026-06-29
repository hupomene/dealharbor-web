"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CheckCircle2,
  Files,
  RefreshCcw,
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { whyPactAnchorFaqs } from "@/lib/why-pactanchor-faq";

type SummaryCard = {
  title: string;
  text: string;
  Icon: LucideIcon;
};

const summaryCards: SummaryCard[] = [
  {
    title: "Reduce document inconsistencies",
    text: "Enter deal information once and keep core terms aligned across APA, Bill of Sale, Promissory Note, Non-Compete, and supporting schedules.",
    Icon: RefreshCcw,
  },
  {
    title: "Built beyond general AI drafting",
    text: "PactAnchor is designed around transaction-level document synchronization, not one-off contract text generation.",
    Icon: Files,
  },
  {
    title: "Prepare cleaner packages for review",
    text: "Create more organized draft packages for brokers, advisors, attorneys, CPAs, and closing support teams.",
    Icon: ShieldCheck,
  },
];

export default function WhyPactAnchorSection() {
  const [activeId, setActiveId] = useState(whyPactAnchorFaqs[0]?.id ?? "");

  const activeFaq = useMemo(() => {
    return (
      whyPactAnchorFaqs.find((item) => item.id === activeId) ??
      whyPactAnchorFaqs[0]
    );
  }, [activeId]);

  if (!activeFaq) {
    return null;
  }

  return (
    <section id="why-pactanchor" className="bg-slate-50 px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">
            Why PactAnchor?
          </p>

          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
            Answers to the questions deal professionals ask before using
            PactAnchor.
          </h2>

          <p className="mt-6 text-lg leading-8 text-slate-600">
            PactAnchor helps small business brokers, M&A advisors, transaction
            attorneys, CPAs, SBA loan professionals, and closing teams reduce
            repetitive drafting work, keep deal terms synchronized, and prepare
            cleaner document packages for review.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {summaryCards.map(({ title, text, Icon }) => (
            <div
              key={title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                <Icon className="h-6 w-6" />
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-950">
                {title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
            </div>
          ))}
        </div>

        {/* Desktop interactive layout */}
        <div className="mt-14 hidden gap-8 lg:grid lg:grid-cols-[0.9fr_1.35fr] lg:items-start">
          <div className="sticky top-8 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-3 px-3 pt-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#061d3a] text-white">
                <Sparkles className="h-5 w-5" />
              </div>

              <div>
                <h3 className="font-bold text-slate-950">
                  Common questions
                </h3>
                <p className="text-xs text-slate-500">
                  Select a question to view the visual answer.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {whyPactAnchorFaqs.map((item, index) => {
                const isActive = item.id === activeFaq.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveId(item.id)}
                    className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                      isActive
                        ? "border-teal-300 bg-teal-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          isActive
                            ? "bg-teal-700 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {index + 1}
                      </span>

                      <div>
                        <p
                          className={`text-sm font-bold leading-6 ${
                            isActive ? "text-teal-950" : "text-slate-900"
                          }`}
                        >
                          {item.question}
                        </p>

                        <p
                          className={`mt-1 text-xs font-semibold uppercase tracking-wide ${
                            isActive ? "text-teal-700" : "text-slate-400"
                          }`}
                        >
                          {item.category}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl">
            <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
                    {activeFaq.category}
                  </p>

                  <h3 className="mt-2 text-2xl font-extrabold leading-tight text-slate-950">
                    {activeFaq.question}
                  </h3>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-teal-200 bg-white px-4 py-2 text-sm font-semibold text-teal-800">
                  <CheckCircle2 className="h-4 w-4" />
                  Visual answer
                </div>
              </div>

              <p className="mt-5 text-base leading-8 text-slate-600">
                {activeFaq.shortAnswer}
              </p>
            </div>

            <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
              <Image
                src={activeFaq.image}
                alt={activeFaq.alt}
                width={1200}
                height={1500}
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="h-auto w-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* Mobile accordion-like layout */}
        <div className="mt-12 space-y-4 lg:hidden">
          {whyPactAnchorFaqs.map((item, index) => {
            const isActive = item.id === activeFaq.id;

            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setActiveId(item.id)}
                  className="flex w-full items-start gap-3 px-5 py-5 text-left"
                >
                  <span
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      isActive
                        ? "bg-teal-700 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {index + 1}
                  </span>

                  <div>
                    <p className="text-base font-extrabold leading-6 text-slate-950">
                      {item.question}
                    </p>

                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-teal-700">
                      {item.category}
                    </p>
                  </div>
                </button>

                {isActive && (
                  <div className="border-t border-slate-100 px-5 pb-5">
                    <p className="py-5 text-sm leading-7 text-slate-600">
                      {item.shortAnswer}
                    </p>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                      <Image
                        src={item.image}
                        alt={item.alt}
                        width={1200}
                        height={1500}
                        sizes="100vw"
                        className="h-auto w-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-14 rounded-[2rem] border border-teal-200 bg-gradient-to-r from-teal-50 to-blue-50 p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-700 text-white">
            <Scale className="h-7 w-7" />
          </div>

          <h3 className="mt-5 text-2xl font-extrabold text-slate-950">
            One guided intake. One synchronized deal package.
          </h3>

          <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-slate-600">
            PactAnchor is a drafting and workflow support platform, not a law
            firm. Use it to organize deal data, generate consistent draft
            packages, and prepare cleaner documents for qualified professional
            review.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-4">
            <Link
              href="/demo"
              className="rounded-lg bg-[#061d3a] px-7 py-4 text-sm font-bold text-white hover:bg-[#09284f]"
            >
              View Sample Documents
            </Link>

            <a
              href="#pricing"
              className="rounded-lg border border-slate-300 bg-white px-7 py-4 text-sm font-bold text-slate-950 hover:bg-slate-50"
            >
              View Launch Pricing
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}