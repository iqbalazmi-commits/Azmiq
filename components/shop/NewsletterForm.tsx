"use client";

import { useState } from "react";

/* Subscribes through our own endpoint rather than Klaviyo's onsite script.
   That keeps the email address out of a third party's hands until the customer
   has actually asked to subscribe, and means the form works whether or not
   marketing cookies were accepted. */

export function NewsletterForm() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = new FormData(form).get("email");
    setState("sending");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Something went wrong.");
      setState("done");
      setMessage("Thank you. Please check your inbox to confirm.");
      form.reset();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8">
      <label htmlFor="newsletter-email" className="eyebrow text-ink-on-inverse-muted">
        Slow letters, not spam
      </label>
      <div className="mt-3 flex gap-2">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          aria-describedby="newsletter-status"
          className="h-12 min-w-0 flex-1 rounded-md border border-white/30 bg-transparent px-3 text-sm text-ink-on-brand placeholder:text-ink-on-brand/50 focus:border-white"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="h-12 shrink-0 rounded-md bg-surface px-5 text-sm font-medium text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {state === "sending" ? "Sending" : "Subscribe"}
        </button>
      </div>
      <p
        id="newsletter-status"
        role="status"
        aria-live="polite"
        className="mt-2 min-h-5 text-xs text-ink-on-brand/80"
      >
        {message}
      </p>
    </form>
  );
}
