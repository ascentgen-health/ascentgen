// app/_components/InfoModal.tsx
"use client";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InfoModal({ isOpen, onClose }: InfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md max-h-[80vh] rounded-xl border border-white/10 bg-[#06070E] p-8 shadow-2xl flex flex-col relative">
        {/* Top-right X */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white/50 hover:text-white/80 text-sm"
          aria-label="Close"
        >
          ×
        </button>

        <h2 className="font-cinzel text-xl text-white mb-4 pr-6 uppercase tracking-[0.25em]">
          Ascentgen
        </h2>
        <p className="text-[11px] text-white/50 tracking-[0.2em] uppercase mb-4">
          Track heat. Track rhythm. Ascend.
        </p>

        <div className="space-y-4 text-sm text-white/75 overflow-y-auto pr-2">
          {/* What Ascentgen is */}
          <div>
            <h3 className="font-semibold text-amber-400 mb-1 uppercase tracking-[0.16em] text-[11px]">
              What Ascentgen tracks
            </h3>
            <p className="leading-relaxed">
              Ascentgen is a bioenergetic compass. It watches waking and
              post‑meal temperature and pulse to see how warm and how steady
              your system can run from day to day.
            </p>
            <p className="mt-2 leading-relaxed text-white/60">
              Generative energy here means enough energy to repair tissue,
              think clearly, feel interested in life, and handle stress without
              running on adrenaline.
            </p>
          </div>

          {/* How to measure */}
          <div>
            <h3 className="font-semibold text-amber-400 mb-1 uppercase tracking-[0.16em] text-[11px]">
              How to measure each day
            </h3>
            <p className="leading-relaxed">
              Use an oral thermometer (glass or slower digital) and manual pulse.
              Keep the same thermometer, same location, and same pulse method.
            </p>
            <p className="mt-2 leading-relaxed">
              Waking: as soon as you wake, while still in bed, before getting up
              or using your phone. Keep the thermometer in place for 5–10 minutes,
              then count your pulse for a full 60 seconds.
            </p>
            <p className="mt-2 leading-relaxed">
              Post‑meal: 40–60 minutes after your first substantial meal with
              protein, carbohydrate, and some saturated fat. Sit quietly for a
              few minutes, then repeat the same temperature and pulse method.
            </p>
            <p className="mt-2 leading-relaxed text-white/55">
              Keep timing and technique the same. One day can be noisy; the signal
              shows up over 7–14 days of readings.
            </p>
          </div>

          {/* GQ + tiers */}
          <div>
            <h3 className="font-semibold text-amber-400 mb-1 uppercase tracking-[0.16em] text-[11px]">
              What your GQ means
            </h3>
            <p className="leading-relaxed">
              As you log, Ascentgen turns your readings into a Generative Quotient
              (GQ): a 0–100 index of how close and how stable your waking and
              post‑meal readings are to the generative targets over time.
            </p>
            <p className="mt-2 leading-relaxed text-white/60">
              GQ is not a diagnosis. It is a metabolic compass that shows whether
              you are sitting in a colder, slowed pattern, a hot‑but‑wired pattern,
              or a warm and steady pattern.
            </p>
            <ul className="mt-3 space-y-1 text-[13px] text-white/65">
              <li>
                <span className="font-semibold text-white/80">Dormant</span>:
                colder, slowed pattern; the fire has not caught yet.
              </li>
              <li>
                <span className="font-semibold text-white/80">Kindling</span>:
                heat is building; the fire is catching but not yet steady.
              </li>
              <li>
                <span className="font-semibold text-white/80">Ascending</span>:
                warm, steady, generative; the fire holds.
              </li>
            </ul>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 border border-white/15 rounded-lg text-[11px] tracking-[0.2em] uppercase text-white/80 hover:bg-white/5 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}