export type SocialPlatform = "youtube" | "tiktok" | "instagram" | "facebook";

export interface SocialVideoInfo {
  platform: SocialPlatform;
  embedUrl: string;
  aspectRatio: "16/9" | "9/16";
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /\/embed\/([a-zA-Z0-9_-]{11})/,
    /\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

export function getSocialVideoInfo(url: string): SocialVideoInfo | null {
  try {
    const u = new URL(url);
    const hostname = u.hostname.replace(/^www\./, "").toLowerCase();

    if (hostname === "youtube.com" || hostname === "youtu.be") {
      const id = extractYouTubeId(url);
      if (!id) return null;
      return {
        platform: "youtube",
        embedUrl: `https://www.youtube.com/embed/${id}?rel=0`,
        aspectRatio: "16/9",
      };
    }

    if (hostname === "tiktok.com") {
      const m = u.pathname.match(/\/video\/(\d+)/);
      if (!m) return null;
      return {
        platform: "tiktok",
        embedUrl: `https://www.tiktok.com/embed/v2/${m[1]}`,
        aspectRatio: "9/16",
      };
    }

    if (hostname === "instagram.com") {
      const m = u.pathname.match(/\/(?:reel|p)\/([A-Za-z0-9_-]+)/);
      if (!m) return null;
      return {
        platform: "instagram",
        embedUrl: `https://www.instagram.com/p/${m[1]}/embed/`,
        aspectRatio: "9/16",
      };
    }

    if (hostname === "facebook.com" || hostname === "fb.watch") {
      return {
        platform: "facebook",
        embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=560&mute=0`,
        aspectRatio: "16/9",
      };
    }

    return null;
  } catch {
    return null;
  }
}

export function isAllowedVideoUrl(url: string): boolean {
  return getSocialVideoInfo(url) !== null;
}
