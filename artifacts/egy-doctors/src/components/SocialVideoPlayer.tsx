import { getSocialVideoInfo } from "@/lib/socialVideo";

interface SocialVideoPlayerProps {
  url: string;
  title?: string;
  className?: string;
}

export function SocialVideoPlayer({ url, title, className = "" }: SocialVideoPlayerProps) {
  const info = getSocialVideoInfo(url);
  if (!info) return null;

  const { embedUrl, aspectRatio, platform } = info;
  const iframeTitle = title ?? platform;
  const iframeProps = {
    src: embedUrl,
    className: "w-full h-full border-0",
    allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
    allowFullScreen: true as const,
    title: iframeTitle,
  };

  if (aspectRatio === "9/16") {
    return (
      <div className={`flex justify-center ${className}`}>
        <div style={{ aspectRatio: "9/16", width: "min(100%, 340px)" }}>
          <iframe {...iframeProps} />
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ aspectRatio: "16/9" }}>
      <iframe {...iframeProps} />
    </div>
  );
}
