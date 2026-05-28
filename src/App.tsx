import { useState, useEffect, useRef, useCallback } from "react";

/* ── MOTION HOOKS ─────────────────────────────────────── */
const useInView = (threshold = 0.12) => {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return [ref, v];
};

const FadeUp = ({ children, delay = 0, style = {} }) => {
  const [r, v] = useInView();
  return <div ref={r} style={{ opacity: v ? 1 : 0, transform: v ? "none" : "translateY(44px)", transition: `opacity .95s cubic-bezier(.22,1,.36,1) ${delay}s, transform .95s cubic-bezier(.22,1,.36,1) ${delay}s`, ...style }}>{children}</div>;
};
const FadeIn = ({ children, delay = 0, style = {} }) => {
  const [r, v] = useInView();
  return <div ref={r} style={{ opacity: v ? 1 : 0, transition: `opacity 1.1s ease ${delay}s`, ...style }}>{children}</div>;
};
const SlideIn = ({ children, delay = 0, from = "left", style = {} }) => {
  const [r, v] = useInView();
  return <div ref={r} style={{ opacity: v ? 1 : 0, transform: v ? "none" : `translateX(${from === "left" ? "-56px" : "56px"})`, transition: `opacity 1s cubic-bezier(.22,1,.36,1) ${delay}s, transform 1s cubic-bezier(.22,1,.36,1) ${delay}s`, ...style }}>{children}</div>;
};

/* ── DESIGN TOKENS ───────────────────────────────────── */
const C = {
  bg: "#040404", bg2: "#060606", bg3: "#0a0a0a", bg4: "#0d0d0d",
  border: "#141414", border2: "#1c1c1c", border3: "#222",
  text: "#e8e2d6", text2: "#c8c2b8", text3: "#5a5a5a", text4: "#3a3a3a", text5: "#2a2a2a",
  gold: "#8a7548", gold2: "#c9b87a", gold3: "#d4c088", gold4: "#f0dfa0",
};

const useViewport = () => {
  const getWidth = () => (typeof window === "undefined" ? 1440 : window.innerWidth);
  const [width, setWidth] = useState(getWidth);

  useEffect(() => {
    const onResize = () => setWidth(getWidth());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return {
    width,
    isPhone: width <= 640,
    isMobile: width <= 760,
    isTablet: width <= 1024,
  };
};

/* ── SHARED COMPONENTS ───────────────────────────────── */
const Eyebrow = ({ children, style = {} }) => (
  <div style={{ fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: C.gold, marginBottom: 18, display: "flex", alignItems: "center", gap: 12, ...style }}>
    <span style={{ width: 24, height: 1, background: C.gold, opacity: .5, display: "block" }} />
    {children}
  </div>
);
const SectionTitle = ({ children, style = {} }) => (
  <h2 style={{ fontFamily: "Georgia,'Times New Roman',serif", fontSize: "clamp(32px,4vw,54px)", fontWeight: 400, color: C.text, lineHeight: 1.08, ...style }}>{children}</h2>
);
const Gold = ({ children }) => <span style={{ color: C.gold2, fontStyle: "italic" }}>{children}</span>;

const GoldBtn = ({ children, onClick, full }) => {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      background: h ? C.gold3 : C.gold2, color: C.bg, padding: "13px 34px",
      fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600,
      cursor: "pointer", border: "none", fontFamily: "inherit", width: full ? "100%" : "auto",
      transition: "all .25s cubic-bezier(.22,1,.36,1)", transform: h ? "translateY(-2px)" : "none",
      boxShadow: h ? "0 8px 28px rgba(201,184,122,0.18)" : "none"
    }}>{children}</button>
  );
};
const GhostBtn = ({ children, onClick }) => {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      background: "transparent", color: h ? C.gold2 : C.text3,
      padding: "13px 34px", fontSize: 11, letterSpacing: "0.14em",
      textTransform: "uppercase", fontWeight: 400, cursor: "pointer",
      border: `1px solid ${h ? C.border3 : C.border2}`, fontFamily: "inherit",
      transition: "all .25s cubic-bezier(.22,1,.36,1)", transform: h ? "translateY(-2px)" : "none"
    }}>{children}</button>
  );
};

