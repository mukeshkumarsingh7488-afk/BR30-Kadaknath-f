import { useEffect, useMemo, useRef, useState } from "react";
import { ImageOff, Play, VideoOff } from "lucide-react";

const WhatsNewMedia = ({ media, title = "What's New" }) => {
  const videoRef = useRef(null);

  const [mediaError, setMediaError] = useState(false);

  const mediaData = media || {};

  const type = mediaData.type || "none";
  const url = String(mediaData.url || "").trim();
  const poster = String(mediaData.poster || "").trim();

  const isYouTubeUrl = useMemo(() => {
    if (!url) {
      return false;
    }

    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");

      return hostname === "youtube.com" || hostname === "m.youtube.com" || hostname === "youtu.be";
    } catch {
      return false;
    }
  }, [url]);

  const youtubeId = useMemo(() => {
    if (!isYouTubeUrl || !url) {
      return "";
    }

    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");

      if (hostname === "youtu.be") {
        return parsed.pathname.replace(/^\/+/, "").split("/")[0];
      }

      if (parsed.pathname === "/watch") {
        return parsed.searchParams.get("v") || "";
      }

      const embedMatch = parsed.pathname.match(/\/(?:embed|shorts|live)\/([^/?#]+)/);

      if (embedMatch?.[1]) {
        return embedMatch[1];
      }

      return "";
    } catch {
      return "";
    }
  }, [isYouTubeUrl, url]);

  useEffect(() => {
    setMediaError(false);
  }, [type, url, poster]);

  useEffect(() => {
    if (type !== "video" || isYouTubeUrl || !videoRef.current) {
      return;
    }

    const video = videoRef.current;

    video.volume = typeof mediaData.volume === "number" ? Math.min(1, Math.max(0, mediaData.volume)) : 1;

    if (mediaData.autoplay) {
      const playVideo = async () => {
        try {
          await video.play();
        } catch (error) {
          console.debug("What's New video autoplay blocked:", error);
        }
      };

      playVideo();
    }
  }, [type, url, isYouTubeUrl, mediaData.volume, mediaData.autoplay, mediaData.muted]);

  const youtubeEmbedUrl = useMemo(() => {
    if (!youtubeId) {
      return "";
    }

    const params = new URLSearchParams();

    /*
      Important:
      rel=0      -> related videos limited
      playsinline=1 -> inline playback
    */
    params.set("rel", "0");
    params.set("playsinline", "1");

    /*
      YouTube autoplay.
      Browser autoplay generally requires muted playback.
    */
    if (mediaData.autoplay) {
      params.set("autoplay", "1");
    }

    if (mediaData.muted) {
      params.set("mute", "1");
    }

    /*
      Controls
    */
    params.set("controls", mediaData.controls === false ? "0" : "1");

    /*
      Loop
    */
    if (mediaData.loop) {
      params.set("loop", "1");
      params.set("playlist", youtubeId);
    }

    return `https://www.youtube.com/embed/${youtubeId}?${params.toString()}`;
  }, [youtubeId, mediaData.autoplay, mediaData.muted, mediaData.controls, mediaData.loop]);

  const renderEmpty = () => (
    <div className="whats-new-media whats-new-media-empty">
      <div className="whats-new-media-empty-icon">
        <Play size={30} strokeWidth={1.7} />
      </div>

      <span>No media available</span>
    </div>
  );

  const renderError = () => (
    <div className="whats-new-media whats-new-media-error">
      {type === "video" ? <VideoOff size={34} strokeWidth={1.7} /> : <ImageOff size={34} strokeWidth={1.7} />}

      <span>Unable to load {type === "video" ? "video" : "image"}</span>
    </div>
  );

  const renderImage = () => (
    <div className="whats-new-media">
      <img src={url} alt={title} className="whats-new-media-image" onError={() => setMediaError(true)} />
    </div>
  );

  const renderYoutube = () => {
    if (!youtubeEmbedUrl) {
      return renderError();
    }

    /*
      IMPORTANT:
      YouTube iframe direct render.
      No poster state.
      No youtubeStarted state.
      No iframe unmount/remount.
    */
    return (
      <div className="whats-new-media whats-new-youtube-media">
        <iframe src={youtubeEmbedUrl} title={title} className="whats-new-media-youtube" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
      </div>
    );
  };

  const renderNormalVideo = () => (
    <div className="whats-new-media">
      <video
        ref={videoRef}
        src={url}
        poster={poster || undefined}
        className="whats-new-media-video"
        autoPlay={Boolean(mediaData.autoplay)}
        muted={Boolean(mediaData.muted)}
        controls={Boolean(mediaData.controls)}
        loop={Boolean(mediaData.loop)}
        playsInline={mediaData.playsInline !== false}
        preload="metadata"
        onError={() => setMediaError(true)}
      />
    </div>
  );

  let content = renderEmpty();

  if (type !== "none" && url) {
    if (mediaError) {
      content = renderError();
    } else if (type === "image") {
      content = renderImage();
    } else if (type === "video") {
      content = isYouTubeUrl ? renderYoutube() : renderNormalVideo();
    } else {
      content = (
        <div className="whats-new-media whats-new-media-error">
          <ImageOff size={34} strokeWidth={1.7} />
          <span>Unsupported media type</span>
        </div>
      );
    }
  }

  return (
    <>
      {content}

      <style>{`
        .whats-new-media{width:100%;height:100%;min-height:260px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:var(--admin-surface-2,#f5f7fa);border-radius:14px}

        .whats-new-media-image{width:100%;height:100%;min-height:260px;display:block;object-fit:cover}

        .whats-new-media-video{width:100%;height:100%;min-height:260px;display:block;object-fit:cover;background:#000;border-radius:14px}

        .whats-new-youtube-media{position:relative;width:100%;height:100%;min-height:260px;background:#000;border-radius:14px;overflow:hidden}

        .whats-new-media-youtube{width:100%;height:100%;min-height:260px;display:block;border:0;background:#000;border-radius:14px}

        .whats-new-media-empty,.whats-new-media-error{flex-direction:column;gap:10px;color:var(--admin-muted,#64748b);font-size:14px;text-align:center}

        .whats-new-media-empty-icon{width:58px;height:58px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(59,130,246,.1);color:#3b82f6}

        .whats-new-media-error svg{opacity:.65}

        @media(max-width:768px){
          .whats-new-media{min-height:210px}

          .whats-new-media-image,.whats-new-media-video,.whats-new-media-youtube{min-height:210px}

          .whats-new-youtube-media{min-height:210px}
        }

        @media(max-width:480px){
          .whats-new-media{min-height:180px;border-radius:10px}

          .whats-new-media-image,.whats-new-media-video,.whats-new-media-youtube{min-height:180px}

          .whats-new-youtube-media{min-height:180px;border-radius:10px}
        }
      `}</style>
    </>
  );
};

export default WhatsNewMedia;
