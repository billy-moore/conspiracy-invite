import { useEffect, useMemo, useRef, useState } from "react";

const CONFIG = {
  titleTop: "CONSPIRACY",
  titleBottom: "THEORY PARTY",
  subtitle: "Enemy of the State vibes. Bring your finest red-string evidence.",
  dateLine: "Friday • 7:30 PM • February __, 2026",
  locationLine: "Location: [Your Place / Address / ‘Undisclosed’]",
  dressLine: "Dress code: Black ops casual (optional). Tinfoil accessories encouraged.",
  rsvpUrl: "https://www.signupgenius.com/",
  listUrl: "https://forms.gle/",
};

function DownArrowIcon({ className = "" }) {
  return (
    <svg className={className} width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="M32 18v22" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M22 34l10 10 10-10"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RansomHeader({ children, as: Tag = "h1" }) {
  const text = String(children).toUpperCase();

  const letters = useMemo(() => {
    return text.split("").map((ch, idx) => {
      const isSpace = ch === " ";
      const rot = ((idx * 13) % 9) - 4;
      const shade = 10 + ((idx * 17) % 18);
      const scale = 0.96 + (((idx * 7) % 8) / 100);
      return { ch, idx, isSpace, rot, shade, scale };
    });
  }, [text]);

  return (
    <Tag className="ransom">
      {letters.map(({ ch, idx, isSpace, rot, shade, scale }) => {
        if (isSpace) return <span key={idx} className="ransom-space"> </span>;
        return (
          <span
            key={idx}
            className="ransom-letter"
            style={{
              transform: `rotate(${rot}deg) scale(${scale})`,
              fontFamily: "MagazineCutouts",
              backgroundColor: `hsl(0 0% ${shade + 70}%)`,
            }}
          >
            {ch}
          </span>
        );
      })}
    </Tag>
  );
}

export default function App() {
  const [showArrow, setShowArrow] = useState(false);
  const [arrowClicked, setArrowClicked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [revealProgress, setRevealProgress] = useState(0);

  // Audio context reused for clicks
  const audioRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setShowArrow(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const playCrtClick = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!audioRef.current) audioRef.current = new AudioContext();
      const ctx = audioRef.current;

      const now = ctx.currentTime;

      // Short “power-down” thump: low square wave with rapid decay
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.setValueAtTime(85, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.06);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.05, now + 0.005); // low volume
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      // Tiny noise “tick” on top
      const bufferSize = Math.floor(ctx.sampleRate * 0.03);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.0001, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.018, now + 0.003);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(gain).connect(ctx.destination);
      noise.connect(noiseGain).connect(ctx.destination);

      osc.start(now);
      noise.start(now);

      osc.stop(now + 0.14);
      noise.stop(now + 0.06);
    } catch {
      // If audio fails (rare), silently ignore.
    }
  };

  const smoothScrollTo = (targetY, duration, onProgress) => {
    const startY = window.pageYOffset;
    const diff = targetY - startY;
    let start;

    const easeInOutCubic = (t) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = (ts) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const raw = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(raw);

      window.scrollTo(0, startY + diff * eased);
      onProgress?.(raw); // raw is better for “fade in during scroll”

      if (raw < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  const revealAndScroll = () => {
    if (arrowClicked) return;

    setArrowClicked(true);
    playCrtClick();

    setRevealed(true);
    setRevealProgress(0);

    requestAnimationFrame(() => {
      const el = document.getElementById("details");
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const elTop = rect.top + window.pageYOffset;

      // Center the content on screen
      const targetY = elTop - (window.innerHeight / 2) + (el.offsetHeight / 2);

      smoothScrollTo(targetY, 1600, (p) => setRevealProgress(p));
    });
  };

  // Signal stabilizing: fade overlays & soften video filter as revealProgress increases
  const overlayOpacity = 0.85 - (revealProgress * 0.55);   // 0.85 -> 0.30
  const scanlineOpacity = 0.22 - (revealProgress * 0.16);  // 0.22 -> 0.06
  const videoFilter = `contrast(${1.15 - revealProgress * 0.18})
                      brightness(${0.72 + revealProgress * 0.10})
                      saturate(${0.65 + revealProgress * 0.35})`;

  // Content fades in during scroll
  const contentOpacity = Math.min(1, revealProgress * 1.1);
  const contentLift = 10 - (revealProgress * 10);

  return (
    <div className="page">
      <header className="hero">
        <video
          className="heroVideo"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          style={{ filter: videoFilter }}
        >
          <source src={`${import.meta.env.BASE_URL}static.mp4`} type="video/mp4" />
        </video>

        <div className="heroOverlay" aria-hidden="true" style={{ opacity: overlayOpacity }} />
        <div className="scanlines" aria-hidden="true" style={{ opacity: scanlineOpacity }} />

        <div className={`arrowOnly ${showArrow && !arrowClicked ? "visible" : ""}`}>
          <button
            className={`arrowBtn ${!arrowClicked ? "blink" : ""}`}
            onClick={revealAndScroll}
            aria-label="Reveal invitation details"
          >
            <DownArrowIcon className="arrowIcon" />
          </button>
        </div>
      </header>

      <main
        id="details"
        className={`details ${revealed ? "revealed" : "hidden"}`}
        style={{
          opacity: revealed ? contentOpacity : 0,
          transform: revealed ? `translateY(${contentLift}px)` : "translateY(0px)",
        }}
      >
        <section className="card">
          <RansomHeader>{CONFIG.titleTop}</RansomHeader>
          <RansomHeader as="h2">{CONFIG.titleBottom}</RansomHeader>

          <p className="subtitle">{CONFIG.subtitle}</p>

          <p className="detailLine">{CONFIG.dateLine}</p>
          <p className="detailLine">{CONFIG.locationLine}</p>
          <p className="detailLine">{CONFIG.dressLine}</p>

          <hr className="divider" />

          <div className="ctaRow bottom">
            <a className="btn primary" href={CONFIG.rsvpUrl} target="_blank" rel="noreferrer">
              RSVP / SignUp
            </a>
            <a className="btn" href={CONFIG.listUrl} target="_blank" rel="noreferrer">
              Submit Your List
            </a>
          </div>

          <p className="tiny">
            Disclaimer: This event is for fun, fiction, and absurdity.
          </p>
        </section>
      </main>
    </div>
  );
}