/* ── PARTICLE CANVAS ─────────────────────────────────── */
const ParticleCanvas = ({ count = 50, opacity = 0.8 }) => {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const resize = () => { c.width = c.offsetWidth; c.height = c.offsetHeight; };
    resize(); window.addEventListener("resize", resize);
    const pts = Array.from({ length: count }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      vx: (Math.random() - .5) * .28, vy: (Math.random() - .5) * .28,
      r: Math.random() * 1.4 + .4
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > c.width) p.vx *= -1;
        if (p.y < 0 || p.y > c.height) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(138,117,72,0.4)"; ctx.fill();
      });
      pts.forEach((a, i) => pts.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 130) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(138,117,72,${.07 * (1 - d / 130)})`; ctx.lineWidth = .5; ctx.stroke();
        }
      }));
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [count]);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity }} />;
};

/* ── MARQUEE ─────────────────────────────────────────── */
const Marquee = () => {
  const items = ["Precision Web Architecture", "Agentic Social Triage", "Autonomous Lead Conversion", "Swiss Minimalist Design", "Intent-Detection Systems", "Closed-Loop Optimization"];
  return (
    <div style={{ overflow: "hidden", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, background: "#030303", padding: "15px 0" }}>
      <div style={{ display: "flex", gap: 60, animation: "marquee 26s linear infinite", whiteSpace: "nowrap", width: "max-content" }}>
        {[...items, ...items].map((t, i) => (
          <span key={i} style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: C.text5, display: "flex", alignItems: "center", gap: 14 }}>
            {t}<span style={{ color: C.gold, fontSize: 6 }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
};

/* ── NAV ─────────────────────────────────────────────── */
const Nav = ({ page, setPage, scrollY }) => {
  const scrolled = scrollY > 20;
  const { isPhone, isMobile, isTablet } = useViewport();

  return (
    <div
      style={{
        position: "fixed",
        top: isMobile ? 14 : 24,
        left: "50%",
        transform: "translateX(-50%)",

        width: isMobile ? "calc(100% - 24px)" : isTablet ? "calc(100% - 40px)" : "calc(100% - 64px)",
        maxWidth: 1380,

        zIndex: 500,

        transition: "all .45s cubic-bezier(.22,1,.36,1)",
      }}
    >
      <nav
        style={{
          minHeight: isPhone ? 64 : 76,

          padding: isPhone ? "12px 14px" : isTablet ? "0 22px" : "0 34px",

          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",

          borderRadius: isPhone ? 18 : 24,

          background: scrolled
            ? "rgba(10,10,10,0.42)"
            : "rgba(255,255,255,0.03)",

          backdropFilter: "blur(22px)",

          border: scrolled
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid rgba(255,255,255,0.06)",

          boxShadow: scrolled
            ? "0 10px 40px rgba(0,0,0,0.32)"
            : "0 4px 30px rgba(0,0,0,0.18)",

          transition: "all .45s cubic-bezier(.22,1,.36,1)",
        }}
      >
        {/* LOGO */}
        <button
          onClick={() => setPage("home")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",

            fontFamily: "Inter, sans-serif",
            fontSize: isPhone ? 16 : 18,
            fontWeight: 600,

            letterSpacing: "-0.03em",

            color: "#ffffff",

            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: C.gold2,

              boxShadow: "0 0 20px rgba(201,184,122,0.7)",
            }}
          />

          NEXORA

          <span
            style={{
              color: C.gold2,
              fontWeight: 500,
            }}
          >
            AI
          </span>
        </button>

        {/* LINKS */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: isPhone ? 16 : isTablet ? 18 : 34,
            flexWrap: "nowrap",
            justifyContent: "flex-end",
          }}
        >
          {[
            ["Home", "home"],
            ["About", "about"],
            ["Contact", "contact"],
          ].map(([label, key]) => (
            <button
              key={key}
              onClick={() => setPage(key)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",

                color:
                  page === key
                    ? "#ffffff"
                    : "rgba(255,255,255,0.55)",

                fontSize: isPhone ? 11 : 13,
                fontWeight: 500,

                letterSpacing: isPhone ? "0.04em" : "0.08em",

                transition: "all .25s ease",

                position: "relative",

                padding: "8px 0",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color =
                  page === key
                    ? "#fff"
                    : "rgba(255,255,255,0.55)";
              }}
            >
              {label}

              <span
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: 0,

                  width: page === key ? "100%" : "0%",

                  height: 1,

                  background:
                    "linear-gradient(to right, transparent, #c9b87a, transparent)",

                  transition:
                    "width .35s cubic-bezier(.22,1,.36,1)",
                }}
              />
            </button>
          ))}

          {/* CTA */}
          <button
            onClick={() => setPage("contact")}
            style={{
              height: isPhone ? 38 : 44,
              display: isPhone ? "none" : "block",

              padding: isPhone ? "0 14px" : "0 22px",

              borderRadius: 999,

              border: "1px solid rgba(255,255,255,0.08)",

              background:
                "linear-gradient(135deg, rgba(201,184,122,0.18), rgba(201,184,122,0.08))",

              color: "#fff",

              fontSize: isPhone ? 10 : 11,
              fontWeight: 600,

              letterSpacing: isPhone ? "0.08em" : "0.14em",
              textTransform: "uppercase",

              cursor: "pointer",

              backdropFilter: "blur(10px)",

              transition: "all .28s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform =
                "translateY(-2px)";
              e.currentTarget.style.background =
                "linear-gradient(135deg, rgba(201,184,122,0.3), rgba(201,184,122,0.14))";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform =
                "translateY(0px)";
              e.currentTarget.style.background =
                "linear-gradient(135deg, rgba(201,184,122,0.18), rgba(201,184,122,0.08))";
            }}
          >
            Start Project
          </button>
        </div>
      </nav>
    </div>
  );
};
/* ── FOOTER ──────────────────────────────────────────── */
const Footer = ({ setPage }) => {
  const year = 2026;
  const { isPhone, isTablet } = useViewport();
  return (
    <footer style={{ background: C.bg, borderTop: `1px solid ${C.border}`, padding: isPhone ? "48px 20px 30px" : isTablet ? "56px 36px 34px" : "60px 52px 36px" }}>
      <div style={{ display: "grid", gridTemplateColumns: isPhone ? "1fr" : isTablet ? "1.4fr 1fr 1fr" : "1.6fr 1fr 1fr", gap: isPhone ? 32 : 60, marginBottom: isPhone ? 36 : 48 }}>
        <div>
          <div style={{ fontFamily: "Georgia,serif", fontSize: 17, color: C.text, marginBottom: 14, letterSpacing: "0.04em" }}>NEXORA <span style={{ color: C.gold }}>AI</span></div>
          <p style={{ fontSize: 13, color: C.text5, lineHeight: 1.8, fontWeight: 300, maxWidth: 270 }}>Merging social traffic with elite engineering. Precision AI architecture for the modern web.</p>
        </div>
        <div>
          <h5 style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: C.text5, marginBottom: 18 }}>Navigation</h5>
          {[["Home","home"],["About","about"],["Contact","contact"]].map(([l, k]) => (
            <button key={k} onClick={() => setPage(k)} style={{ display: "block", fontSize: 13, color: C.text4, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", marginBottom: 10, padding: 0, transition: "color .2s", textAlign: "left" }}
              onMouseEnter={e => e.currentTarget.style.color = C.gold2}
              onMouseLeave={e => e.currentTarget.style.color = C.text4}>{l}</button>
          ))}
        </div>
        <div>
          <h5 style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: C.text5, marginBottom: 18 }}>Connect</h5>
          {[["LinkedIn", "https://linkedin.com"], ["Twitter / X", "https://twitter.com"], ["Instagram", "https://www.instagram.com/nexora.ai.agency.in"]].map(([l, h]) => (
            <a key={l} href={h} style={{ display: "block", fontSize: 13, color: C.text4, textDecoration: "none", marginBottom: 10, transition: "color .2s" }}
              onMouseEnter={e => e.target.style.color = C.gold2} onMouseLeave={e => e.target.style.color = C.text4}>{l}</a>
          ))}
        </div>
      </div>
      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 26, display: "flex", justifyContent: "space-between", gap: 16, flexDirection: isPhone ? "column" : "row" }}>
        <span style={{ fontSize: 11, color: C.text5, letterSpacing: "0.1em" }}>© {year} NEXORA AI. ALL RIGHTS RESERVED.</span>
        <span style={{ fontSize: 11, color: C.text5, fontFamily: "Georgia,serif" }}>GEN: V2.0.0</span>
      </div>
    </footer>
  );
};

/* ════════════════════════════════════════════════════════
   PAGE: HOME
════════════════════════════════════════════════════════ */
const HomePage = ({ setPage }) => {
  const [m, setM] = useState(false);
  const { isPhone, isMobile, isTablet } = useViewport();
  useEffect(() => { const t = setTimeout(() => setM(true), 120); return () => clearTimeout(t); }, []);

  const anim = (delay) => ({
    opacity: m ? 1 : 0, transform: m ? "none" : "translateY(36px)",
    transition: `all 1s cubic-bezier(.22,1,.36,1) ${delay}s`
  });

  const methods = [
    ["01", "Traffic Triage", "Intent-detection agents monitor and qualify inbound social leads instantly, ensuring no high-value conversation is ever missed. Every signal captured, scored, acted upon."],
    ["02", "Custom Architecture", "Prospects are routed to a lightning-fast, high-converting AI web experience tailored to their specific intent profile. Design and function unified under one philosophy."],
    ["03", "Autonomous Scale", "24/7 optimization data synchronizes directly with client dashboards, creating a closed-loop system of continuous improvement. The machine never sleeps."],
    ["04", "Measurable ROI", "Every system engineered for measurable return. Performance-optimized digital environments where every component earns its place through conversion impact."],
  ];

  const tiers = [
    { num: "01", label: "Foundation", name: "Single Page Site", tagline: "The Foundation", price: "₹5,000", unit: "/ project", features: ["Custom Responsive Architecture", "Core Brand Narrative", "Essential Lead Capture", "Mobile-First Engineering"], featured: false },
    { num: "02", label: "Hub", name: "Multi Page Site", tagline: "The Hub", price: "₹10,000", unit: "/ project", features: ["3-Page Core Architecture", "Advanced UI Grid Interactions", "Automated Layout Alignment", "Custom AI Integration", "Intent-Detection Engine"], featured: true },
    { num: "03", label: "Ecosystem", name: "Autonomous System", tagline: "The Ecosystem", price: "₹20k–30k", unit: "/ varies", features: ["Custom Full-Stack Architecture", "Frontend AI Agents", "Intent-Detection UI Mockups", "Deep Workflow Automations", "Bespoke Autonomous Agents"], featured: false },
  ];

  return (
    <div>
      {/* HERO */}
<section
  style={{
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(180deg,#071018 0%, #05070b 45%, #040404 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: isPhone ? "118px 20px 74px" : isTablet ? "132px 36px 90px" : "140px 52px 100px",
  }}
>
  {/* VIDEO BACKGROUND */}
  <div
    style={{
      position: "absolute",
      inset: 0,
      zIndex: 0,
    }}
  >
    <video
      autoPlay
      muted
      loop
      playsInline
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        objectFit: "cover",
        opacity: 0.42,
        filter: "brightness(0.72) contrast(1.12) saturate(1.1)",
      }}
    >
      <source src="/hero-bg.mp4" type="video/mp4" />
    </video>

    {/* TOP NAVBAR BLEND */}
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: isPhone ? 138 : 180,
        background:
          "linear-gradient(to bottom, rgba(4,4,4,0.92), rgba(4,4,4,0))",
        zIndex: 2,
      }}
    />

    {/* BOTTOM DEPTH */}
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "45%",
        background:
          "linear-gradient(to bottom, transparent, rgba(4,4,4,0.96))",
        zIndex: 2,
      }}
    />

    {/* LEFT GLOW */}
    <div
      style={{
        position: "absolute",
        width: isPhone ? 360 : 700,
        height: isPhone ? 360 : 700,
        borderRadius: "50%",
        background: "rgba(96,165,250,0.12)",
        filter: "blur(120px)",
        top: -180,
        left: -240,
        zIndex: 1,
      }}
    />

    {/* RIGHT GOLD GLOW */}
    <div
      style={{
        position: "absolute",
        width: isPhone ? 340 : 600,
        height: isPhone ? 340 : 600,
        borderRadius: "50%",
        background: "rgba(201,184,122,0.12)",
        filter: "blur(120px)",
        bottom: -180,
        right: -120,
        zIndex: 1,
      }}
    />

    {/* GLOBAL OVERLAY */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(circle at center, rgba(255,255,255,0.03), rgba(0,0,0,0.75))",
        zIndex: 2,
      }}
    />
  </div>

  {/* HERO CONTENT */}
  <div
    style={{
      position: "relative",
      zIndex: 10,
      width: "100%",
      maxWidth: 1280,
      margin: "0 auto",
      textAlign: "center",
    }}
  >
    {/* EYEBROW */}
    <div
      style={{
        ...anim(0.2),
        display: "inline-flex",
        alignItems: "center",
        gap: isPhone ? 10 : 14,
        padding: isPhone ? "9px 13px" : "10px 18px",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(14px)",
        borderRadius: 999,
        marginBottom: 34,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "#c9b87a",
          boxShadow: "0 0 14px rgba(201,184,122,0.8)",
        }}
      />

      <span
        style={{
          fontSize: isPhone ? 9 : 11,
          letterSpacing: isPhone ? "0.14em" : "0.24em",
          textTransform: "uppercase",
          color: "#d6c089",
          fontWeight: 500,
        }}
      >
        Agentic Intelligence Framework
      </span>
    </div>

    {/* MAIN HEADING */}
    <h1
      style={{
        ...anim(0.45),
        fontFamily: "Georgia, serif",
        fontSize: isPhone ? "clamp(44px,13vw,58px)" : "clamp(58px,8vw,108px)",
        lineHeight: isPhone ? 1 : 0.95,
        fontWeight: 400,
        color: "#f5f1e8",
        letterSpacing: isPhone ? "-0.035em" : "-0.05em",
        maxWidth: 980,
        margin: "0 auto",
        textShadow: "0 20px 80px rgba(0,0,0,0.45)",
      }}
    >
      Automating Inbound.
      <br />
      <span
        style={{
          color: "#d6c089",
          fontStyle: "italic",
        }}
      >
        Engineering Prestige.
      </span>
    </h1>

    {/* SUBTEXT */}
    <p
      style={{
        ...anim(0.7),
        margin: isPhone ? "28px auto 38px" : "34px auto 52px",
        maxWidth: 680,
        fontSize: isPhone ? 15 : 18,
        lineHeight: isPhone ? 1.75 : 1.9,
        color: "rgba(255,255,255,0.72)",
        fontWeight: 300,
      }}
    >
      Nexora AI merges elite web engineering with autonomous
      social-intelligence systems to create digital ecosystems
      designed for conversion, authority, and scale.
    </p>

    {/* BUTTONS */}
    <div
      style={{
        ...anim(0.95),
        display: "flex",
        justifyContent: "center",
        gap: isPhone ? 12 : 18,
        flexWrap: "wrap",
        marginBottom: isPhone ? 46 : 80,
      }}
    >
      <button
        style={{
          padding: isPhone ? "15px 20px" : "16px 34px",
          width: isPhone ? "100%" : "auto",
          borderRadius: 14,
          border: "none",
          background:
            "linear-gradient(135deg,#e8d39a 0%, #b89b57 100%)",
          color: "#050505",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          cursor: "pointer",
          boxShadow: "0 20px 40px rgba(201,184,122,0.24)",
          transition: "all .3s ease",
        }}
      >
        Book Consultation
      </button>

      <button
        style={{
          padding: isPhone ? "15px 20px" : "16px 34px",
          width: isPhone ? "100%" : "auto",
          borderRadius: 14,
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(14px)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "#ffffffcc",
          fontSize: 12,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          cursor: "pointer",
        }}
      >
        View Systems
      </button>
    </div>

    {/* STATS */}
<div
  style={{
    ...anim(1.1),
    display: "flex",
    justifyContent: "center",
    gap: isPhone ? 12 : 24,
    flexWrap: "wrap",
    marginTop: 40,
  }}
>
  {[
    ["24/7", "Autonomous Systems Active"],
    ["148ms", "Global Response Time"],
    ["AI Sync", "Realtime Intent Mapping"],
  ].map(([title, desc], i) => (
    <div
      key={i}
      style={{
        minWidth: isPhone ? "100%" : 220,
        padding: isPhone ? "18px 18px" : "22px 26px",
        borderRadius: isPhone ? 18 : 26,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(22px)",
        boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
      }}
    >
      <div
        style={{
          fontSize: 28,
          color: "#e7d19a",
          fontFamily: "Georgia,serif",
          marginBottom: 6,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.55)",
        }}
      >
        {desc}
      </div>
    </div>
  ))}
</div>
  </div>

  {/* SCROLL INDICATOR */}
  <div
    style={{
      position: "absolute",
      bottom: 34,
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 10,
      zIndex: 10,
    }}
  >
    <div
      style={{
        width: 1,
        height: 46,
        background:
          "linear-gradient(to bottom, transparent, rgba(255,255,255,0.6))",
      }}
    />

    <span
      style={{
        fontSize: 10,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.4)",
      }}
    >
      Scroll
    </span>
  </div>
</section>

      <Marquee />

 {/* METHODOLOGY — ULTRA PREMIUM */}
<section
  style={{
    position: "relative",
    padding: isPhone ? "88px 20px" : isTablet ? "112px 36px" : "140px 64px",
    background:
      "radial-gradient(circle at top left, rgba(166,124,58,0.06), transparent 30%), #060606",
    borderTop: `1px solid rgba(255,255,255,0.06)`,
    overflow: "hidden",
  }}
>
  {/* Ambient Glow */}
  <div
    style={{
      position: "absolute",
      top: -180,
      left: -120,
      width: 500,
      height: 500,
      borderRadius: "50%",
      background: "rgba(166,124,58,0.06)",
      filter: "blur(120px)",
      pointerEvents: "none",
    }}
  />

  <div
    style={{
      position: "absolute",
      bottom: -200,
      right: -120,
      width: 480,
      height: 480,
      borderRadius: "50%",
      background: "rgba(255,255,255,0.025)",
      filter: "blur(120px)",
      pointerEvents: "none",
    }}
  />

  {/* Tiny Grid Texture */}
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage:
        "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
      backgroundSize: "80px 80px",
      opacity: 0.18,
      pointerEvents: "none",
    }}
  />

  <div style={{ position: "relative", zIndex: 2 }}>
    {/* Header */}
    <FadeUp>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: 42,
            height: 1,
            background:
              "linear-gradient(to right, transparent, rgba(166,124,58,0.8))",
          }}
        />

        <Eyebrow
          style={{
            color: "#A67C3A",
            letterSpacing: "0.28em",
            fontSize: 11,
          }}
        >
          The Methodology
        </Eyebrow>

        <div
          style={{
            width: 42,
            height: 1,
            background:
              "linear-gradient(to left, transparent, rgba(166,124,58,0.8))",
          }}
        />
      </div>
    </FadeUp>

    <FadeUp delay={0.1}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: isTablet ? "flex-start" : "flex-end",
          flexDirection: isTablet ? "column" : "row",
          gap: isTablet ? 24 : 40,
          marginBottom: isPhone ? 48 : 90,
        }}
      >
        <SectionTitle
          style={{
            margin: 0,
            fontSize: isPhone ? "clamp(34px,11vw,46px)" : "clamp(44px,5vw,82px)",
            lineHeight: 1.02,
            letterSpacing: "-0.045em",
            maxWidth: 760,
          }}
        >
          How We Architect
          <br />
          <Gold
            style={{
              fontStyle: "italic",
              background:
                "linear-gradient(135deg, #E7D7B0 0%, #A67C3A 45%, #F5E6B8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            the Inbound Engine
          </Gold>
        </SectionTitle>

        <FadeIn delay={0.2}>
          <div
            style={{
              maxWidth: 300,
              paddingBottom: 12,
            }}
          >
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.9,
                color: "rgba(255,255,255,0.45)",
                fontWeight: 300,
                margin: 0,
                textAlign: isTablet ? "left" : "right",
              }}
            >
              Every workflow engineered with precision, behavioral
              intelligence, and cinematic digital execution.
            </p>
          </div>
        </FadeIn>
      </div>
    </FadeUp>

    {/* Premium Cards Grid */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(2,1fr)",
        gap: isPhone ? 18 : 28,
      }}
    >
      {methods.map(([num, title, desc], i) => (
        <div
          key={i}
          style={{
            position: "relative",
            padding: isPhone ? "30px 24px" : "42px",
            minHeight: isPhone ? 260 : 300,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px)",
            overflow: "hidden",
            transition: "all .45s ease",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-10px)";
            e.currentTarget.style.border =
              "1px solid rgba(166,124,58,0.35)";
            e.currentTarget.style.boxShadow =
              "0 30px 80px rgba(0,0,0,0.45)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0px)";
            e.currentTarget.style.border =
              "1px solid rgba(255,255,255,0.08)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {/* Gold Accent */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: 1,
              background:
                "linear-gradient(to right, transparent, rgba(166,124,58,0.9), transparent)",
            }}
          />

          {/* Giant Number */}
          <div
            style={{
              position: "absolute",
              top: 20,
              right: 26,
              fontSize: isPhone ? 70 : 90,
              fontWeight: 600,
              color: "rgba(255,255,255,0.03)",
              letterSpacing: "-0.06em",
              lineHeight: 1,
              fontFamily: "Georgia, serif",
            }}
          >
            {num}
          </div>

          {/* Small Label */}
          <div
            style={{
              marginBottom: 34,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 34,
                height: 1,
                background: "rgba(166,124,58,0.7)",
              }}
            />

            <span
              style={{
                fontSize: 11,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: "#A67C3A",
              }}
            >
              Phase {num}
            </span>
          </div>

          {/* Title */}
          <h3
            style={{
              fontSize: isPhone ? 28 : 34,
              lineHeight: 1.08,
              marginBottom: 22,
              color: "#F5F5F2",
              fontWeight: 400,
              maxWidth: 420,
              letterSpacing: "-0.03em",
              fontFamily: "Georgia, serif",
            }}
          >
            {title}
          </h3>

          {/* Description */}
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.95,
              color: "rgba(255,255,255,0.48)",
              fontWeight: 300,
              maxWidth: 470,
            }}
          >
            {desc}
          </p>

          {/* Bottom Hover Glow */}
          <div
            style={{
              position: "absolute",
              bottom: -100,
              left: "50%",
              transform: "translateX(-50%)",
              width: 240,
              height: 240,
              borderRadius: "50%",
              background: "rgba(166,124,58,0.08)",
              filter: "blur(90px)",
              pointerEvents: "none",
            }}
          />
        </div>
      ))}
    </div>
  </div>
</section>

    {/* ENGAGEMENT TIERS — ULTRA PREMIUM */}
<section
  style={{
    position: "relative",
    padding: isPhone ? "88px 20px" : isTablet ? "112px 36px" : "140px 64px",
    background:
      "radial-gradient(circle at top right, rgba(166,124,58,0.07), transparent 30%), #050505",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    overflow: "hidden",
  }}
>
  {/* Ambient Background */}
  <div
    style={{
      position: "absolute",
      top: -220,
      right: -120,
      width: 520,
      height: 520,
      borderRadius: "50%",
      background: "rgba(166,124,58,0.07)",
      filter: "blur(140px)",
      pointerEvents: "none",
    }}
  />

  <div
    style={{
      position: "absolute",
      bottom: -200,
      left: -120,
      width: 420,
      height: 420,
      borderRadius: "50%",
      background: "rgba(255,255,255,0.025)",
      filter: "blur(120px)",
      pointerEvents: "none",
    }}
  />

  {/* Grid Texture */}
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage:
        "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
      backgroundSize: "80px 80px",
      opacity: 0.16,
      pointerEvents: "none",
    }}
  />

  <div style={{ position: "relative", zIndex: 2 }}>
    {/* Header */}
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: isTablet ? "flex-start" : "flex-end",
        flexDirection: isTablet ? "column" : "row",
        gap: isTablet ? 24 : 60,
        marginBottom: isPhone ? 52 : 90,
      }}
    >
      <div>
        <FadeUp>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 26,
            }}
          >
            <div
              style={{
                width: 40,
                height: 1,
                background:
                  "linear-gradient(to right, transparent, rgba(166,124,58,0.85))",
              }}
            />

            <Eyebrow
              style={{
                color: "#A67C3A",
                letterSpacing: "0.28em",
                fontSize: 11,
              }}
            >
              Engagement Tiers
            </Eyebrow>

            <div
              style={{
                width: 40,
                height: 1,
                background:
                  "linear-gradient(to left, transparent, rgba(166,124,58,0.85))",
              }}
            />
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          <SectionTitle
            style={{
              fontSize: isPhone ? "clamp(36px,11vw,48px)" : "clamp(48px,5vw,84px)",
              lineHeight: 1.02,
              letterSpacing: "-0.05em",
              margin: 0,
              maxWidth: 760,
            }}
          >
            Select Your
            <br />
            <Gold
              style={{
                fontStyle: "italic",
                background:
                  "linear-gradient(135deg, #F3E7C7 0%, #A67C3A 45%, #F6E7BB 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Architecture
            </Gold>
          </SectionTitle>
        </FadeUp>
      </div>

      <FadeIn delay={0.3}>
        <div
          style={{
            maxWidth: 320,
            paddingBottom: 10,
          }}
        >
          <p
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.46)",
              lineHeight: 1.9,
              fontWeight: 300,
              textAlign: isTablet ? "left" : "right",
              margin: 0,
            }}
          >
            Structured for founders, luxury brands, and modern businesses
            scaling toward premium digital dominance.
          </p>
        </div>
      </FadeIn>
    </div>

    {/* Premium Tier Cards */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isTablet ? "1fr" : "repeat(3,1fr)",
        gap: isPhone ? 18 : 30,
      }}
    >
      {tiers.map((t, i) => (
        <div
          key={i}
          style={{
            position: "relative",
            padding: isPhone ? "34px 24px" : "46px 38px",
            minHeight: isPhone ? 0 : isTablet ? 520 : 620,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background:
              i === 1
                ? "linear-gradient(180deg, rgba(166,124,58,0.13), rgba(255,255,255,0.03))"
                : "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))",
            border:
              i === 1
                ? "1px solid rgba(166,124,58,0.25)"
                : "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(24px)",
            overflow: "hidden",
            transition: "all .45s ease",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-12px)";
            e.currentTarget.style.boxShadow =
              "0 35px 90px rgba(0,0,0,0.45)";
            e.currentTarget.style.border =
              "1px solid rgba(166,124,58,0.38)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0px)";
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.border =
              i === 1
                ? "1px solid rgba(166,124,58,0.25)"
                : "1px solid rgba(255,255,255,0.08)";
          }}
        >
          {/* Gold Top Line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: 1,
              background:
                "linear-gradient(to right, transparent, rgba(166,124,58,0.95), transparent)",
            }}
          />

          {/* Featured Badge */}
          {i === 1 && (
            <div
              style={{
                position: "absolute",
                top: isPhone ? 18 : 24,
                right: isPhone ? 18 : 24,
                padding: "8px 14px",
                border: "1px solid rgba(166,124,58,0.35)",
                background: "rgba(166,124,58,0.08)",
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#D9BE84",
              }}
            >
              Most Elite
            </div>
          )}

          {/* Top Content */}
          <div>
            {/* Tiny Label */}
            <div
              style={{
                marginBottom: 30,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 1,
                  background: "rgba(166,124,58,0.8)",
                }}
              />

              <span
                style={{
                  fontSize: 11,
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                  color: "#A67C3A",
                }}
              >
                Tier {i + 1}
              </span>
            </div>

            {/* Tier Name */}
            <h3
              style={{
                fontSize: isPhone ? 31 : 40,
                lineHeight: 1,
                color: "#F6F3EE",
                marginBottom: 20,
                fontWeight: 400,
                letterSpacing: "-0.04em",
                fontFamily: "Georgia, serif",
              }}
            >
              {t.name}
            </h3>

            {/* Price */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 10,
                marginBottom: 34,
              }}
            >
              <span
                style={{
                  fontSize: isPhone ? 38 : 54,
                  fontFamily: "Georgia, serif",
                  color: "#D8BE86",
                  lineHeight: 1,
                }}
              >
                {t.price}
              </span>

              <span
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.35)",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Starting
              </span>
            </div>

            {/* Description */}
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.95,
                color: "rgba(255,255,255,0.48)",
                fontWeight: 300,
                marginBottom: 40,
              }}
            >
              {t.desc}
            </p>

            {/* Features */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              {t.features.map((f, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "#A67C3A",
                      boxShadow: "0 0 12px rgba(166,124,58,0.7)",
                    }}
                  />

                  <span
                    style={{
                      fontSize: 14,
                      color: "rgba(255,255,255,0.72)",
                      letterSpacing: "0.01em",
                    }}
                  >
                    {f}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div style={{ marginTop: 50 }}>
            <button
              onClick={() => setPage("contact")}
              style={{
                width: "100%",
                padding: "18px 24px",
                background:
                  i === 1
                    ? "linear-gradient(135deg, #C8A96B, #8E6730)"
                    : "transparent",
                border:
                  i === 1
                    ? "none"
                    : "1px solid rgba(255,255,255,0.12)",
                color: i === 1 ? "#050505" : "#F5F5F2",
                fontSize: 12,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all .35s ease",
                fontWeight: 500,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.letterSpacing = "0.26em";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0px)";
                e.currentTarget.style.letterSpacing = "0.22em";
              }}
            >
              Begin Engagement
            </button>
          </div>

          {/* Glow */}
          <div
            style={{
              position: "absolute",
              bottom: -100,
              left: "50%",
              transform: "translateX(-50%)",
              width: 260,
              height: 260,
              borderRadius: "50%",
              background: "rgba(166,124,58,0.08)",
              filter: "blur(90px)",
              pointerEvents: "none",
            }}
          />
        </div>
      ))}
    </div>
  </div>
</section>
   
      {/* CTA BANNER */}
      <CtaBanner setPage={setPage} />
    </div>
  );
};

const MethodCard = ({ num, title, desc, i, total }) => {
  const [h, setH] = useState(false);
  const [r, v] = useInView();
  const col = i % 2, row = Math.floor(i / 2), rows = Math.ceil(total / 2);
  return (
    <div ref={r} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      padding: "46px 44px", position: "relative", overflow: "hidden",
      borderRight: col === 0 ? `1px solid ${C.border}` : "none",
      borderBottom: row < rows - 1 ? `1px solid ${C.border}` : "none",
      background: h ? C.bg4 : "transparent",
      transition: `background .4s ease, opacity .85s cubic-bezier(.22,1,.36,1) ${i * .1}s, transform .85s cubic-bezier(.22,1,.36,1) ${i * .1}s`,
      opacity: v ? 1 : 0, transform: v ? "none" : "translateY(32px)"
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: h ? "100%" : "0%", height: 1, background: `linear-gradient(to right, ${C.gold}, transparent)`, transition: "width .65s cubic-bezier(.22,1,.36,1)" }} />
      <div style={{ fontSize: 11, color: C.gold, letterSpacing: "0.12em", marginBottom: 24, fontFamily: "Georgia,serif" }}>{num}</div>
      <h3 style={{ fontFamily: "Georgia,serif", fontSize: 22, fontWeight: 400, color: h ? C.text : C.text2, marginBottom: 14, transition: "color .3s" }}>{title}</h3>
      <p style={{ fontSize: 14, color: C.text4, lineHeight: 1.85, fontWeight: 300 }}>{desc}</p>
      <div style={{ position: "absolute", top: 44, right: 44, width: 20, height: 1, background: C.gold, opacity: h ? .7 : .2, transition: "opacity .3s" }} />
    </div>
  );
};

const TierCard = ({ tier, i, setPage }) => {
  const [h, setH] = useState(false);
  const [r, v] = useInView();
  return (
    <div ref={r} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      padding: "42px 38px", borderRight: i < 2 ? `1px solid ${C.border}` : "none",
      background: tier.featured ? C.bg3 : (h ? "#080808" : "transparent"),
      transition: `background .4s ease, opacity .9s cubic-bezier(.22,1,.36,1) ${i * .12}s, transform .9s cubic-bezier(.22,1,.36,1) ${i * .12}s`,
      opacity: v ? 1 : 0, transform: v ? "none" : "translateY(40px)",
      display: "flex", flexDirection: "column"
    }}>
      {tier.featured && <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: C.gold, border: `1px solid rgba(138,117,72,.3)`, padding: "5px 12px", width: "fit-content", marginBottom: 18 }}>Most Selected</div>}
      <div style={{ fontSize: 10, color: C.text5, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 26 }}>Tier {tier.num} / {tier.label}</div>
      <h3 style={{ fontFamily: "Georgia,serif", fontSize: 23, fontWeight: 400, color: C.text, marginBottom: 5 }}>{tier.name}</h3>
      <div style={{ fontSize: 13, color: C.text4, fontStyle: "italic", fontFamily: "Georgia,serif", marginBottom: 28 }}>{tier.tagline}</div>
      <ul style={{ listStyle: "none", flex: 1, marginBottom: 30 }}>
        {tier.features.map((f, j) => (
          <li key={j} style={{ fontSize: 13, color: C.text4, padding: "10px 0", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, fontWeight: 300 }}>
            <span style={{ width: 4, height: 4, background: C.gold, flexShrink: 0, opacity: .6 }} />{f}
          </li>
        ))}
      </ul>
      <div style={{ fontFamily: "Georgia,serif", fontSize: 28, color: C.gold2, marginBottom: 20 }}>
        {tier.price} <span style={{ fontSize: 12, color: C.text4, fontFamily: "inherit" }}>{tier.unit}</span>
      </div>
      <button onClick={() => setPage("contact")}
        onMouseEnter={e => { if (tier.featured) e.currentTarget.style.background = C.gold3; else { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold2; } }}
        onMouseLeave={e => { if (tier.featured) e.currentTarget.style.background = C.gold2; else { e.currentTarget.style.borderColor = C.border2; e.currentTarget.style.color = C.text3; } }}
        style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", padding: "13px 0", cursor: "pointer", fontFamily: "inherit", transition: "all .25s", background: tier.featured ? C.gold2 : "transparent", color: tier.featured ? C.bg : C.text3, border: tier.featured ? "none" : `1px solid ${C.border2}`, fontWeight: tier.featured ? 600 : 400 }}>
        Begin Inquiry
      </button>
    </div>
  );
};

const CtaBanner = ({ setPage }) => {
  const [r, v] = useInView(.2);
  const { isPhone, isTablet } = useViewport();

  return (
    <section
      ref={r}
      style={{
        position: "relative",
        padding: isPhone ? "96px 20px" : isTablet ? "126px 36px" : "170px 52px",
        background:
          "radial-gradient(circle at top, rgba(166,124,58,0.08), transparent 28%), #050505",
        borderTop: `1px solid rgba(255,255,255,0.06)`,
        overflow: "hidden",
      }}
    >
      {/* Ambient Glow */}
      <div
        style={{
          position: "absolute",
          top: -250,
          left: "50%",
          transform: "translateX(-50%)",
          width: isPhone ? 460 : 900,
          height: isPhone ? 460 : 900,
          borderRadius: "50%",
          background: "rgba(166,124,58,0.08)",
          filter: "blur(140px)",
          pointerEvents: "none",
        }}
      />

      {/* Elegant Grid Texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          opacity: 0.14,
          pointerEvents: "none",
        }}
      />

      {/* Gold Accent Line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "72%",
          height: 1,
          background:
            "linear-gradient(to right, transparent, rgba(166,124,58,0.9), transparent)",
        }}
      />

      {/* Floating Blur Orbs */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "12%",
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.025)",
          filter: "blur(100px)",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "10%",
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: "rgba(166,124,58,0.06)",
          filter: "blur(110px)",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          opacity: v ? 1 : 0,
          transform: v ? "translateY(0px)" : "translateY(40px)",
          transition: "all 1.2s cubic-bezier(.22,1,.36,1)",
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
              gap: isPhone ? 10 : 16,
            marginBottom: 34,
          }}
        >
          <div
            style={{
              width: isPhone ? 28 : 42,
              height: 1,
              background:
                "linear-gradient(to right, transparent, rgba(166,124,58,0.85))",
            }}
          />

          <span
            style={{
              fontSize: isPhone ? 9 : 11,
              letterSpacing: isPhone ? "0.16em" : "0.28em",
              textTransform: "uppercase",
              color: "#A67C3A",
            }}
          >
            Private Engagement
          </span>

          <div
            style={{
              width: isPhone ? 28 : 42,
              height: 1,
              background:
                "linear-gradient(to left, transparent, rgba(166,124,58,0.85))",
            }}
          />
        </div>

        {/* Heading */}
        <h2
          style={{
            fontFamily: "Georgia, serif",
            fontSize: isPhone ? "clamp(36px,11vw,52px)" : "clamp(46px,6vw,92px)",
            fontWeight: 400,
            color: "#F5F2EC",
            maxWidth: 980,
            margin: isPhone ? "0 auto 22px" : "0 auto 28px",
            lineHeight: 1,
            letterSpacing: isPhone ? "-0.035em" : "-0.05em",
          }}
        >
          Ready to Evolve Your
          <br />
          <span
            style={{
              fontStyle: "italic",
              background:
                "linear-gradient(135deg, #F2E3BE 0%, #A67C3A 50%, #F5E6BB 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Digital Presence?
          </span>
        </h2>

        {/* Description */}
        <p
          style={{
            fontSize: isPhone ? 14 : 16,
            color: "rgba(255,255,255,0.48)",
            maxWidth: 620,
            margin: isPhone ? "0 auto 42px" : "0 auto 60px",
            lineHeight: isPhone ? 1.8 : 2,
            fontWeight: 300,
            letterSpacing: "0.01em",
          }}
        >
          Join a select group of modern brands leveraging cinematic design,
          autonomous systems, and intelligent digital infrastructure to scale
          beyond conventional growth.
        </p>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            gap: 18,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setPage("contact")}
            style={{
              padding: isPhone ? "16px 20px" : "18px 34px",
              width: isPhone ? "100%" : "auto",
              background:
                "linear-gradient(135deg, #D5B47A 0%, #8E6730 100%)",
              border: "none",
              color: "#050505",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all .35s ease",
              boxShadow: "0 12px 40px rgba(166,124,58,0.22)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow =
                "0 20px 60px rgba(166,124,58,0.34)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0px)";
              e.currentTarget.style.boxShadow =
                "0 12px 40px rgba(166,124,58,0.22)";
            }}
          >
            Request Access
          </button>

          <button
            onClick={() => setPage("about")}
            style={{
              padding: isPhone ? "16px 20px" : "18px 34px",
              width: isPhone ? "100%" : "auto",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(12px)",
              color: "#F5F5F2",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all .35s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.border =
                "1px solid rgba(166,124,58,0.35)";
              e.currentTarget.style.background =
                "rgba(166,124,58,0.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0px)";
              e.currentTarget.style.border =
                "1px solid rgba(255,255,255,0.1)";
              e.currentTarget.style.background =
                "rgba(255,255,255,0.03)";
            }}
          >
            View Philosophy
          </button>
        </div>

        {/* Bottom Tiny Trust Text */}
        <div
          style={{
            marginTop: 70,
            display: "flex",
            justifyContent: "center",
            gap: 28,
            flexWrap: "wrap",
            opacity: 0.42,
          }}
        >
          {[
            "Luxury Positioning",
            "Agentic Systems",
            "Bespoke Development",
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#D5C39A",
              }}
            >
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#A67C3A",
                }}
              />
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
/* ════════════════════════════════════════════════════════
   PAGE: ABOUT
════════════════════════════════════════════════════════ */
const AboutPage = ({ setPage }) => {
  const { isPhone, isMobile, isTablet } = useViewport();
  const pillars = [
    ["01", "Precision", "Every interaction is engineered with obsessive attention to speed, responsiveness, and conversion psychology."],
    ["02", "Scale", "Systems built to withstand exponential attention spikes without compromising elegance or performance."],
    ["03", "Clarity", "Minimal interfaces. Maximum authority. Every visual decision is intentional and strategically restrained."],
    ["04", "Logic", "AI amplifies operations, but human judgment remains at the center of every engineered experience."],
  ];

  const founders = [
    {
      init: "KM",
      name: "Kushagra Mishra",
      role: "Founder / Tech & Architecture",
      bio: "Architecting Nexora’s technical ecosystem through precision-grade infrastructure, performance optimization, and systems designed for elite digital longevity."
    },
    {
      init: "KD",
      name: "Kushagra Dixit",
      role: "Founder / Automation & Strategy",
      bio: "Designing intelligent automation frameworks that convert social attention into measurable business momentum and scalable operational systems."
    },
  ];

  const values = [
    ["Architectural Integrity", "Every interface is authored from zero with structural precision and luxury-grade attention to detail."],
    ["Autonomous Systems", "Operations designed to function continuously without dependency on repetitive manual workflows."],
    ["Conversion Intelligence", "Every pixel, transition, and interaction engineered to maximize trust and conversion velocity."],
    ["Technical Equity", "We convert temporary traffic into permanent digital infrastructure with long-term strategic value."],
  ];

  return (
    <div style={{ background: "#050505", overflow: "hidden" }}>

      {/* ================= HERO ================= */}

      <section
        style={{
          minHeight: "100vh",
          position: "relative",
          padding: isPhone ? "132px 20px 82px" : isTablet ? "154px 36px 100px" : "180px 60px 120px",
          borderBottom: `1px solid ${C.border}`,
          overflow: "hidden",
          background:
            "radial-gradient(circle at top left, rgba(138,117,72,0.10), transparent 32%), #050505"
        }}
      >

        {/* Massive Ambient Logo */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            fontSize: "19vw",
            fontWeight: 700,
            letterSpacing: "-0.08em",
            color: "rgba(255,255,255,0.018)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 0,
            userSelect: "none",
            lineHeight: 1,
          }}
        >
          NEXORA
        </div>

        {/* Grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "120px 120px",
            maskImage:
              "radial-gradient(circle at center, black 30%, transparent 85%)",
            opacity: 0.22,
            pointerEvents: "none",
          }}
        />

        <ParticleCanvas count={42} opacity={0.45} />

        {/* Premium Blur Orb */}
        <div
          style={{
            position: "absolute",
            width: isPhone ? 360 : 620,
            height: isPhone ? 360 : 620,
            borderRadius: "50%",
            background: "rgba(138,117,72,0.10)",
            filter: "blur(120px)",
            top: -180,
            right: -160,
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: 1380,
            margin: "0 auto",
          }}
        >
          <FadeUp>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: isPhone ? 10 : 14,
                padding: isPhone ? "10px 14px" : "12px 20px",
                border: `1px solid ${C.border}`,
                background: "rgba(255,255,255,0.02)",
                backdropFilter: "blur(18px)",
                marginBottom: 38,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: C.gold2,
                  boxShadow: `0 0 18px ${C.gold2}`,
                }}
              />
              <span
                style={{
                  fontSize: isPhone ? 9 : 10,
                  letterSpacing: isPhone ? "0.14em" : "0.24em",
                  textTransform: "uppercase",
                  color: C.gold2,
                }}
              >
                Nexora Intelligence Philosophy
              </span>
            </div>
          </FadeUp>

          <FadeUp delay={0.12}>
            <h1
              style={{
                fontFamily: "Georgia,serif",
                fontSize: isPhone ? "clamp(44px,13vw,62px)" : "clamp(60px,8vw,118px)",
                lineHeight: isPhone ? 1 : 0.96,
                fontWeight: 400,
                color: C.text,
                maxWidth: 980,
                letterSpacing: isPhone ? "-0.035em" : "-0.05em",
                marginBottom: 34,
              }}
            >
              Engineering
              <br />
              Elite Digital
              <br />
              <span
                style={{
                  color: C.gold2,
                  fontStyle: "italic",
                }}
              >
                Infrastructure.
              </span>
            </h1>
          </FadeUp>

          <FadeUp delay={0.22}>
            <p
              style={{
                fontSize: isPhone ? 15 : 17,
                color: C.text4,
                maxWidth: 620,
                lineHeight: 1.95,
                fontWeight: 300,
                marginBottom: 54,
              }}
            >
              Nexora AI exists where high-frequency attention meets precision-grade
              engineering — building autonomous digital ecosystems designed to
              elevate brands into modern authority.
            </p>
          </FadeUp>

          {/* Premium Metrics */}
          <FadeUp delay={0.35}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isPhone ? "1fr" : "repeat(3,1fr)",
                maxWidth: 850,
                border: `1px solid ${C.border}`,
                background: "rgba(255,255,255,0.015)",
                backdropFilter: "blur(18px)",
              }}
            >
              {[
                ["24/7", "Autonomous Systems"],
                ["100%", "Custom Infrastructure"],
                ["∞", "Scalable Architecture"],
              ].map(([n, l], i) => (
                <div
                  key={i}
                  style={{
                    padding: isPhone ? "24px 22px" : "34px 30px",
                    borderRight:
                      !isPhone && i !== 2 ? `1px solid ${C.border}` : "none",
                    borderBottom:
                      isPhone && i !== 2 ? `1px solid ${C.border}` : "none",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.03), transparent)",
                      opacity: 0.5,
                    }}
                  />

                  <div
                    style={{
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "Georgia,serif",
                        fontSize: 42,
                        color: C.gold2,
                        marginBottom: 8,
                      }}
                    >
                      {n}
                    </div>

                    <div
                      style={{
                        fontSize: 11,
                        color: C.text5,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                      }}
                    >
                      {l}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      <Marquee />

      {/* ================= MISSION ================= */}

      <section
        style={{
          padding: isPhone ? "88px 20px" : isTablet ? "112px 36px" : "140px 60px",
          background: C.bg2,
          borderBottom: `1px solid ${C.border}`,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at bottom right, rgba(138,117,72,0.08), transparent 35%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isTablet ? "1fr" : "1fr 1fr",
            gap: isTablet ? 56 : 110,
            alignItems: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          <SlideIn from="left">
            <Eyebrow>The Mission</Eyebrow>

            <SectionTitle style={{ marginBottom: 30 }}>
              We Don't Build
              <br />
              Websites.
              <br />
              <Gold>We Build Authority.</Gold>
            </SectionTitle>

            <p
              style={{
                fontSize: 15,
                color: C.text4,
                lineHeight: 1.95,
                fontWeight: 300,
                marginBottom: 20,
              }}
            >
              Every Nexora environment is engineered from first principles —
              designed to transform passive traffic into measurable trust,
              engagement, and long-term digital equity.
            </p>

            <p
              style={{
                fontSize: 14,
                color: C.text5,
                lineHeight: 1.95,
                fontWeight: 300,
              }}
            >
              We reject generic templates and disposable experiences. Every
              system is precision-built to reflect authority, sophistication,
              and operational excellence.
            </p>
          </SlideIn>

          <SlideIn from="right" delay={0.15}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isPhone ? "1fr" : "1fr 1fr",
                border: `1px solid ${C.border}`,
                background: "rgba(255,255,255,0.02)",
                backdropFilter: "blur(16px)",
              }}
            >
              {values.map(([title, desc], i) => (
                <div
                  key={i}
                  style={{
                    padding: isPhone ? "30px 24px" : "42px 34px",
                    borderRight:
                      !isPhone && i % 2 === 0 ? `1px solid ${C.border}` : "none",
                    borderBottom:
                      isPhone ? (i < values.length - 1 ? `1px solid ${C.border}` : "none") : (i < 2 ? `1px solid ${C.border}` : "none"),
                    transition: "all .35s ease",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = C.bg4;
                    e.currentTarget.style.transform = "translateY(-4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.transform = "translateY(0px)";
                  }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 1,
                      background: C.gold2,
                      marginBottom: 18,
                    }}
                  />

                  <h4
                    style={{
                      fontSize: 15,
                      fontWeight: 500,
                      color: C.text,
                      marginBottom: 12,
                    }}
                  >
                    {title}
                  </h4>

                  <p
                    style={{
                      fontSize: 13,
                      color: C.text5,
                      lineHeight: 1.85,
                      fontWeight: 300,
                    }}
                  >
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </SlideIn>
        </div>
      </section>

      {/* ================= PILLARS ================= */}

      <section
        style={{
          padding: isPhone ? "88px 20px" : isTablet ? "112px 36px" : "140px 60px",
          background: C.bg,
          borderBottom: `1px solid ${C.border}`,
          position: "relative",
        }}
      >
        <FadeUp>
          <Eyebrow>Four Pillars</Eyebrow>
        </FadeUp>

        <FadeUp delay={0.1}>
          <SectionTitle style={{ marginBottom: 70 }}>
            Principles That
            <br />
            <Gold>Govern Nexora.</Gold>
          </SectionTitle>
        </FadeUp>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isPhone ? "1fr" : isTablet ? "repeat(2,1fr)" : "repeat(4,1fr)",
            gap: isPhone ? 18 : 24,
          }}
        >
          {pillars.map(([num, title, desc], i) => (
            <div
              key={i}
              style={{
                padding: isPhone ? "32px 24px" : "46px 36px",
                background: "rgba(255,255,255,0.02)",
                border: `1px solid ${C.border}`,
                backdropFilter: "blur(16px)",
                transition: "all .4s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform =
                  "translateY(-10px)";
                e.currentTarget.style.borderColor = C.gold;
                e.currentTarget.style.background = C.bg3;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform =
                  "translateY(0px)";
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.background =
                  "rgba(255,255,255,0.02)";
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.18em",
                  color: C.gold2,
                  marginBottom: 22,
                }}
              >
                {num}
              </div>

              <h3
                style={{
                  fontFamily: "Georgia,serif",
                  fontSize: 26,
                  fontWeight: 400,
                  color: C.text,
                  marginBottom: 16,
                }}
              >
                {title}
              </h3>

              <p
                style={{
                  fontSize: 14,
                  color: C.text4,
                  lineHeight: 1.9,
                  fontWeight: 300,
                }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= FOUNDERS ================= */}

      <section
        style={{
          padding: isPhone ? "88px 20px" : isTablet ? "112px 36px" : "140px 60px",
          background: C.bg2,
          borderBottom: `1px solid ${C.border}`,
          position: "relative",
        }}
      >
        <FadeUp>
          <Eyebrow>The Architects</Eyebrow>
        </FadeUp>

        <FadeUp delay={0.1}>
          <SectionTitle style={{ marginBottom: 70 }}>
            Founded by Builders
            <br />
            <Gold>Obsessed with Precision.</Gold>
          </SectionTitle>
        </FadeUp>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: isPhone ? 18 : 28,
          }}
        >
          {founders.map((f, i) => (
            <div
              key={i}
              style={{
                padding: isPhone ? "36px 24px" : "60px 54px",
                border: `1px solid ${C.border}`,
                background: "rgba(255,255,255,0.02)",
                backdropFilter: "blur(18px)",
                transition: "all .45s ease",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform =
                  "translateY(-8px)";
                e.currentTarget.style.borderColor = C.gold;
                e.currentTarget.style.background = C.bg3;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform =
                  "translateY(0px)";
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.background =
                  "rgba(255,255,255,0.02)";
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -120,
                  right: -100,
                  width: 260,
                  height: 260,
                  borderRadius: "50%",
                  background: "rgba(138,117,72,0.08)",
                  filter: "blur(80px)",
                }}
              />

              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    border: `1px solid ${C.border3}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "Georgia,serif",
                    fontSize: 22,
                    color: C.gold2,
                    marginBottom: 30,
                    background: "rgba(255,255,255,0.02)",
                  }}
                >
                  {f.init}
                </div>

                <h3
                  style={{
                    fontFamily: "Georgia,serif",
                    fontSize: 32,
                    fontWeight: 400,
                    color: C.text,
                    marginBottom: 8,
                  }}
                >
                  {f.name}
                </h3>

                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: C.gold2,
                    marginBottom: 24,
                  }}
                >
                  {f.role}
                </div>

                <p
                  style={{
                    fontSize: 14,
                    color: C.text4,
                    lineHeight: 1.95,
                    fontWeight: 300,
                  }}
                >
                  {f.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <CtaBanner setPage={setPage} />
    </div>
  );
};

