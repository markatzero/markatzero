"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { getOurMarkCountries } from "./ourMarkCountries";

type Props = {
  onClose: () => void;
};

export default function OurMarkModal({ onClose }: Props) {
  const countries = useMemo(() => getOurMarkCountries(), []);

  const [countryCode, setCountryCode] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const wordCount = message.trim()
    ? message.trim().split(/\s+/).length
    : 0;

  function changeMessage(event: ChangeEvent<HTMLTextAreaElement>) {
    const value = event.target.value;
    const words = value.trim().split(/\s+/).filter(Boolean);

    if (words.length <= 10) {
      setMessage(value);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const country = countries.find(
      (item) => item.code === countryCode
    );

    if (!image || !country || !message.trim() || !accepted) {
      setError("Complete all fields and accept the rules.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("country", country.name);
      formData.append("country_code", country.code);
      formData.append("message", message.trim());
      formData.append("image", image);
      formData.append("policy_accepted", "true");

      const response = await fetch("/api/our-mark", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not create OUR MARK.");
      }

      const checkoutResponse = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          markId: result.markId,
        }),
      });

      const checkout = await checkoutResponse.json();

      if (!checkoutResponse.ok || !checkout.url) {
        throw new Error(checkout.error || "Could not start payment.");
      }

      window.location.href = checkout.url;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 px-4 py-8 backdrop-blur-md">
      <form
        onSubmit={submit}
        className="relative mx-auto w-full max-w-[520px] rounded-[28px] border border-white/10 bg-[#08090b] p-7 text-white shadow-[0_30px_100px_rgba(0,0,0,0.7)]"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 text-xl text-white/40 hover:text-white"
        >
          ×
        </button>

        <p className="text-[9px] tracking-[0.3em] text-[#d8c7a0]">
          MARK AT ZERO · OUR MARK
        </p>

        <h1 className="mt-3 text-3xl font-semibold">
          Leave something together.
        </h1>

        <p className="mt-2 text-sm text-white/45">
          One shared photo. Ten shared words. One Mark.
        </p>

        <label className="mt-7 block text-xs text-white/55">
          SHARED PHOTO
        </label>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) =>
            setImage(event.target.files?.[0] || null)
          }
          className="mt-2 block w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs"
        />

        <label className="mt-5 block text-xs text-white/55">
          YOUR 10 WORDS
        </label>

        <textarea
          value={message}
          onChange={changeMessage}
          rows={3}
          placeholder="Something you want to leave behind together..."
          className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm outline-none"
        />

        <p className="mt-1 text-right text-[10px] text-white/30">
          {wordCount}/10 words
        </p>

        <label className="mt-4 block text-xs text-white/55">
          COUNTRY
        </label>

        <select
          value={countryCode}
          onChange={(event) => setCountryCode(event.target.value)}
          className="mt-2 w-full rounded-xl border border-white/10 bg-[#111318] p-3 text-sm"
        >
          <option value="">Choose a country</option>

          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>

        <label className="mt-5 flex items-start gap-3 text-xs leading-5 text-white/45">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(event) => setAccepted(event.target.checked)}
            className="mt-1"
          />

          <span>
            We have the right to use this photo and agree to respect
            the Mark and the people.
          </span>
        </label>

        {error && (
          <p className="mt-4 text-xs text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-[#f2ead9] px-7 py-3 text-xs font-semibold tracking-wide text-black disabled:opacity-40"
        >
          {loading ? "PREPARING PAYMENT..." : "LEAVE OUR MARK · €1"}
        </button>

        <p className="mt-4 text-center text-[9px] text-white/25">
          One shared Mark · one permanent number · one-time payment
        </p>
      </form>
    </div>
  );
}