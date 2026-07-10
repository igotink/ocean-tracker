import { useMemo, useState } from "react";
import { Waves } from "./Icons";

export function ShareSection() {
  const [copied, setCopied] = useState(false);
  const appLink = useMemo(() => window.location.origin || "https://your-ocean-tracker-url.vercel.app", []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(appLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="share-card" aria-label="Share Ocean Tracker">
      <div className="section-heading compact">
        <p className="eyebrow">Share Ocean Tracker</p>
        <h2>Send the dip log to a swimmer</h2>
      </div>

      <div className="share-actions">
        <button onClick={copyLink}>
          <Waves size={18} />
          {copied ? "Copied" : "Copy app link"}
        </button>
        <span>{appLink}</span>
      </div>

      <div className="install-notes">
        <p>iPhone: open in Safari, tap Share, then Add to Home Screen.</p>
        <p>Android: open in Chrome, then choose Install App.</p>
      </div>
    </section>
  );
}