/* ════════════════════════════════════════════════════════
   PAGE: CONTACT
════════════════════════════════════════════════════════ */
const ContactPage = () => {
  const [m, setM] = useState(false);
  const { isPhone, isTablet } = useViewport();

  useEffect(() => {
    const t = setTimeout(() => setM(true), 100);
    return () => clearTimeout(t);
  }, []);

  const today = new Date();
  const [curYear, setCurYear] = useState(today.getFullYear());
  const [curMonth, setCurMonth] = useState(today.getMonth());
  const [selDay, setSelDay] = useState(null);
  const [selSlot, setSelSlot] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
  });

  const [step, setStep] = useState(1);

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const slots = [
    "08:00 AM","09:00 AM","10:00 AM","11:00 AM",
    "12:00 PM","02:00 PM","04:00 PM","06:00 PM"
  ];

  const getDays = () => {
    const first = new Date(curYear, curMonth, 1).getDay();
    const total = new Date(curYear, curMonth + 1, 0).getDate();

    return {
      first: first === 0 ? 6 : first - 1,
      total,
    };
  };

  const { first, total } = getDays();

  const isAvail = (d) => {
    const day = new Date(curYear, curMonth, d).getDay();
    return day !== 0 && day !== 6;
  };

  const isPast = (d) => {
    const now = new Date();
    now.setHours(0,0,0,0);

    return new Date(curYear, curMonth, d) < now;
  };

  const prevMonth = () => {
    if (curMonth === 0) {
      setCurYear(y => y - 1);
      setCurMonth(11);
    } else {
      setCurMonth(m => m - 1);
    }

    setSelDay(null);
    setSelSlot(null);
  };

  const nextMonth = () => {
    if (curMonth === 11) {
      setCurYear(y => y + 1);
      setCurMonth(0);
    } else {
      setCurMonth(m => m + 1);
    }

    setSelDay(null);
    setSelSlot(null);
  };

  const handleSubmit = () => {
    if (!form.name || !form.email || !selDay || !selSlot) return;
    setStep(3);
  };

  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.02)",
    border: `1px solid ${C.border}`,
    color: C.text,
    padding: "16px 18px",
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    transition: "all .3s",
    marginBottom: 16,
    backdropFilter: "blur(10px)",
  };

  const anim = (d) => ({
    opacity: m ? 1 : 0,
    transform: m ? "none" : "translateY(40px)",
    transition: `all 1s cubic-bezier(.22,1,.36,1) ${d}s`
  });

  return (
    <div>

      {/* HERO */}
      <section
        style={{
          minHeight: "82vh",
          padding: isPhone ? "126px 20px 76px" : isTablet ? "140px 36px 86px" : "150px 52px 90px",
          position: "relative",
          overflow: "hidden",
          borderBottom: `1px solid ${C.border}`,
          background:
            "radial-gradient(circle at top left, rgba(138,117,72,0.08), transparent 40%), #050505"
        }}
      >

        {/* MASSIVE BG TEXT */}
        <div
          style={{
            position: "absolute",
            top: "48%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            fontSize: isPhone ? "23vw" : "18vw",
            fontWeight: 700,
            letterSpacing: "-0.08em",
            color: "rgba(255,255,255,0.025)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            userSelect: "none",
            zIndex: 0,
          }}
        >
          CONNECT
        </div>

        {/* GLOW */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 50% 20%, rgba(138,117,72,0.12), transparent 45%)",
            pointerEvents: "none",
          }}
        />

        <ParticleCanvas count={40} opacity={0.45} />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: 980,
          }}
        >

          <div style={anim(0.1)}>
            <Eyebrow>Private Consultation</Eyebrow>
          </div>

          <h1
            style={{
              ...anim(0.25),
              fontFamily: "Georgia,serif",
              fontSize: isPhone ? "clamp(40px,12vw,56px)" : "clamp(52px,7vw,108px)",
              lineHeight: 1.02,
              fontWeight: 400,
              color: C.text,
              letterSpacing: isPhone ? "-0.032em" : "-0.045em",
              maxWidth: 920,
              marginBottom: 28,
            }}
          >
            Schedule the<br />
            Next Evolution of<br />
            <span
              style={{
                color: C.gold2,
                fontStyle: "italic",
              }}
            >
              Your Digital Infrastructure.
            </span>
          </h1>

          <p
            style={{
              ...anim(0.45),
              fontSize: isPhone ? 15 : 16,
              color: C.text4,
              lineHeight: 1.9,
              fontWeight: 300,
              maxWidth: 560,
              marginBottom: 60,
            }}
          >
            Direct access to Nexora's engineering and systems team.
            Strategy, architecture, automation, and premium
            web infrastructure designed for brands operating at scale.
          </p>

          {/* STATS */}
          <div
            style={{
              ...anim(0.7),
              display: "grid",
              gridTemplateColumns: isPhone ? "1fr" : "repeat(3,1fr)",
              maxWidth: 760,
              border: `1px solid ${C.border}`,
              background: "rgba(255,255,255,0.015)",
              backdropFilter: "blur(18px)",
            }}
          >
            {[
              ["30m", "Private Session"],
              ["24h", "Response Window"],
              ["Global", "Remote Advisory"],
            ].map(([n, l], i) => (
              <div
                key={i}
                style={{
                  padding: isPhone ? "22px 20px" : "28px 34px",
                  borderRight:
                    !isPhone && i < 2
                      ? `1px solid ${C.border}`
                      : "none",
                  borderBottom:
                    isPhone && i < 2
                      ? `1px solid ${C.border}`
                      : "none",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: "Georgia,serif",
                    fontSize: 34,
                    color: C.gold2,
                    marginBottom: 6,
                  }}
                >
                  {n}
                </div>

                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: C.text5,
                  }}
                >
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOOKING */}
<section
  style={{
    padding: isPhone ? "88px 20px" : isTablet ? "112px 36px" : "140px 52px",
    background: "#050505",
    position: "relative",
    overflow: "hidden",
  }}
