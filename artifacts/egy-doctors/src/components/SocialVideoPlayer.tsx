import { getSocialVideoInfo } from "@/lib/socialVideo";

interface SocialVideoPlayerProps {
  url: string;
  title?: string;
  className?: string;
}

/**
 * Instagram embed sizing constants.
 *
 * The native Instagram /embed renders a fixed internal layout roughly:
 *   0–56px   → profile header (avatar + username + follow button)
 *   56–~640px → video / image content
 *   ~640–730px → action bar (heart / comment / share) + "Add a comment…"
 *
 * Strategy:
 *   1. Container is a strict 400 × 430px window with overflow:hidden.
 *   2. The iframe is rendered at FRAME_W × FRAME_H (larger than the container).
 *   3. A negative top offset shifts the header above the container's top edge.
 *   4. transform: scale(SCALE) from "top center" gently compresses the remaining
 *      content so the footer is pushed below the container's bottom edge.
 *   5. scrolling="no" + overflow:hidden prevent any internal scrollbar.
 */
const IG_W = 400;       // container width (px)
const IG_H = 430;       // container visible height (px)
const IG_FRAME_H = 680; // iframe total height — enough to cover header+content+footer
const IG_SHIFT_TOP = 56; // px to shift up so header scrolls out of view
const IG_SCALE = 0.88;  // scale factor — compresses footer below visible boundary

export function SocialVideoPlayer({ url, title, className = "" }: SocialVideoPlayerProps) {
  const info = getSocialVideoInfo(url);
  if (!info) return null;

  const { embedUrl, aspectRatio, platform } = info;
  const iframeTitle = title ?? platform;

  /* ── Instagram — strict compact window, no native UI ────────────── */
  if (platform === "instagram") {
    return (
      <div className={`flex justify-center ${className}`}>
        {/* Clipping viewport — nothing escapes this box */}
        <div
          style={{
            width: IG_W,
            maxWidth: "100%",
            height: IG_H,
            overflow: "hidden",
            position: "relative",
            borderRadius: 12,
            background: "#000",
          }}
        >
          <iframe
            src={embedUrl}
            title={iframeTitle}
            /* scrolling is a legacy HTML attribute but still respected */
            scrolling="no"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              position: "absolute",
              top: -IG_SHIFT_TOP,
              left: 0,
              width: "100%",
              height: IG_FRAME_H,
              border: "none",
              overflow: "hidden",
              /* Scale from the top centre so the header stays cropped and
                 the footer is pushed progressively below the bottom edge */
              transform: `scale(${IG_SCALE})`,
              transformOrigin: "top center",
            }}
          />
        </div>
      </div>
    );
  }

  /* ── TikTok — portrait, constrained width ────────────────────── */
  if (aspectRatio === "9/16") {
    return (
      <div className={`flex justify-center ${className}`}>
        <div style={{ aspectRatio: "9/16", width: "min(100%, 380px)" }}>
          <iframe
            src={embedUrl}
            title={iframeTitle}
            scrolling="no"
            className="w-full h-full border-0"
            style={{ overflow: "hidden" }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  /* ── YouTube / Facebook — 16:9 landscape ─────────────────────── */
  return (
    <div className={className} style={{ aspectRatio: "16/9" }}>
      <iframe
        src={embedUrl}
        title={iframeTitle}
        scrolling="no"
        className="w-full h-full border-0"
        style={{ overflow: "hidden" }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
