import { getSocialVideoInfo } from "@/lib/socialVideo";

interface SocialVideoPlayerProps {
  url: string;
  title?: string;
  className?: string;
}

const IG_CROP_TOP = 60;
const IG_CROP_BOTTOM = 90;
const IG_VISIBLE_H = 450;

export function SocialVideoPlayer({ url, title, className = "" }: SocialVideoPlayerProps) {
  const info = getSocialVideoInfo(url);
  if (!info) return null;

  const { embedUrl, aspectRatio, platform } = info;
  const iframeTitle = title ?? platform;

  /* ── Instagram — strict height cap + double-crop (absolute + clip-path) ── */
  if (platform === "instagram") {
    return (
      <div className={`w-full flex justify-center ${className}`}>
        {/*
          Outer box: fixed height + overflow:hidden — this is the actual clip boundary.
          The iframe is shifted up by IG_CROP_TOP so Instagram's header scrolls out of
          view above the container. The iframe is also made tall enough so the footer
          scrolls out of view below.
          clip-path provides a secondary hard cut on the bottom 90px as a safeguard
          against caption text or action bars that float above the footer region.
        */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: IG_VISIBLE_H,
            overflow: "hidden",
          }}
        >
          <iframe
            src={embedUrl}
            title={iframeTitle}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              position: "absolute",
              top: -IG_CROP_TOP,
              left: 0,
              width: "100%",
              height: IG_VISIBLE_H + IG_CROP_TOP + IG_CROP_BOTTOM,
              border: "none",
              clipPath: `inset(${IG_CROP_TOP}px 0 ${IG_CROP_BOTTOM}px 0)`,
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
