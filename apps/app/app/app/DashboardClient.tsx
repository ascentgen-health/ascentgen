"use client";

import { useState } from "react";
import TodayCheckInForm from "./TodayCheckInForm";
import RecentEntries from "./RecentEntries";
import type { GQResult, GQTier } from "@/lib/gq";
import { tierColor, tierTagline } from "@/lib/gq";

interface DashboardClientProps {
  userId: string;
  unit: "F" | "C";
  todayEntry: any;
  entries: any[];
  gqResult: GQResult | null;
  streak: number;
  totalEntries: number;
  daysUntilGQ: number;
  todayStr: string;
}

function GQArc({ score, tier }: { score: number; tier: GQTier }) {
  const color = tierColor(tier);
  const r = 80;
  const cx = 110;
  const cy = 110;
  const startAngle = -210;
  const totalArc = 240;

  function polarToXY(angleDeg: number, radius: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  }

  function describeArc(startDeg: number, endDeg: number, rad: number) {
    const s = polarToXY(startDeg, rad);
    const e = polarToXY(endDeg, rad);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${rad} ${rad} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  }

  const endAngle = startAngle + (score / 100) * totalArc;

  return (
    <svg
      width={220}
      height={200}
      viewBox="0 0 220 200"
      style={{ overflow: "visible" }}
    >
      <path
        d={describeArc(startAngle, startAngle + totalArc, r)}
        fill="none"
        stroke="#1e2330"
        strokeWidth={14}
        strokeLinecap="round"
      />
      <path
        d={describeArc(startAngle, endAngle, r)}
        fill="none"
        stroke={color}
        strokeWidth={14}
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
      />
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        fill={color}
        fontSize={48}
        fontWeight={700}
        fontFamily="Inter, system-ui, sans-serif"
      >
        {score}
      </text>
      <text
        x={cx}
        y={cy + 20}
        textAnchor="middle"
        fill="#6B7280"
        fontSize={11}
        fontWeight={600}
        letterSpacing="0.12em"
        fontFamily="Inter, system-ui, sans-serif"
      >
        GQ SCORE
      </text>
    </svg>
  );
}

function GQTeaser({
  daysUntilGQ,
  totalEntries,
}: {
  daysUntilGQ: number;
  totalEntries: number;
}) {
  const dots = Array.from({ length: 7 }, (_, i) => i < totalEntries);

  return (
    <div
      style={{
        background: "#111827",
        border: "1px solid #1e2330",
        borderRadius: 14,
        padding: "36px 24px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          fontSize: 80,
          fontWeight: 700,
          color: "#C9922A",
          opacity: 0.08,
          filter: "blur(8px)",
          lineHeight: 1,
          userSelect: "none",
          marginBottom: -20,
        }}
      >
        ??
      </div>

      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#C9922A",
          marginBottom: 10,
        }}
      >
        Your GQ Emerges In
      </div>

      <div
        style={{
          fontFamily: "Georgia, serif",
          fontSize: 32,
          color: "#E8DCC8",
          marginBottom: 20,
        }}
      >
        {daysUntilGQ} day{daysUntilGQ !== 1 ? "s" : ""}
      </div>

      <div
        style={{
          fontSize: 10,
          color: "#6B7280",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 6,
        }}
      >
        7-day spark tracker
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        {dots.map((filled, i) => (
          <div
            key={i}
            style={{
              width: 12,
              height: 12,
              borderRadius: 50,
              background: filled ? "#C9922A" : "#1e2330",
              border: filled ? "none" : "1px solid #1e2330",
              boxShadow: filled
                ? "0 0 6px rgba(201,146,42,0.5)"
                : "none",
              transition: "all 0.3s",
            }}
          />
        ))}
      </div>

      <p
        style={{
          color: "#6B7280",
          fontSize: 13,
          lineHeight: 1.7,
          maxWidth: 320,
          margin: "0 auto",
        }}
      >
        Seven days of steady readings and your Generative Quotient appears.
        One reading is a spark; seven build a small fire.
      </p>
    </div>
  );
}

