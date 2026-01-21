import { useEffect, useMemo, useState } from "react";

// Swap these links + details
const CONFIG = {
  titleTop: "CONSPIRACY",
  titleBottom: "THEORY PARTY",
  subtitle: "Enemy of the State vibes. Bring your finest red-string evidence.",
  dateLine: "Friday • 7:30 PM • February __, 2026",
  locationLine: "Location: [Your Place / Address / ‘Undisclosed’]",
  dressLine: "Dress code: Black ops casual (optional). Tinfoil accessories encouraged.",
  rsvpUrl: "https://www.signupgenius.com/", // replace
  listUrl: "https://forms.gle/", // replace (Google Form ideal), or mailto:
  // listUrl: "mailto:you@email.com?subject=My%20Conspiracy%20Theory%20List&body=Paste%20your%20list%20here...",
};

function DownArrowIcon({ className = "" }) {
  return (
    <svg
      className={className}
      width="64"
      height="64"
      viewBox="0 0 64 64"
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path
        d="M32 18v22"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
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

// “Ransom note” header: each letter styled like a cutout tile, with mild randomness.
function RansomHeader({ children, as: Tag = "h1" }) {
  const text = String(children);

  const fonts = useMemo(
    () => [
      "Impact",
      "Arial Black",
      "Georgia",
      "Times New Roman",
      "Trebuchet MS",
      "Courier New",
      "Verdana",
      "Tahoma",
    ],
    []
  );

  // deterministic-ish randomness per render
  const letters = useMemo(() => {
    return text.split("").map((ch, idx) => {
      const isSpace = ch === " ";
      const rot = ((idx * 13) % 9) - 4; // -4..+4 degrees
      const font = fonts[idx % fonts.length];
      const shade = 10 + ((idx * 17) % 18); // for subtle background variations
      const scale = 0.96 + (((idx * 7) % 8) / 100); // 0.96..1.03

      return { ch, idx, isSpace, rot, font, shade, scale };
    });
  }, [text, fonts]);

  return (
    <Tag className="ransom">
      {letters.map(({ ch, idx, isSpace, rot, font, shade, scale }) => {
        if (isSpace) return <span key={idx} className="ransom-space"> </span>;

        return (
          <span
            key={idx}
            className="ransom-letter"
            style={{
              transform: `rotate(${rot}deg) scale(${scale})`,
              fontFamily: font,
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

  useEffect(() => {
    const t = setTimeout(() => setShowArrow(true), 6500);
    return () => clearTimeout(t);
  }, []);

  const scrollToDetails = () => {
    const el = document.getElementById("details");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="page">
      <header className="hero">
        {/* Replace /static.mp4 with your own file in /public */}
        <video
          className="heroVideo"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src="/static.mp4" type="video/mp4" />
        </video>

        {/* Overlay */}
        <div className="heroOverlay" aria-hidden="true" />

        <div className="heroContent">
          <RansomHeader>{CONFIG.titleTop}</RansomHeader>
          <RansomHeader as="h2">{CONFIG.titleBottom}</RansomHeader>

          <p className="subtitle">{CONFIG.subtitle}</p>

          <div className="ctaRow">
            <a className="btn primary" href={CONFIG.rsvpUrl} target="_blank" rel="noreferrer">
              RSVP / SignUp
            </a>
            <a className="btn" href={CONFIG.listUrl} target="_blank" rel="noreferrer">
              Submit Your List
            </a>
          </div>

          <div className={`arrowWrap ${showArrow ? "visible" : ""}`}>
            <button className="arrowBtn" onClick={scrollToDetails} aria-label="Scroll for details">
              <DownArrowIcon className="arrowIcon" />
            </button>
          </div>

          <div className="finePrint">
            <span>Transmission integrity: questionable</span>
            <span>•</span>
            <span>Eyes only</span>
          </div>
        </div>

        {/* A little scanline flair */}
        <div className="scanlines" aria-hidden="true" />
      </header>

      <main id="details" className="details">
        <section className="card">
          <RansomHeader as="h3">THE BRIEFING</RansomHeader>

          <p className="detailLine">{CONFIG.dateLine}</p>
          <p className="detailLine">{CONFIG.locationLine}</p>
          <p className="detailLine">{CONFIG.dressLine}</p>

          <hr className="divider" />

          <ul className="list">
            <li>Bring 3–5 conspiracies you can defend (poorly is acceptable).</li>
            <li>Optional: printouts, corkboard diagrams, blurry screenshots.</li>
            <li>We will be taking turns presenting “evidence” with maximum confidence.</li>
          </ul>

          <div className="ctaRow bottom">
            <a className="btn primary" href={CONFIG.rsvpUrl} target="_blank" rel="noreferrer">
              RSVP Now
            </a>
            <a className="btn" href={CONFIG.listUrl} target="_blank" rel="noreferrer">
              Send Your Theories
            </a>
          </div>

          <p className="tiny">
            Disclaimer: This event is for fun, fiction, and absurdity. Please do not become an actual operative.
          </p>
        </section>

        <footer className="footer">
          <span>Signal ends.</span>
          <span className="footerDot">•</span>
          <span>Do not discuss over open channels.</span>
        </footer>
      </main>
    </div>
  );
}
