"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";

type Country = {
  name: string;
  code: string;
};

const countries: Country[] = [
  { name: "Afghanistan", code: "AF" },
  { name: "Albania", code: "AL" },
  { name: "Algeria", code: "DZ" },
  { name: "Andorra", code: "AD" },
  { name: "Angola", code: "AO" },
  { name: "Antigua and Barbuda", code: "AG" },
  { name: "Argentina", code: "AR" },
  { name: "Armenia", code: "AM" },
  { name: "Australia", code: "AU" },
  { name: "Austria", code: "AT" },
  { name: "Azerbaijan", code: "AZ" },
  { name: "Bahamas", code: "BS" },
  { name: "Bahrain", code: "BH" },
  { name: "Bangladesh", code: "BD" },
  { name: "Barbados", code: "BB" },
  { name: "Belarus", code: "BY" },
  { name: "Belgium", code: "BE" },
  { name: "Belize", code: "BZ" },
  { name: "Benin", code: "BJ" },
  { name: "Bhutan", code: "BT" },
  { name: "Bolivia", code: "BO" },
  { name: "Bosnia and Herzegovina", code: "BA" },
  { name: "Botswana", code: "BW" },
  { name: "Brazil", code: "BR" },
  { name: "Brunei", code: "BN" },
  { name: "Bulgaria", code: "BG" },
  { name: "Burkina Faso", code: "BF" },
  { name: "Burundi", code: "BI" },
  { name: "Cabo Verde", code: "CV" },
  { name: "Cambodia", code: "KH" },
  { name: "Cameroon", code: "CM" },
  { name: "Canada", code: "CA" },
  { name: "Central African Republic", code: "CF" },
  { name: "Chad", code: "TD" },
  { name: "Chile", code: "CL" },
  { name: "China", code: "CN" },
  { name: "Colombia", code: "CO" },
  { name: "Comoros", code: "KM" },
  { name: "Congo (Republic of the)", code: "CG" },
  { name: "Costa Rica", code: "CR" },
  { name: "Côte d’Ivoire", code: "CI" },
  { name: "Croatia", code: "HR" },
  { name: "Cuba", code: "CU" },
  { name: "Cyprus", code: "CY" },
  { name: "Czechia", code: "CZ" },
  { name: "Democratic Republic of the Congo", code: "CD" },
  { name: "Denmark", code: "DK" },
  { name: "Djibouti", code: "DJ" },
  { name: "Dominica", code: "DM" },
  { name: "Dominican Republic", code: "DO" },
  { name: "Ecuador", code: "EC" },
  { name: "Egypt", code: "EG" },
  { name: "El Salvador", code: "SV" },
  { name: "Equatorial Guinea", code: "GQ" },
  { name: "Eritrea", code: "ER" },
  { name: "Estonia", code: "EE" },
  { name: "Eswatini", code: "SZ" },
  { name: "Ethiopia", code: "ET" },
  { name: "Fiji", code: "FJ" },
  { name: "Finland", code: "FI" },
  { name: "France", code: "FR" },
  { name: "Gabon", code: "GA" },
  { name: "Gambia", code: "GM" },
  { name: "Georgia", code: "GE" },
  { name: "Germany", code: "DE" },
  { name: "Ghana", code: "GH" },
  { name: "Greece", code: "GR" },
  { name: "Grenada", code: "GD" },
  { name: "Guatemala", code: "GT" },
  { name: "Guinea", code: "GN" },
  { name: "Guinea-Bissau", code: "GW" },
  { name: "Guyana", code: "GY" },
  { name: "Haiti", code: "HT" },
  { name: "Holy See (Vatican City)", code: "VA" },
  { name: "Honduras", code: "HN" },
  { name: "Hungary", code: "HU" },
  { name: "Iceland", code: "IS" },
  { name: "India", code: "IN" },
  { name: "Indonesia", code: "ID" },
  { name: "Iran", code: "IR" },
  { name: "Iraq", code: "IQ" },
  { name: "Ireland", code: "IE" },
  { name: "Israel", code: "IL" },
  { name: "Italy", code: "IT" },
  { name: "Jamaica", code: "JM" },
  { name: "Japan", code: "JP" },
  { name: "Jordan", code: "JO" },
  { name: "Kazakhstan", code: "KZ" },
  { name: "Kenya", code: "KE" },
  { name: "Kiribati", code: "KI" },
  { name: "Kuwait", code: "KW" },
  { name: "Kyrgyzstan", code: "KG" },
  { name: "Laos", code: "LA" },
  { name: "Latvia", code: "LV" },
  { name: "Lebanon", code: "LB" },
  { name: "Lesotho", code: "LS" },
  { name: "Liberia", code: "LR" },
  { name: "Libya", code: "LY" },
  { name: "Liechtenstein", code: "LI" },
  { name: "Lithuania", code: "LT" },
  { name: "Luxembourg", code: "LU" },
  { name: "Madagascar", code: "MG" },
  { name: "Malawi", code: "MW" },
  { name: "Malaysia", code: "MY" },
  { name: "Maldives", code: "MV" },
  { name: "Mali", code: "ML" },
  { name: "Malta", code: "MT" },
  { name: "Marshall Islands", code: "MH" },
  { name: "Mauritania", code: "MR" },
  { name: "Mauritius", code: "MU" },
  { name: "Mexico", code: "MX" },
  { name: "Micronesia", code: "FM" },
  { name: "Moldova", code: "MD" },
  { name: "Monaco", code: "MC" },
  { name: "Mongolia", code: "MN" },
  { name: "Montenegro", code: "ME" },
  { name: "Morocco", code: "MA" },
  { name: "Mozambique", code: "MZ" },
  { name: "Myanmar", code: "MM" },
  { name: "Namibia", code: "NA" },
  { name: "Nauru", code: "NR" },
  { name: "Nepal", code: "NP" },
  { name: "Netherlands", code: "NL" },
  { name: "New Zealand", code: "NZ" },
  { name: "Nicaragua", code: "NI" },
  { name: "Niger", code: "NE" },
  { name: "Nigeria", code: "NG" },
  { name: "North Korea", code: "KP" },
  { name: "North Macedonia", code: "MK" },
  { name: "Norway", code: "NO" },
  { name: "Oman", code: "OM" },
  { name: "Pakistan", code: "PK" },
  { name: "Palau", code: "PW" },
  { name: "Palestine", code: "PS" },
  { name: "Panama", code: "PA" },
  { name: "Papua New Guinea", code: "PG" },
  { name: "Paraguay", code: "PY" },
  { name: "Peru", code: "PE" },
  { name: "Philippines", code: "PH" },
  { name: "Poland", code: "PL" },
  { name: "Portugal", code: "PT" },
  { name: "Qatar", code: "QA" },
  { name: "Romania", code: "RO" },
  { name: "Russia", code: "RU" },
  { name: "Rwanda", code: "RW" },
  { name: "Saint Kitts and Nevis", code: "KN" },
  { name: "Saint Lucia", code: "LC" },
  { name: "Saint Vincent and the Grenadines", code: "VC" },
  { name: "Samoa", code: "WS" },
  { name: "San Marino", code: "SM" },
  { name: "Sao Tome and Principe", code: "ST" },
  { name: "Saudi Arabia", code: "SA" },
  { name: "Senegal", code: "SN" },
  { name: "Serbia", code: "RS" },
  { name: "Seychelles", code: "SC" },
  { name: "Sierra Leone", code: "SL" },
  { name: "Singapore", code: "SG" },
  { name: "Slovakia", code: "SK" },
  { name: "Slovenia", code: "SI" },
  { name: "Solomon Islands", code: "SB" },
  { name: "Somalia", code: "SO" },
  { name: "South Africa", code: "ZA" },
  { name: "South Korea", code: "KR" },
  { name: "South Sudan", code: "SS" },
  { name: "Spain", code: "ES" },
  { name: "Sri Lanka", code: "LK" },
  { name: "Sudan", code: "SD" },
  { name: "Suriname", code: "SR" },
  { name: "Sweden", code: "SE" },
  { name: "Switzerland", code: "CH" },
  { name: "Syria", code: "SY" },
  { name: "Tajikistan", code: "TJ" },
  { name: "Tanzania", code: "TZ" },
  { name: "Thailand", code: "TH" },
  { name: "Timor-Leste", code: "TL" },
  { name: "Togo", code: "TG" },
  { name: "Tonga", code: "TO" },
  { name: "Trinidad and Tobago", code: "TT" },
  { name: "Tunisia", code: "TN" },
  { name: "Türkiye", code: "TR" },
  { name: "Turkmenistan", code: "TM" },
  { name: "Tuvalu", code: "TV" },
  { name: "Uganda", code: "UG" },
  { name: "Ukraine", code: "UA" },
  { name: "United Arab Emirates", code: "AE" },
  { name: "United Kingdom", code: "GB" },
  { name: "United States", code: "US" },
  { name: "Uruguay", code: "UY" },
  { name: "Uzbekistan", code: "UZ" },
  { name: "Vanuatu", code: "VU" },
  { name: "Venezuela", code: "VE" },
  { name: "Vietnam", code: "VN" },
  { name: "Yemen", code: "YE" },
  { name: "Zambia", code: "ZM" },
  { name: "Zimbabwe", code: "ZW" },
];

