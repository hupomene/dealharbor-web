"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser-client";

export default function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = useMemo(() => {
    const next = searchParams.get("next");
    return next && next.startsWith("/") ? next : "/deals";
  }, [searchParams]);

  const initialError = useMemo(() => {
    return searchParams.get("error") || "";
  }, [searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(initialError);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const supabase = createBrowserSupabaseClient();

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-6 py-12">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6">
            <p className="text-sm text-slate-500">PactAnchor</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">
              Log in
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Existing users can sign in to access deals and generate contract packages.
            </p>
          </div>

          <form onSubmit={handleLogin} className="grid gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                placeholder="Your password"
                required
              />
            </div>

            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Please wait..." : "Log in"}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-4 text-sm text-slate-600">
            New to PactAnchor?{" "}
            <Link href="/signup" className="font-medium text-slate-900 underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}