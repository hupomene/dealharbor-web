import { Suspense } from "react";
import SignupPageClient from "./signup-page-client";

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50">
          <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-6 py-12">
            <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-sm text-slate-500">Loading sign up...</p>
            </div>
          </div>
        </main>
      }
    >
      <SignupPageClient />
    </Suspense>
  );
}