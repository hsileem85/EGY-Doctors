import { getSocialVideoInfo } from "@/lib/socialVideo";

interface SocialVideoPlayerProps {
  url: string;
  title?: string;
  className?: string;
}

/**
 * Instagram embed crop constants.
 * The native embed renders a header (~60px) and a footer action bar (~50px with
 * hidecaption=true). We hide both by overflowing and shifting the iframe upward.
 */
const IG_CROP_TOP = 60;
const IG_CROP_BOTTOM = 52;
const IG_CROP_TOTAL = IG_CROP_TOP + IG_CROP_BOTTOM;

export function SocialVideoPlayer({ url, title, className = "" }: SocialVideoPlayerProps) {
  const info = getSocialVideoInfo(url);
  if (!info) return null;

  const { embedUrl, aspectRatio, platform } = info;
  const iframeTitle = title ?? platform;

  /* ── Instagram — crop native header & footer ──────────────────── */
  if (platform === "instagram") {
    return (
      <div className={`w-full ${className}`}>
        {/*
          Outer div clips the iframe. Its height = full 9:16 height minus the
          cropped regions. We achieve this with the padding-bottom aspect-ratio
          trick adjusted by the pixel crop.
          177.78% = (16/9) * 100% — i.e. full portrait height.
        */}
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            width: "100%",
            paddingBottom: `calc(177.78% - ${IG_CROP_TOTAL}px)`,
          }}
        >
          <iframe
            src={embedUrl}
            title={iframeTitle}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              position: "absolute",
              top: `-${IG_CROP_TOP}px`,
              left: 0,
              width: "100%",
              /* iframe must be as tall as the visible region + the two cropped regions */
              height: `calc(100% + ${IG_CROP_TOTAL}px)`,
              border: "none",
            }}
          />
        </div>
      </div>
    );
  }

  /* ── TikTok — full-width portrait ────────────────────────────── */
  if (aspectRatio === "9/16") {
    return (
      <div className={`flex justify-center ${className}`}>
        <div style={{ aspectRatio: "9/16", width: "min(100%, 420px)" }}>
          <iframe
            src={embedUrl}
            title={iframeTitle}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  /* ── YouTube / Facebook — landscape ──────────────────────────── */
  return (
    <div className={className} style={{ aspectRatio: "16/9" }}>
      <iframe
        src={embedUrl}
        title={iframeTitle}
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