type LeaveMarkModalProps = {
  onClose: () => void;
};

function countWords(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function countryFlag(code: string) {
  if (!/^[A-Z]{2}$/.test(code)) return "";

  return String.fromCodePoint(
    ...code
      .toUpperCase()
      .split("")
      .map((character) => 127397 + character.charCodeAt(0))
  );
}

export default function LeaveMarkModal({
  onClose,
}: LeaveMarkModalProps) {
  const [step, setStep] = useState<"create" | "review">("create");

  const [countryCode, setCountryCode] = useState("");
  const [message, setMessage] = useState("");

  const [markFile, setMarkFile] = useState<File | null>(null);
  const [markPreview, setMarkPreview] = useState<string | null>(null);

  const [policyAccepted, setPolicyAccepted] = useState(false);

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const wordCount = useMemo(() => countWords(message), [message]);

  const selectedCountry = useMemo(
    () => countries.find((item) => item.code === countryCode) ?? null,
    [countryCode]
  );

  useEffect(() => {
    return () => {
      if (markPreview) {
        URL.revokeObjectURL(markPreview);
      }
    };
  }, [markPreview]);

  function handleMarkFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const maxFileSize = 15 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      event.target.value = "";
      setFormError("Please choose a JPG, PNG or WEBP photo.");
      return;
    }

    if (file.size > maxFileSize) {
      event.target.value = "";
      setFormError(
        "This photo is over 15 MB. Please choose a smaller photo."
      );
      return;
    }

    if (markPreview) {
      URL.revokeObjectURL(markPreview);
    }

    setMarkFile(file);
    setMarkPreview(URL.createObjectURL(file));
    setFormError("");
  }

  function removeMark() {
    if (markPreview) {
      URL.revokeObjectURL(markPreview);
    }

    setMarkFile(null);
    setMarkPreview(null);

    const input = document.getElementById(
      "mark-file"
    ) as HTMLInputElement | null;

    if (input) {
      input.value = "";
    }
  }

  function handleMessageChange(value: string) {
    const nextWordCount = countWords(value);

    if (nextWordCount <= 10) {
      setMessage(value);
      setFormError("");
    }
  }

  function continueToReview() {
    if (!selectedCountry) {
      setFormError("Please choose your country.");
      return;
    }

    if (!markFile || !markPreview) {
      setFormError("Please choose a photo for your Mark.");
      return;
    }

    if (wordCount > 10) {
      setFormError("Your message must be 10 words or less.");
      return;
    }

    setFormError("");
    setStep("review");
  }

  async function startCheckout() {
    if (isSubmitting) return;

    if (!policyAccepted) {
      setFormError(
        "Please confirm that you have the right to use this photo and that your Mark respects the rules."
      );
      return;
    }

    if (!markFile || !selectedCountry) {
      setFormError("Your Mark is incomplete.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      const formData = new FormData();

      formData.append("country", selectedCountry.name);
      formData.append("country_code", selectedCountry.code);
      formData.append("message", message.trim());
      formData.append("image", markFile);
formData.append("policy_accepted", "true");
      const markResponse = await fetch("/api/marks", {
        method: "POST",
        body: formData,
      });

      const markResult = await markResponse.json();

      if (!markResponse.ok || !markResult.mark?.id) {
        throw new Error(
          markResult.error || "Could not prepare your Mark."
        );
      }

      const checkoutResponse = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          markId: markResult.mark.id,
        }),
      });

      const checkoutResult = await checkoutResponse.json();

      if (!checkoutResponse.ok || !checkoutResult.url) {
        throw new Error(
          checkoutResult.error || "Could not start secure checkout."
        );
      }

      window.location.href = checkoutResult.url;
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Could not start checkout."
      );

      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 px-4 py-6 backdrop-blur-md"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-[540px] overflow-hidden rounded-[28px] border border-white/10 bg-[#08090b] shadow-[0_30px_100px_rgba(0,0,0,0.7)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,rgba(255,244,214,0.08),transparent_70%)]" />

        <div className="relative p-6 sm:p-8">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-lg text-white/40 transition hover:border-white/20 hover:text-white"
          >
            ×
          </button>

          {step === "create" ? (
            <>
              <p className="text-[9px] font-medium tracking-[0.3em] text-[#d8c7a0]">
                MARK AT ZERO · MY MARK
              </p>

              <h2 className="mt-3 pr-10 text-3xl font-semibold tracking-[-0.03em] text-white">
                Leave something human behind.
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/45">
                A photo. Ten words. One Mark.
              </p>

              <div className="mt-7 space-y-6">
                <div>
                  <p className="mb-2 text-[9px] tracking-[0.2em] text-white/35">
                    YOUR PHOTO
                  </p>

                  {!markPreview ? (
                    <label
                      htmlFor="mark-file"
                      className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-white/15 bg-white/[0.025] p-4 transition hover:border-[#d8c7a0]/40 hover:bg-white/[0.04]"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-xl text-[#e7d8b8]">
                        +
                      </div>

                      <div>
                        <p className="text-sm text-white/80">
                          Choose your photo
                        </p>

                        <p className="mt-1 text-[10px] leading-5 text-white/35">
                          JPG, PNG or WEBP · up to 15 MB
                        </p>
                      </div>
                    </label>
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-3">
                      <div className="flex items-center gap-4">
                        <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black">
                          <img
                            src={markPreview}
                            alt="Your Mark preview"
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-[9px] tracking-[0.2em] text-[#d8c7a0]">
                            PHOTO READY
                          </p>

                          <p className="mt-2 truncate text-xs text-white/70">
                            {markFile?.name}
                          </p>

                          <p className="mt-1 text-[9px] text-white/30">
                            This photo will become part of your Mark.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={removeMark}
                          className="rounded-full border border-white/10 px-3 py-2 text-[9px] tracking-wider text-white/40 transition hover:border-white/20 hover:text-white"
                        >
                          REMOVE
                        </button>
                      </div>

                      <label
                        htmlFor="mark-file"
                        className="mt-3 block cursor-pointer rounded-lg border border-white/[0.07] py-2 text-center text-[9px] tracking-[0.18em] text-white/35 transition hover:text-[#e7d8b8]"
                      >
                        CHOOSE A DIFFERENT PHOTO
                      </label>
                    </div>
                  )}

                  <input
                    id="mark-file"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleMarkFile}
                    className="hidden"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <label
                      htmlFor="message"
                      className="text-[9px] tracking-[0.2em] text-white/35"
                    >
                      YOUR TEN WORDS
                    </label>

                    <span
                      className={`text-[9px] ${
                        wordCount === 10
                          ? "text-[#e7d8b8]"
                          : "text-white/30"
                      }`}
                    >
                      {wordCount} / 10 WORDS
                    </span>
                  </div>

                  <input
                    id="message"
                    type="text"
                    value={message}
                    onChange={(event) =>
                      handleMessageChange(event.target.value)
                    }
                    placeholder="Say something worth leaving behind..."
                    className="w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3.5 text-sm text-white/80 outline-none transition placeholder:text-white/20 focus:border-[#d8c7a0]/40"
                  />

                  <p className="mt-2 text-[9px] leading-5 text-white/25">
                    Optional. Maximum 10 words.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="country"
                    className="mb-2 block text-[9px] tracking-[0.2em] text-white/35"
                  >
                    YOUR COUNTRY
                  </label>

                  <div className="relative">
                    <select
                      id="country"
                      value={countryCode}
                      onChange={(event) => {
                        setCountryCode(event.target.value);
                        setFormError("");
                      }}
                      className="w-full appearance-none rounded-xl border border-white/10 bg-[#101114] px-4 py-3.5 pr-12 text-sm text-white/75 outline-none transition focus:border-[#d8c7a0]/40"
                    >
                      <option value="" disabled>
                        Choose a country
                      </option>

                      {countries.map((country) => (
                        <option
                          key={country.code}
                          value={country.code}
                        >
                          {countryFlag(country.code)} {country.name}
                        </option>
                      ))}
                    </select>

                    {selectedCountry && (
                      <div className="pointer-events-none absolute right-10 top-1/2 -translate-y-1/2 text-lg">
                        {countryFlag(selectedCountry.code)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {formError && (
                <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/[0.05] px-4 py-3 text-[10px] leading-5 text-red-300">
                  {formError}
                </div>
              )}

              <div className="mt-7 flex items-end justify-between gap-5 border-t border-white/[0.07] pt-5">
                <div>
                  <p className="text-[8px] tracking-[0.2em] text-white/30">
                    ONE MARK · ONCE
                  </p>

                  <p className="mt-1 text-xl font-medium text-white">
                    €1
                  </p>
                </div>

                <button
                  type="button"
                  onClick={continueToReview}
                  className="rounded-full bg-[#f2ead9] px-7 py-3 text-xs font-semibold tracking-wide text-black transition hover:scale-[1.02] hover:bg-white"
                >
                  REVIEW MY MARK →
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-[9px] font-medium tracking-[0.3em] text-[#d8c7a0]">
                MARK AT ZERO · MY MARK
              </p>

              <h2 className="mt-3 pr-10 text-3xl font-semibold tracking-[-0.03em] text-white">
                This is your Mark.
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/45">
                Review it before it becomes part of MARK AT ZERO.
              </p>

              <div className="mt-7 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
                <div className="relative aspect-[4/3] overflow-hidden bg-black">
                  {markPreview && (
                    <img
                      src={markPreview}
                      alt="Your Mark"
                      className="h-full w-full object-cover"
                    />
                  )}

                  <div className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/65 px-3 py-1.5 text-[8px] tracking-[0.18em] text-white/75 backdrop-blur">
                    MY MARK
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-5">
                    <div className="min-w-0">
                      <p className="text-[8px] tracking-[0.2em] text-white/30">
                        MESSAGE
                      </p>

                      <p className="mt-2 text-sm leading-6 text-white/80">
                        {message.trim() || "A moment without words."}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-[8px] tracking-[0.2em] text-white/30">
                        COUNTRY
                      </p>

                      <p className="mt-2 text-sm text-white/75">
                        {selectedCountry
                          ? `${countryFlag(selectedCountry.code)} ${selectedCountry.name}`
                          : ""}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4">
                    <p className="text-[9px] tracking-[0.18em] text-[#d8c7a0]">
                      PERMANENT MARK NUMBER AFTER PAYMENT
                    </p>

                    <p className="text-sm font-medium text-white">
                      €1
                    </p>
                  </div>
                </div>
              </div>

              <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                <input
                  type="checkbox"
                  checked={policyAccepted}
                  onChange={(event) => {
                    setPolicyAccepted(event.target.checked);
                    setFormError("");
                  }}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-white"
                />

                <span className="text-[10px] leading-5 text-white/45">
                  I confirm that I have the right to use this photo
                  and that my Mark respects the rules: no nudity,
                  hate, violence, harassment, illegal content,
                  impersonation, or content intended to harm others.
                </span>
              </label>

              <p className="mt-3 text-center text-[9px] tracking-[0.08em] text-white/25">
                RESPECT THE MARK · RESPECT THE PEOPLE
              </p>

              {formError && (
                <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/[0.05] px-4 py-3 text-[10px] leading-5 text-red-300">
                  {formError}
                </div>
              )}

              <div className="mt-6 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setFormError("");
                    setStep("create");
                  }}
                  className="rounded-full border border-white/10 px-6 py-3 text-[10px] tracking-[0.15em] text-white/40 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← EDIT
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={startCheckout}
                  className="rounded-full bg-[#f2ead9] px-7 py-3 text-xs font-semibold tracking-wide text-black transition hover:scale-[1.02] hover:bg-white disabled:cursor-wait disabled:opacity-60"
                >
                  {isSubmitting
                    ? "PREPARING..."
                    : "LEAVE MY MARK · €1 →"}
                </button>
              </div>

              <p className="mt-5 text-center text-[9px] leading-5 text-white/25">
                Your Mark becomes public only after successful payment.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}