>

  {/* ATMOSPHERIC LIGHTING */}
  <div
    style={{
      position: "absolute",
      inset: 0,
      background:
        "radial-gradient(circle at 20% 30%, rgba(138,117,72,0.08), transparent 35%), radial-gradient(circle at 80% 70%, rgba(138,117,72,0.06), transparent 35%)",
      pointerEvents: "none",
    }}
  />

  {/* MASSIVE FLOATING LABEL */}
  <div
    style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%,-50%)",
      fontSize: "16vw",
      fontWeight: 700,
      letterSpacing: "-0.08em",
      color: "rgba(255,255,255,0.02)",
      whiteSpace: "nowrap",
      pointerEvents: "none",
      userSelect: "none",
    }}
  >
    SESSION
  </div>

  <div
    style={{
      position: "relative",
      zIndex: 2,
      maxWidth: 1380,
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: isTablet ? "1fr" : "1.1fr .9fr",
      gap: isPhone ? 42 : isTablet ? 56 : 80,
      alignItems: "start",
    }}
  >

    {/* LEFT SIDE */}
    <div>

      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: C.gold,
          marginBottom: 24,
        }}
      >
        Private Consultation Access
      </div>

      <h2
        style={{
          fontFamily: "Georgia,serif",
          fontSize: isPhone ? "clamp(36px,11vw,48px)" : "clamp(48px,5vw,84px)",
          fontWeight: 400,
          lineHeight: 1.02,
          letterSpacing: "-0.045em",
          color: C.text,
          maxWidth: 720,
          marginBottom: 28,
        }}
      >
        Architect the<br />
        Future of Your<br />
        <span
          style={{
            color: C.gold2,
            fontStyle: "italic",
          }}
        >
          Digital Presence.
        </span>
      </h2>

      <p
        style={{
          maxWidth: 520,
          fontSize: isPhone ? 14 : 15,
          lineHeight: 1.95,
          color: C.text4,
          fontWeight: 300,
          marginBottom: isPhone ? 40 : 70,
        }}
      >
        A focused strategic session with Nexora's engineering team —
        exploring automation systems, conversion architecture,
        and premium digital infrastructure engineered for scale.
      </p>

      {/* LUXURY INFO BLOCKS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isPhone ? "1fr" : "repeat(3,1fr)",
          gap: isPhone ? 12 : 18,
        }}
      >
        {[
          ["30m", "Strategic Session"],
          ["Global", "Remote Access"],
          ["Selective", "Client Intake"],
        ].map(([n, l], i) => (
          <div
            key={i}
            style={{
              padding: isPhone ? "22px 20px" : "28px 26px",
              background: "rgba(255,255,255,0.02)",
              border: `1px solid rgba(255,255,255,0.05)`,
              backdropFilter: "blur(14px)",
            }}
          >
            <div
              style={{
                fontFamily: "Georgia,serif",
                fontSize: 34,
                color: C.gold2,
                marginBottom: 10,
              }}
            >
              {n}
            </div>

            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: C.text5,
              }}
            >
              {l}
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* RIGHT PANEL */}
    <div
      style={{
        padding: isPhone ? "32px 22px" : "46px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
        position: "relative",
      }}
    >

      {/* GOLD TOP LINE */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: isPhone ? 22 : 46,
          right: isPhone ? 22 : 46,
          height: 1,
          background:
            "linear-gradient(to right, transparent, rgba(191,161,97,0.8), transparent)",
        }}
      />

      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: C.text5,
          marginBottom: 14,
        }}
      >
        Request Access
      </div>

      <h3
        style={{
          fontFamily: "Georgia,serif",
          fontSize: isPhone ? 30 : 36,
          fontWeight: 400,
          color: C.text,
          lineHeight: 1.12,
          marginBottom: 14,
        }}
      >
        Begin the Conversation
      </h3>

      <p
        style={{
          fontSize: 14,
          lineHeight: 1.85,
          color: C.text4,
          marginBottom: 34,
        }}
      >
        Limited intake ensures every engagement receives
        deep architectural focus and precision execution.
      </p>

      {/* INPUTS */}
      {[
        ["Full Name"],
        ["Email Address"],
        ["Company / Brand"],
      ].map(([ph], i) => (
        <input
          key={i}
          placeholder={ph}
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            borderBottom: `1px solid ${C.border}`,
            padding: "18px 0",
            color: C.text,
            fontSize: 14,
            outline: "none",
            marginBottom: 14,
            transition: "all .3s",
          }}
        />
      ))}

      <div style={{ marginTop: 38 }}>
        <GoldBtn full>
          Request Consultation
        </GoldBtn>
      </div>
    </div>
  </div>
