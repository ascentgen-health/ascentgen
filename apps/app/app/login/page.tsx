"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/browser";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const buttonLabel = mode === "signin" ? "Enter" : "Create Account";

  async function handleSubmit() {
    setError(null);
    setIsLoading(true);
    try {
      if (mode === "signup") {
        if (password !== confirmPassword) {
          setError("Passwords don't match.");
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/app` },
        });
        if (error) throw error;
        router.push("/onboarding");
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push("/app");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@300;400;500;700&family=Jost:wght@200;300;400&display=swap');

        :root {
          --bg:     #06070E;
          --amber:  #C8841A;
          --amber2: #E4A83C;
          --text:   #EDE4CE;
          --text2:  rgba(237,228,206,0.82);
          --text3:  rgba(237,228,206,0.58);
          --line:   rgba(237,228,206,0.12);
          --line2:  rgba(237,228,206,0.30);
        }

        html, body { margin:0; padding:0; background: var(--bg) !important; }

        body::after {
          content:'';
          position:fixed; inset:0;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events:none; z-index:999;
        }

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes glow {
          0%,100% { opacity:0.5; transform:translate(-50%,-50%) scale(1); }
          50%      { opacity:0.9; transform:translate(-50%,-50%) scale(1.18); }
        }
        @keyframes logoGlow {
          0%,100% { filter: drop-shadow(0 0 6px rgba(228,168,60,.9)) drop-shadow(0 0 18px rgba(200,132,26,.7)) drop-shadow(0 0 40px rgba(200,132,26,.4)); }
          50%      { filter: drop-shadow(0 0 10px rgba(242,196,106,1)) drop-shadow(0 0 28px rgba(228,168,60,.9)) drop-shadow(0 0 60px rgba(200,132,26,.6)); }
        }

        .ag-input {
          display:block; width:100%; box-sizing:border-box;
          background: rgba(237,228,206,0.05);
          border: 1px solid var(--line);
          border-bottom: 1px solid var(--line2);
          border-radius: 2px;
          padding: 14px 18px;
          font-family: 'Jost', sans-serif;
          font-size: 15px;
          font-weight: 300;
          color: var(--text);
          outline: none;
          transition: all 0.25s;
          -webkit-appearance: none;
        }
        .ag-input::placeholder { color: rgba(237,228,206,0.32); letter-spacing:0.04em; }
        .ag-input:focus {
          border-color: rgba(200,132,26,0.55);
          background: rgba(237,228,206,0.07);
        }

        .ag-btn {
          width:100%;
          background: transparent;
          border: 1px solid var(--amber);
          border-radius: 2px;
          padding: 15px 24px;
          font-family: 'Cinzel', serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: var(--amber2);
          cursor: pointer;
          transition: color 0.25s;
          position: relative;
          overflow: hidden;
        }
        .ag-btn::before {
          content:'';
          position:absolute; inset:0;
          background: var(--amber);
          transform: translateX(-100%);
          transition: transform 0.3s ease;
          z-index:0;
        }
        .ag-btn:hover::before { transform: translateX(0); }
        .ag-btn:hover { color: #06070E; }
        .ag-btn span { position:relative; z-index:1; font-weight:700; }
        .ag-btn:disabled { opacity:0.4; cursor:not-allowed; }

        .ag-tab {
          flex:1;
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--line);
          padding: 11px 0;
          font-family: 'Jost', sans-serif;
          font-size: 13px;
          font-weight: 300;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text3);
          cursor: pointer;
          transition: all 0.2s;
        }
        .ag-tab.active {
          color: var(--amber2);
          border-bottom: 1px solid var(--amber);
        }
        .ag-tab:hover:not(.active) { color: var(--text2); }

        .ag-label {
          display:block;
          font-family: 'Jost', sans-serif;
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--text2);
          margin-bottom: 8px;
        }
      `}</style>

      <main style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        position: "relative",
        fontFamily: "'Jost', sans-serif",
      }}>

        {/* ambient radial glow */}
        <div style={{
          position: "absolute",
          width: 420,
          height: 420,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(200,132,26,0.06) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          pointerEvents: "none",
          animation: "glow 6s ease-in-out infinite",
        }} />

        <div style={{
          width: "100%",
          maxWidth: 380,
          position: "relative",
          zIndex: 1,
          animation: "fadeUp 0.9s 0.2s both",
        }}>

          {/* ── Logo + Wordmark ── */}
          <div style={{ textAlign: "center", marginBottom: 44 }}>

            {/* logo image — /logo.png, glowing, same as homepage intro animation */}
            <div style={{
              display: "inline-block",
              marginBottom: 16,
              animation: "logoGlow 3s ease-in-out infinite",
            }}>
              <Image
                src="/logo.png"
                alt="Ascentgen mark"
                width={60}
                height={60}
                style={{ display: "block" }}
              />
            </div>

            {/* wordmark */}
            <div style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 34,
              fontWeight: 400,
              letterSpacing: "0.18em",
              color: "var(--text)",
              textTransform: "uppercase",
              lineHeight: 1,
              marginBottom: 14,
            }}>
              Ascent<span style={{ color: "var(--amber2)" }}>gen</span>
            </div>

            {/* amber rule */}
            <div style={{
              width: 40,
              height: 1,
              background: "linear-gradient(to right, transparent, var(--amber), transparent)",
              margin: "0 auto",
            }} />
          </div>

          {/* ── Mode tabs ── */}
          <div style={{ display: "flex", marginBottom: 30 }}>
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                className={`ag-tab${mode === m ? " active" : ""}`}
                onClick={() => { setMode(m); setError(null); }}
              >
                {m === "signin" ? "Log in" : "Sign up"}
              </button>
            ))}
          </div>

          {/* ── Fields ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 20 }}>

            <div>
              <span className="ag-label">Email</span>
              <input
                className="ag-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                autoComplete="email"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            <div>
              <span className="ag-label">Password</span>
              <input
                className="ag-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            {mode === "signup" && (
              <div style={{ animation: "fadeUp 0.4s both" }}>
                <span className="ag-label">Confirm password</span>
                <input
                  className="ag-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
              </div>
            )}
          </div>

          {/* ── Error message ── */}
          {error && (
            <p style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: 13,
              fontWeight: 300,
              color: "rgba(240,120,100,0.9)",
              letterSpacing: "0.03em",
              textAlign: "center",
              marginBottom: 16,
              marginTop: 0,
            }}>
              {error}
            </p>
          )}

          {/* ── Submit ── */}
          <button
            className="ag-btn"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            <span>{isLoading ? "…" : buttonLabel}</span>
          </button>

          {/* ── Fine print ── */}
          <p style={{
            textAlign: "center",
            fontSize: 11,
            fontFamily: "'Jost', sans-serif",
            fontWeight: 300,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(237,228,206,0.32)",
            marginTop: 36,
            marginBottom: 0,
          }}>
            ascentgen.health is not medical advice.
          </p>

        </div>
      </main>
    </>
  );
}