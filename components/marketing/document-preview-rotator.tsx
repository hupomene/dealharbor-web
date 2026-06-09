"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Props = {
  title: string;
  badge: string;
  items: string[];
  imageSrc: string;
  intervalMs?: number;
};

export default function DocumentPreviewRotator({
  title,
  badge,
  items,
  imageSrc,
  intervalMs = 1000,
}: Props) {
  const [showImage, setShowImage] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setShowImage((prev) => !prev);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs]);

  return (
    <div className="group [perspective:1400px]">
      <div
        className={`relative min-h-[340px] rounded-2xl border border-slate-800 transition-transform duration-700 [transform-style:preserve-3d] ${
          showImage ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* Front */}
        <div className="absolute inset-0 rounded-2xl border border-slate-800 bg-slate-950/70 p-5 [backface-visibility:hidden]">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h4 className="text-sm font-semibold text-white">{title}</h4>
            <span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-300">
              {badge}
            </span>
          </div>

          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item}
                className="flex gap-2 text-sm leading-6 text-slate-400"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 text-xs text-emerald-300">
            Live preview rotates to actual document image
          </div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 rounded-2xl border border-slate-800 bg-slate-950 p-4 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="mb-3 flex items-center justify-between gap-4">
            <h4 className="text-sm font-semibold text-white">{title}</h4>
            <span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-300">
              Preview
            </span>
          </div>

          <div className="relative h-[270px] overflow-hidden rounded-xl border border-slate-800 bg-white">
            <Image
              src={imageSrc}
              alt={`${title} document preview`}
              fill
              className="object-cover object-top"
            />
          </div>
        </div>
      </div>
    </div>
  );
}