</section>
    </div>
  );
};

/* ════════════════════════════════════════════════════════
   ROOT
════════════════════════════════════════════════════════ */
export default function App() {
  const [page, setPage] = useState("home");
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef(null);

  const handleSetPage = useCallback((p) => {
    setPage(p);
    if (containerRef.current) containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleScroll = useCallback((e) => setScrollY(e.target.scrollTop), []);

return (
  <div
    ref={containerRef}
    onScroll={handleScroll}
    style={{
      width: "100%",
      minWidth: 0,
      height: "100vh",
      minHeight: "100vh",
      background: "#040404",
      color: C.text,
      fontFamily: "Inter,system-ui,sans-serif",
      overflowY: "auto",
      overflowX: "hidden",
      position: "relative"
    }}
  >
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap');

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      html, body, #root {
        width: 100%;
        min-height: 100%;
        margin: 0;
        padding: 0;
        overflow-x: hidden;
        background: #040404;
      }

      body {
        background:
          radial-gradient(
            circle at top,
            rgba(138,117,72,0.06),
            transparent 40%
          ),
          #040404;
      }

      @keyframes marquee {
        0% { transform: translateX(0) }
        100% { transform: translateX(-50%) }
      }

      @keyframes fadeUpEl {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(14px)
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0)
        }
      }

      @keyframes pulse {
        0%,100% { opacity: .2 }
        50% { opacity: .65 }
      }

      input::placeholder {
        color: #2e2e2e;
      }

      input {
        caret-color: #c9b87a;
      }

      ::-webkit-scrollbar {
        width: 3px;
      }

      ::-webkit-scrollbar-track {
        background: #040404;
      }

      ::-webkit-scrollbar-thumb {
        background: #1a1a1a;
      }
    `}</style>

    <Nav
      page={page}
      setPage={handleSetPage}
      scrollY={scrollY}
    />

    <div
      style={{
        width: "100%",
        overflow: "hidden"
      }}
    >
      {page === "home" && (
        <HomePage setPage={handleSetPage} />
      )}

      {page === "about" && (
        <AboutPage setPage={handleSetPage} />
      )}

      {page === "contact" && (
        <ContactPage />
      )}
    </div>

    <Footer setPage={handleSetPage} />
  </div>
);
}