function TierBar({ gqScore }: { gqScore: number }) {
  const tiers = [
    { label: "Dormant", range: "0–69", color: "#6B7280", max: 69 },
    { label: "Kindling", range: "70–89", color: "#C9922A", max: 89 },
    { label: "Ascending", range: "90–100", color: "#7AAE7A", max: 100 },
  ] as const;

  const currentTierIdx =
    gqScore >= 90 ? 2 : gqScore >= 70 ? 1 : 0;

  return (
    <div
      style={{
        background: "#111827",
        border: "1px solid #1e2330",
        borderRadius: 12,
        padding: "20px 24px",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#6B7280",
          marginBottom: 10,
        }}
      >
        Tier path
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {tiers.map((t, i) => (
          <div
            key={t.label}
            style={{
              flex: i === 1 ? 1.5 : 1,
              minWidth: 0,
            }}
          >
            <div
              style={{
                height: 6,
                borderRadius: 3,
                background: i <= currentTierIdx ? t.color : "#1e2330",
                transition: "background 0.4s",
                opacity: i === currentTierIdx ? 1 : 0.5,
              }}
            />
            <div
              style={{
                marginTop: 6,
                fontSize: 10,
                fontWeight: i === currentTierIdx ? 700 : 500,
                color: i === currentTierIdx ? t.color : "#6B7280",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {t.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProLockedCharts() {
  return (
    <div
      style={{
        background: "#111827",
        border: "1px solid #1e2330",
        borderRadius: 12,
        padding: "28px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <h2
        style={{
          fontFamily: "Georgia, serif",
          fontSize: 16,
          fontWeight: 400,
          color: "#E8DCC8",
          marginBottom: 20,
        }}
      >
        Trends
      </h2>

      <div
        style={{
          display: "flex",
          gap: 4,
          alignItems: "flex-end",
          height: 80,
          marginBottom: 16,
          opacity: 0.15,
          filter: "blur(2px)",
        }}
      >
        {[60, 75, 55, 80, 70, 85, 65, 90, 72, 68, 82, 78, 88, 76].map(
          (h, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: h,
                background: "#C9922A",
                borderRadius: "2px 2px 0 0",
              }}
            />
          )
        )}
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, transparent 30%, #111827 70%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: 24,
        }}
      >
        <div
          style={{
            textAlign: "center",
            background: "#1a2235",
            border: "1px solid #1e2330",
            borderRadius: 10,
            padding: "16px 24px",
            width: "100%",
            maxWidth: 260,
          }}
        >
          <div style={{ fontSize: 20, marginBottom: 8 }}>🔒</div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#E8DCC8",
              marginBottom: 6,
            }}
          >
            Trend charts Pro
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#6B7280",
              marginBottom: 12,
              lineHeight: 1.5,
            }}
          >
            Unlock 14–90 day trend lines for temperature, pulse, and GQ
            history.
          </div>
          <button
            style={{
              width: "100%",
              padding: "10px 0",
              background: "#C9922A",
              border: "none",
              borderRadius: 7,
              color: "#0d1117",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.05em",
              cursor: "pointer",
            }}
          >
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardClient({
  userId,
  unit,
  todayEntry,
  entries,
  gqResult,
  streak,
  totalEntries,
  daysUntilGQ,
  todayStr,
}: DashboardClientProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const tier = gqResult?.gqTier ?? null;
  const tierC = tier ? tierColor(tier) : "#6B7280";

  const today = new Date();
  const dateDisplay = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const hasTodayEntry = !!todayEntry;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d1117",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#E8DCC8",
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid #1e2330",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          background: "#0d1117",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 50,
              border: "1.5px solid #C9922A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(201,146,42,0.08)",
            }}
          >
            <svg
              width={14}
              height={14}
              viewBox="0 0 14 14"
              fill="none"
            >
              <path
                d="M7 1 L7 7 M7 7 L4 4 M7 7 L10 4"
                stroke="#C9922A"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx={7}
                cy={7}
                r={5.5}
                stroke="#C9922A"
                strokeWidth={1}
                opacity={0.4}
              />
            </svg>
          </div>
          <div>
            <span
              style={{
                fontFamily: "Georgia, serif",
                fontSize: 16,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Ascentgen
            </span>
            <div
              style={{
                fontSize: 11,
                color: "#6B7280",
                letterSpacing: "0.04em",
                marginTop: 2,
              }}
            >
              Track heat. Track rhythm. Ascend.
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Streak pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "rgba(201,146,42,0.1)",
              border: "1px solid rgba(201,146,42,0.3)",
              borderRadius: 20,
              padding: "4px 10px",
              fontSize: 12,
              color: "#C9922A",
              fontWeight: 600,
            }}
          >
            <span>🔥</span>
            <span>{streak} day{streak !== 1 ? "s" : ""}</span>
          </div>

          {/* Tier pill */}
          {tier && (
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: tierC,
                background: `${tierC}18`,
                border: `1px solid ${tierC}40`,
                borderRadius: 20,
                padding: "4px 12px",
              }}
            >
              {tier}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div
        style={{
          maxWidth: 640,
          margin: "0 auto",
          padding: "24px 16px 80px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Date */}
        <div style={{ color: "#6B7280", fontSize: 13 }}>
          {dateDisplay}
        </div>

        {/* GQ section */}
        {gqResult ? (
          <div
            style={{
              background: "#111827",
              border: "1px solid #1e2330",
              borderRadius: 14,
              padding: "32px 24px",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -40,
                left: "50%",
                transform: "translateX(-50%)",
                width: 200,
                height: 200,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${tierC}20 0%, transparent 70%)`,
                pointerEvents: "none",
              }}
            />
            <GQArc score={gqResult.gqScore} tier={gqResult.gqTier} />
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: tierC,
                marginTop: 4,
                marginBottom: 8,
              }}
            >
              {gqResult.gqTier}
            </div>
            <div
              style={{
                fontFamily: "Georgia, serif",
                fontSize: 18,
                color: "#E8DCC8",
                marginBottom: 6,
              }}
            >
              {gqResult.patternLabel}
            </div>
            <div
              style={{
                color: "#6B7280",
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              {tierTagline(gqResult.gqTier)}
            </div>

            {/* Metric pills */}
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "center",
                flexWrap: "wrap",
                marginTop: 20,
              }}
            >
              {[
                {
                  label: "Wk Temp",
                  val: gqResult.avgWakingTemp?.toFixed(1),
                  suffix: "°C avg",
                },
                {
                  label: "PM Temp",
                  val: gqResult.avgPostMealTemp?.toFixed(1),
                  suffix: "°C avg",
                },
                {
                  label: "Wk Pulse",
                  val: gqResult.avgWakingPulse?.toFixed(0),
                  suffix: "bpm avg",
                },
                {
                  label: "PM Pulse",
                  val: gqResult.avgPostMealPulse?.toFixed(0),
                  suffix: "bpm avg",
                },
              ].map((m) => (
                <div
                  key={m.label}
                  style={{
                    background: "#0d1117",
                    border: "1px solid #1e2330",
                    borderRadius: 8,
                    padding: "8px 12px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: "#6B7280",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {m.label}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#E8DCC8",
                      marginTop: 2,
                    }}
                  >
                    {m.val ?? (
                      <span
                        style={{
                          fontSize: 10,
                          color: "#6B7280",
                          fontWeight: 400,
                        }}
                      >
                        {m.suffix}
                      </span>
                    )}{" "}
                    {m.val && m.suffix}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <GQTeaser
            daysUntilGQ={daysUntilGQ}
            totalEntries={totalEntries}
          />
        )}

        {/* Tier bar */}
        {gqResult && <TierBar gqScore={gqResult.gqScore} />}

        {/* Today check-in hint + form */}
        {!hasTodayEntry && (
          <div
            style={{
              fontSize: 12,
              color: "#C9922A",
              marginBottom: 4,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Start here: lock in today&apos;s waking and post-meal readings.
          </div>
        )}

        <TodayCheckInForm
          key={refreshKey}
          userId={userId}
          defaultUnit={unit}
          existingEntry={todayEntry}
          onSaved={() => setRefreshKey((k) => k + 1)}
        />

        <RecentEntries entries={entries} />

        <ProLockedCharts />
      </div>
    </div>
  );
}