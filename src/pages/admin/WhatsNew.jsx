import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Check, Edit3, Eye, FileVideo, Image as ImageIcon, Plus, RefreshCw, Search, Sparkles, Trash2, X } from "lucide-react";

import whatsNewApi from "../../api/whatsNewApi";
import { showConfirm, showError, showSuccess } from "../../utils/sweetAlert";

const roleOptions = [
  { key: "all", label: "All Users" },
  { key: "admin", label: "Admin" },
  { key: "staff", label: "Staff" },
  { key: "fm", label: "Farm Manager" },
  { key: "security", label: "Security" },
  { key: "customer", label: "Customer" },
];

const displayModeOptions = [
  {
    key: "every_login",
    label: "Every Login",
  },
  {
    key: "once",
    label: "Once Only",
  },
  {
    key: "until_explored",
    label: "Until Explored",
  },
  {
    key: "once_per_version",
    label: "Once Per Version",
  },
];

const emptyForm = {
  title: "",
  shortDescription: "",
  description: "",

  mediaType: "none",
  mediaSource: "project",
  mediaUrl: "",

  posterSource: "project",
  poster: "",

  autoplay: false,
  muted: true,
  controls: true,
  loop: false,
  playsInline: true,
  volume: 1,

  targetRoles: ["all"],

  version: "1.0",
  displayMode: "once_per_version",

  ctaEnabled: false,
  ctaText: "",
  ctaRoute: "",

  published: false,
  active: true,
  publishAt: "",
  order: 0,
};

const extractFeatures = (response) => {
  if (Array.isArray(response?.features)) {
    return response.features;
  }

  if (Array.isArray(response?.whatsNew)) {
    return response.whatsNew;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

const extractStats = (response) => {
  if (response?.stats && typeof response.stats === "object") {
    return response.stats;
  }

  if (response?.data?.stats && typeof response.data.stats === "object") {
    return response.data.stats;
  }

  return {};
};

const detectYouTubeUrl = (value) => {
  const url = String(value || "").trim();

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
};

const getYouTubeId = (value) => {
  const url = String(value || "").trim();

  if (!url) {
    return "";
  }

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");

    if (hostname === "youtu.be") {
      return parsed.pathname.replace("/", "").split("/")[0];
    }

    if (parsed.pathname === "/watch") {
      return parsed.searchParams.get("v") || "";
    }

    const match = parsed.pathname.match(/\/(?:embed|shorts|live)\/([^/?#]+)/);

    return match?.[1] || "";
  } catch {
    return "";
  }
};

const buildYouTubeEmbedUrl = (value, media = {}) => {
  const youtubeId = getYouTubeId(value);

  if (!youtubeId) {
    return "";
  }

  const params = new URLSearchParams();

  params.set("rel", "0");

  if (media?.autoplay) {
    params.set("autoplay", "1");
  }

  if (media?.muted) {
    params.set("mute", "1");
  }

  params.set("controls", media?.controls === false ? "0" : "1");
  params.set("playsinline", "1");

  if (media?.loop) {
    params.set("loop", "1");
    params.set("playlist", youtubeId);
  }

  return `https://www.youtube.com/embed/${youtubeId}?${params.toString()}`;
};

const getMediaSourceFromValue = (value, type) => {
  const url = String(value || "").trim();

  if (!url) {
    return "project";
  }

  if (type === "video" && detectYouTubeUrl(url)) {
    return "youtube";
  }

  if (/^https?:\/\//i.test(url)) {
    return "url";
  }

  return "project";
};

const normalizeFeature = (feature) => {
  const media = feature?.media || {};
  const cta = feature?.cta || {};

  const mediaType = media?.type || "none";
  const mediaUrl = media?.url || "";
  const poster = media?.poster || "";

  return {
    title: feature?.title || "",
    shortDescription: feature?.shortDescription || "",
    description: feature?.description || "",

    mediaType,
    mediaSource: getMediaSourceFromValue(mediaUrl, mediaType),
    mediaUrl,

    posterSource: getMediaSourceFromValue(poster, "image"),
    poster,

    autoplay: Boolean(media?.autoplay),
    muted: Boolean(media?.muted),
    controls: media?.controls !== false,
    loop: Boolean(media?.loop),
    playsInline: media?.playsInline !== false,
    volume: typeof media?.volume === "number" ? media.volume : 1,

    targetRoles: Array.isArray(feature?.targetRoles) && feature.targetRoles.length > 0 ? feature.targetRoles : ["all"],

    version: feature?.version || "1.0",
    displayMode: feature?.displayMode || "once_per_version",

    ctaEnabled: Boolean(cta?.enabled),
    ctaText: cta?.text || "",
    ctaRoute: cta?.route || "",

    published: Boolean(feature?.published),
    active: feature?.active !== false,
    publishAt: feature?.publishAt ? String(feature.publishAt).slice(0, 16) : "",

    order: typeof feature?.order === "number" ? feature.order : 0,
  };
};

const WhatsNew = () => {
  const [features, setFeatures] = useState([]);
  const [stats, setStats] = useState({});

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [mediaFilter, setMediaFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [previewFeature, setPreviewFeature] = useState(null);

  const fetchFeatures = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [listResponse, statsResponse] = await Promise.all([whatsNewApi.getAdminAll(), whatsNewApi.getAdminStats()]);

      setFeatures(extractFeatures(listResponse));
      setStats(extractStats(statsResponse));
    } catch (err) {
      console.error("What's New admin fetch error:", err);

      showError(err?.data?.message || err?.message || "Unable to load What's New features.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const filteredFeatures = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return [...features]
      .filter((feature) => {
        if (!searchValue) return true;

        return feature?.title?.toLowerCase().includes(searchValue) || feature?.shortDescription?.toLowerCase().includes(searchValue) || feature?.version?.toLowerCase().includes(searchValue);
      })
      .filter((feature) => {
        if (statusFilter === "published") {
          return Boolean(feature?.published);
        }

        if (statusFilter === "draft") {
          return !feature?.published;
        }

        if (statusFilter === "active") {
          return feature?.active !== false;
        }

        if (statusFilter === "inactive") {
          return feature?.active === false;
        }

        return true;
      })
      .filter((feature) => {
        if (mediaFilter === "all") return true;

        return feature?.media?.type === mediaFilter;
      })
      .sort((a, b) => Number(a?.order || 0) - Number(b?.order || 0));
  }, [features, search, statusFilter, mediaFilter]);

  const updateForm = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleMediaTypeChange = (type) => {
    setForm((current) => ({
      ...current,
      mediaType: type,
      mediaSource: type === "video" ? "project" : "project",
      mediaUrl: "",
      posterSource: "project",
      poster: "",
    }));
  };

  const handleMediaSourceChange = (source) => {
    setForm((current) => ({
      ...current,
      mediaSource: source,
      mediaUrl: "",
    }));
  };

  const handlePosterSourceChange = (source) => {
    setForm((current) => ({
      ...current,
      posterSource: source,
      poster: "",
    }));
  };

  const toggleRole = (role) => {
    setForm((current) => {
      const currentRoles = Array.isArray(current.targetRoles) ? current.targetRoles : [];

      if (role === "all") {
        return {
          ...current,
          targetRoles: ["all"],
        };
      }

      const withoutAll = currentRoles.filter((item) => item !== "all");

      if (withoutAll.includes(role)) {
        const updated = withoutAll.filter((item) => item !== role);

        return {
          ...current,
          targetRoles: updated.length > 0 ? updated : ["all"],
        };
      }

      return {
        ...current,
        targetRoles: [...withoutAll, role],
      };
    });
  };

  const openCreate = () => {
    setEditingFeature(null);

    setForm({
      ...emptyForm,
      order: features.length,
    });

    setShowModal(true);
  };

  const openEdit = (feature) => {
    setEditingFeature(feature);
    setForm(normalizeFeature(feature));
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingFeature(null);
    setForm(emptyForm);
  };

  const buildPayload = () => {
    const title = form.title.trim();

    return {
      title,

      shortDescription: form.shortDescription.trim(),
      description: form.description.trim(),

      media: {
        type: form.mediaType,
        url: form.mediaUrl.trim(),
        poster: form.mediaType === "video" ? form.poster.trim() : "",

        autoplay: Boolean(form.autoplay),
        muted: Boolean(form.muted),
        controls: Boolean(form.controls),
        loop: Boolean(form.loop),
        playsInline: Boolean(form.playsInline),
        volume: Number(form.volume),
      },

      targetRoles: form.targetRoles.length > 0 ? form.targetRoles : ["all"],

      version: form.version.trim(),

      displayMode: form.displayMode,

      cta: {
        enabled: Boolean(form.ctaEnabled),
        text: form.ctaText.trim(),
        route: form.ctaRoute.trim(),
      },

      published: Boolean(form.published),
      active: Boolean(form.active),

      publishAt: form.publishAt || null,

      order: Number(form.order || 0),
    };
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      showError("Feature title is required.");
      return;
    }

    if (!form.shortDescription.trim()) {
      showError("Short description is required.");
      return;
    }

    if (!form.version.trim()) {
      showError("Version is required.");
      return;
    }

    if (form.mediaType !== "none" && !form.mediaUrl.trim()) {
      showError(`${form.mediaType === "video" ? "Video" : "Image"} source is required.`);
      return;
    }

    if (form.mediaType === "video" && form.poster.trim() && form.posterSource === "url" && !/^https?:\/\//i.test(form.poster.trim())) {
      showError("Poster Publish URL must start with http:// or https://.");
      return;
    }

    if (form.ctaEnabled && !form.ctaText.trim()) {
      showError("CTA text is required.");
      return;
    }

    if (form.ctaEnabled && !form.ctaRoute.trim()) {
      showError("CTA route is required.");
      return;
    }

    try {
      setSaving(true);

      const payload = buildPayload();

      if (editingFeature?._id) {
        await whatsNewApi.update(editingFeature._id, payload);

        await showSuccess("What's New updated successfully.");
      } else {
        await whatsNewApi.create(payload);

        await showSuccess("What's New feature created successfully.");
      }

      closeModal();
      await fetchFeatures(true);
    } catch (err) {
      console.error("What's New save error:", err);

      showError(err?.data?.message || err?.message || "Unable to save What's New feature.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (feature) => {
    if (!feature?._id) return;

    const result = await showConfirm({
      title: "Delete What's New?",
      text: `Delete "${feature.title}" permanently?`,
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
    });

    if (!result?.isConfirmed) {
      return;
    }

    try {
      await whatsNewApi.remove(feature._id);

      showSuccess("What's New feature deleted successfully.");

      await fetchFeatures(true);
    } catch (err) {
      console.error("What's New delete error:", err);

      showError(err?.data?.message || err?.message || "Unable to delete feature.");
    }
  };

  const handlePublishToggle = async (feature) => {
    if (!feature?._id) return;

    try {
      if (feature.published) {
        await whatsNewApi.unpublish(feature._id);

        showSuccess("Feature unpublished successfully.");
      } else {
        await whatsNewApi.publish(feature._id);

        showSuccess("Feature published successfully.");
      }

      await fetchFeatures(true);
    } catch (err) {
      console.error("What's New publish error:", err);

      showError(err?.data?.message || err?.message || "Unable to update publish status.");
    }
  };

  const handleMoveOrder = async (feature, direction) => {
    const sorted = [...features].sort((a, b) => Number(a?.order || 0) - Number(b?.order || 0));

    const currentIndex = sorted.findIndex((item) => item._id === feature._id);

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex === -1 || targetIndex < 0 || targetIndex >= sorted.length) {
      return;
    }

    const current = sorted[currentIndex];
    const target = sorted[targetIndex];

    try {
      await whatsNewApi.updateOrder([
        {
          id: current._id,
          order: Number(target?.order ?? targetIndex),
        },
        {
          id: target._id,
          order: Number(current?.order ?? currentIndex),
        },
      ]);

      await fetchFeatures(true);
    } catch (err) {
      console.error("What's New order error:", err);

      showError(err?.data?.message || err?.message || "Unable to update feature order.");
    }
  };

  const getStatValue = (keys, fallback = 0) => {
    for (const key of keys) {
      if (stats?.[key] !== undefined && stats?.[key] !== null) {
        return stats[key];
      }
    }

    return fallback;
  };

  const totalCount = getStatValue(["total", "totalFeatures"], features.length);

  const publishedCount = getStatValue(["published", "publishedCount"], features.filter((item) => item.published).length);

  const draftCount = getStatValue(["draft", "draftCount"], features.filter((item) => !item.published).length);

  const activeCount = getStatValue(["active", "activeCount"], features.filter((item) => item.active !== false).length);

  return (
    <section className="farm-whats-new-page">
      <div className="farm-whats-new-header">
        <div className="farm-whats-new-title-row">
          <div className="farm-whats-new-title-icon">
            <Sparkles size={22} />
          </div>

          <div>
            <h1>What's New</h1>
            <p>Manage Farm OS updates, new features and product announcements.</p>
          </div>
        </div>

        <div className="farm-whats-new-header-actions">
          <button type="button" className="farm-whats-new-refresh" onClick={() => fetchFeatures(true)} disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? "farm-whats-new-spin" : ""} />
            Refresh
          </button>

          <button type="button" className="farm-whats-new-add" onClick={openCreate}>
            <Plus size={17} />
            Add Feature
          </button>
        </div>
      </div>

      <div className="farm-whats-new-stats">
        <div className="farm-whats-new-stat">
          <div className="farm-whats-new-stat-icon">
            <Sparkles size={18} />
          </div>

          <div>
            <span>Total Features</span>
            <strong>{totalCount}</strong>
          </div>
        </div>

        <div className="farm-whats-new-stat">
          <div className="farm-whats-new-stat-icon">
            <Eye size={18} />
          </div>

          <div>
            <span>Published</span>
            <strong>{publishedCount}</strong>
          </div>
        </div>

        <div className="farm-whats-new-stat">
          <div className="farm-whats-new-stat-icon">
            <Edit3 size={18} />
          </div>

          <div>
            <span>Drafts</span>
            <strong>{draftCount}</strong>
          </div>
        </div>

        <div className="farm-whats-new-stat">
          <div className="farm-whats-new-stat-icon">
            <Check size={18} />
          </div>

          <div>
            <span>Active</span>
            <strong>{activeCount}</strong>
          </div>
        </div>
      </div>

      <div className="farm-whats-new-filter-card">
        <div className="farm-whats-new-search">
          <Search size={16} />

          <input type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search features..." />

          {search && (
            <button type="button" onClick={() => setSearch("")} aria-label="Clear search">
              <X size={15} />
            </button>
          )}
        </div>

        <div className="farm-whats-new-filter">
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="farm-whats-new-filter">
          <select value={mediaFilter} onChange={(event) => setMediaFilter(event.target.value)}>
            <option value="all">All Media</option>
            <option value="none">No Media</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </div>

        <div className="farm-whats-new-result-count">
          {filteredFeatures.length} feature
          {filteredFeatures.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="farm-whats-new-list">
        {loading ? (
          <div className="farm-whats-new-empty">
            <div className="farm-whats-new-loader" />
            <span>Loading What's New features...</span>
          </div>
        ) : filteredFeatures.length === 0 ? (
          <div className="farm-whats-new-empty">
            <Sparkles size={34} />

            <strong>No What's New features found</strong>

            <span>Create your first feature update to show announcements to users.</span>

            <button type="button" onClick={openCreate}>
              <Plus size={16} />
              Add Feature
            </button>
          </div>
        ) : (
          filteredFeatures.map((feature, index) => {
            const mediaType = feature?.media?.type || "none";

            const roles = Array.isArray(feature?.targetRoles) ? feature.targetRoles : [];

            return (
              <article className="farm-whats-new-item" key={feature._id || index}>
                <div className="farm-whats-new-item-media">
                  {mediaType === "image" && feature?.media?.url ? (
                    <img src={feature.media.url} alt={feature.title || "What's New"} />
                  ) : mediaType === "video" ? (
                    <div className="farm-whats-new-video-placeholder">
                      <FileVideo size={27} />
                      <span>Video</span>
                    </div>
                  ) : (
                    <div className="farm-whats-new-no-media">
                      <Sparkles size={26} />
                      <span>No Media</span>
                    </div>
                  )}

                  <span className="farm-whats-new-version">v{feature.version || "1.0"}</span>
                </div>

                <div className="farm-whats-new-item-main">
                  <div className="farm-whats-new-item-top">
                    <div>
                      <h3>{feature.title}</h3>

                      <p>{feature.shortDescription || "No short description"}</p>
                    </div>

                    <div className="farm-whats-new-item-status">
                      <span className={feature.published ? "published" : "draft"}>{feature.published ? "Published" : "Draft"}</span>

                      <span className={feature.active !== false ? "active" : "inactive"}>{feature.active !== false ? "Active" : "Inactive"}</span>
                    </div>
                  </div>

                  <div className="farm-whats-new-item-meta">
                    <span>Display: {displayModeOptions.find((item) => item.key === feature.displayMode)?.label || feature.displayMode || "—"}</span>

                    <span>Roles: {roles.length > 0 ? roles.map((role) => roleOptions.find((item) => item.key === role)?.label || role).join(", ") : "—"}</span>

                    <span>Media: {mediaType}</span>
                  </div>

                  <div className="farm-whats-new-item-bottom">
                    <div className="farm-whats-new-order">
                      <span>Order {Number(feature.order || 0) + 1}</span>

                      <button type="button" disabled={index === 0} onClick={() => handleMoveOrder(feature, "up")} title="Move Up">
                        <ArrowUp size={14} />
                      </button>

                      <button type="button" disabled={index === filteredFeatures.length - 1} onClick={() => handleMoveOrder(feature, "down")} title="Move Down">
                        <ArrowDown size={14} />
                      </button>
                    </div>

                    <div className="farm-whats-new-actions">
                      <button type="button" className="view" onClick={() => setPreviewFeature(feature)} title="Preview">
                        <Eye size={15} />
                        Preview
                      </button>

                      <button type="button" className="edit" onClick={() => openEdit(feature)} title="Edit">
                        <Edit3 size={15} />
                        Edit
                      </button>

                      <button type="button" className={feature.published ? "unpublish" : "publish"} onClick={() => handlePublishToggle(feature)}>
                        {feature.published ? "Unpublish" : "Publish"}
                      </button>

                      <button type="button" className="delete" onClick={() => handleDelete(feature)} title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {showModal && (
        <div
          className="farm-whats-new-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}>
          <div className="farm-whats-new-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="farm-whats-new-modal-header">
              <div>
                <div className="farm-whats-new-modal-title">
                  <Sparkles size={18} />
                  <h2>{editingFeature ? "Edit What's New" : "Add What's New"}</h2>
                </div>

                <p>Configure the feature announcement shown to users.</p>
              </div>

              <button type="button" onClick={closeModal} disabled={saving} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <form className="farm-whats-new-form" onSubmit={handleSave}>
              <div className="farm-whats-new-form-grid">
                <label>
                  <span>Title *</span>

                  <input type="text" value={form.title} onChange={(event) => updateForm("title", event.target.value)} placeholder="Example: New Farm Dashboard" maxLength={150} />
                </label>

                <label>
                  <span>Version *</span>

                  <input type="text" value={form.version} onChange={(event) => updateForm("version", event.target.value)} placeholder="2.0" />
                </label>
              </div>

              <label>
                <span>Short Description *</span>

                <input type="text" value={form.shortDescription} onChange={(event) => updateForm("shortDescription", event.target.value)} placeholder="Briefly explain what's new..." maxLength={300} />
              </label>

              <label>
                <span>Description</span>

                <textarea value={form.description} onChange={(event) => updateForm("description", event.target.value)} placeholder="Explain the feature in more detail..." rows={4} />
              </label>

              <div className="farm-whats-new-form-section">
                <div className="farm-whats-new-form-section-title">
                  <strong>Media</strong>

                  <span>Add an image or short video for this announcement.</span>
                </div>

                <div className="farm-whats-new-media-types">
                  <button type="button" className={form.mediaType === "none" ? "active" : ""} onClick={() => handleMediaTypeChange("none")}>
                    <Sparkles size={17} />
                    None
                  </button>

                  <button type="button" className={form.mediaType === "image" ? "active" : ""} onClick={() => handleMediaTypeChange("image")}>
                    <ImageIcon size={17} />
                    Image
                  </button>

                  <button type="button" className={form.mediaType === "video" ? "active" : ""} onClick={() => handleMediaTypeChange("video")}>
                    <FileVideo size={17} />
                    Video
                  </button>
                </div>

                {form.mediaType !== "none" && (
                  <>
                    <div className="farm-whats-new-form-grid">
                      <label>
                        <span>{form.mediaType === "video" ? "Video Source" : "Image Source"}</span>

                        <select value={form.mediaSource} onChange={(event) => handleMediaSourceChange(event.target.value)}>
                          <option value="project">Project Folder</option>

                          <option value="url">Publish URL</option>

                          {form.mediaType === "video" && <option value="youtube">YouTube</option>}
                        </select>
                      </label>

                      <label>
                        <span>{form.mediaType === "video" ? "Video Path / URL *" : "Image Path / URL *"}</span>

                        <input
                          type="text"
                          value={form.mediaUrl}
                          onChange={(event) => updateForm("mediaUrl", event.target.value)}
                          placeholder={form.mediaSource === "project" ? (form.mediaType === "video" ? "/videos/farm-tour.mp4" : "/images/farm-dashboard.png") : form.mediaSource === "youtube" ? "https://www.youtube.com/watch?v=..." : "https://..."}
                        />
                      </label>
                    </div>

                    {form.mediaSource === "project" && (
                      <div className="farm-whats-new-media-source-note">
                        Use the path from the Vite
                        <strong> public </strong>
                        folder. Example:
                        <strong> /images/example.png</strong> or
                        <strong> /videos/example.mp4</strong>
                      </div>
                    )}

                    {form.mediaSource === "youtube" && (
                      <div className="farm-whats-new-media-source-note">
                        Paste the normal YouTube publish link, for example:
                        <strong> https://www.youtube.com/watch?v=...</strong>
                      </div>
                    )}

                    {form.mediaType === "video" && (
                      <>
                        <div className="farm-whats-new-form-grid">
                          <label>
                            <span>Poster Source</span>

                            <select value={form.posterSource} onChange={(event) => handlePosterSourceChange(event.target.value)}>
                              <option value="project">Project Folder</option>

                              <option value="url">Publish URL</option>
                            </select>
                          </label>

                          <label>
                            <span>Poster Path / URL</span>

                            <input type="text" value={form.poster} onChange={(event) => updateForm("poster", event.target.value)} placeholder={form.posterSource === "project" ? "/images/video-poster.png" : "https://..."} />
                          </label>
                        </div>

                        <div className="farm-whats-new-video-settings">
                          <label className="farm-whats-new-check">
                            <input type="checkbox" checked={form.autoplay} onChange={(event) => updateForm("autoplay", event.target.checked)} />

                            <span>Autoplay</span>
                          </label>

                          <label className="farm-whats-new-check">
                            <input type="checkbox" checked={form.muted} onChange={(event) => updateForm("muted", event.target.checked)} />

                            <span>Muted</span>
                          </label>

                          <label className="farm-whats-new-check">
                            <input type="checkbox" checked={form.controls} onChange={(event) => updateForm("controls", event.target.checked)} />

                            <span>Controls</span>
                          </label>

                          <label className="farm-whats-new-check">
                            <input type="checkbox" checked={form.loop} onChange={(event) => updateForm("loop", event.target.checked)} />

                            <span>Loop</span>
                          </label>

                          <label className="farm-whats-new-check">
                            <input type="checkbox" checked={form.playsInline} onChange={(event) => updateForm("playsInline", event.target.checked)} />

                            <span>Plays Inline</span>
                          </label>
                        </div>

                        <label>
                          <span>
                            Volume ({Math.round(Number(form.volume) * 100)}
                            %)
                          </span>

                          <input type="range" min="0" max="1" step="0.05" value={form.volume} onChange={(event) => updateForm("volume", Number(event.target.value))} />
                        </label>
                      </>
                    )}
                  </>
                )}
              </div>

              <div className="farm-whats-new-form-section">
                <div className="farm-whats-new-form-section-title">
                  <strong>Target Roles</strong>

                  <span>Select who can see this announcement.</span>
                </div>

                <div className="farm-whats-new-role-grid">
                  {roleOptions.map((role) => {
                    const selected = form.targetRoles.includes(role.key);

                    return (
                      <button type="button" key={role.key} className={selected ? "active" : ""} onClick={() => toggleRole(role.key)}>
                        <span>{selected ? <Check size={14} /> : null}</span>

                        {role.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="farm-whats-new-form-grid">
                <label>
                  <span>Display Mode</span>

                  <select value={form.displayMode} onChange={(event) => updateForm("displayMode", event.target.value)}>
                    {displayModeOptions.map((item) => (
                      <option key={item.key} value={item.key}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Display Order</span>

                  <input type="number" min="0" value={form.order} onChange={(event) => updateForm("order", Number(event.target.value))} />
                </label>
              </div>

              <div className="farm-whats-new-form-section">
                <div className="farm-whats-new-form-section-title">
                  <strong>Call To Action</strong>

                  <span>Add a button that opens a Farm OS page.</span>
                </div>

                <label className="farm-whats-new-check">
                  <input type="checkbox" checked={form.ctaEnabled} onChange={(event) => updateForm("ctaEnabled", event.target.checked)} />

                  <span>Enable CTA</span>
                </label>

                {form.ctaEnabled && (
                  <div className="farm-whats-new-form-grid">
                    <label>
                      <span>Button Text *</span>

                      <input type="text" value={form.ctaText} onChange={(event) => updateForm("ctaText", event.target.value)} placeholder="Show Me How" />
                    </label>

                    <label>
                      <span>Route *</span>

                      <input type="text" value={form.ctaRoute} onChange={(event) => updateForm("ctaRoute", event.target.value)} placeholder="/admin/farm/dashboard" />
                    </label>
                  </div>
                )}
              </div>

              <div className="farm-whats-new-form-section">
                <div className="farm-whats-new-switch-row">
                  <div>
                    <strong>Publish Feature</strong>

                    <span>Published features can appear to eligible users.</span>
                  </div>

                  <button type="button" className={`farm-whats-new-switch ${form.published ? "active" : ""}`} onClick={() => updateForm("published", !form.published)} aria-pressed={form.published}>
                    <span />
                  </button>
                </div>

                <div className="farm-whats-new-divider" />

                <div className="farm-whats-new-switch-row">
                  <div>
                    <strong>Active</strong>

                    <span>Disable the feature without deleting it.</span>
                  </div>

                  <button type="button" className={`farm-whats-new-switch ${form.active ? "active" : ""}`} onClick={() => updateForm("active", !form.active)} aria-pressed={form.active}>
                    <span />
                  </button>
                </div>
              </div>

              <div className="farm-whats-new-modal-footer">
                <button type="button" className="farm-whats-new-cancel" onClick={closeModal} disabled={saving}>
                  Cancel
                </button>

                <button type="submit" className="farm-whats-new-save" disabled={saving}>
                  {saving ? (
                    <>
                      <span className="farm-whats-new-spinner" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      {editingFeature ? "Update Feature" : "Create Feature"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewFeature && (
        <div
          className="farm-whats-new-preview-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setPreviewFeature(null);
            }
          }}>
          <div className="farm-whats-new-preview" onMouseDown={(event) => event.stopPropagation()}>
            <div className="farm-whats-new-preview-head">
              <div>
                <span>What's New Preview</span>

                <h2>{previewFeature.title}</h2>
              </div>

              <button type="button" onClick={() => setPreviewFeature(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="farm-whats-new-preview-media">
              {previewFeature?.media?.type === "image" && previewFeature?.media?.url ? (
                <img src={previewFeature.media.url} alt={previewFeature.title} />
              ) : previewFeature?.media?.type === "video" && previewFeature?.media?.url ? (
                detectYouTubeUrl(previewFeature.media.url) ? (
                  <iframe src={buildYouTubeEmbedUrl(previewFeature.media.url, previewFeature.media)} title={previewFeature.title} className="farm-whats-new-preview-youtube" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                ) : (
                  <video
                    src={previewFeature.media.url}
                    poster={previewFeature.media.poster || undefined}
                    autoPlay={Boolean(previewFeature.media.autoplay)}
                    muted={Boolean(previewFeature.media.muted)}
                    controls={Boolean(previewFeature.media.controls)}
                    loop={Boolean(previewFeature.media.loop)}
                    playsInline
                    preload="metadata"
                  />
                )
              ) : (
                <div>
                  <Sparkles size={35} />
                  <span>No media available</span>
                </div>
              )}
            </div>

            <div className="farm-whats-new-preview-content">
              <span className="farm-whats-new-preview-version">v{previewFeature.version || "1.0"}</span>

              <h3>{previewFeature.title}</h3>

              {previewFeature.shortDescription && <p>{previewFeature.shortDescription}</p>}

              {previewFeature.description && <div>{previewFeature.description}</div>}

              {previewFeature?.cta?.enabled && previewFeature?.cta?.text && (
                <button type="button" className="farm-whats-new-preview-cta">
                  {previewFeature.cta.text}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
.farm-whats-new-page{width:100%;max-width:1500px;margin:0 auto}
.farm-whats-new-header{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:22px}
.farm-whats-new-title-row{display:flex;align-items:center;gap:13px}
.farm-whats-new-title-icon{width:44px;height:44px;border-radius:13px;display:grid;place-items:center;background:var(--admin-primary-soft);color:var(--admin-primary);flex:0 0 auto}
.farm-whats-new-title-row h1{margin:0;color:var(--admin-text);font-size:26px;line-height:1.2}
.farm-whats-new-title-row p{margin:6px 0 0;color:var(--admin-muted);font-size:13px}
.farm-whats-new-header-actions{display:flex;align-items:center;gap:9px}
.farm-whats-new-refresh,.farm-whats-new-add{height:40px;padding:0 13px;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;gap:7px;font:inherit;font-size:12px;font-weight:700;cursor:pointer;transition:.2s ease}
.farm-whats-new-refresh{border:1px solid var(--admin-border);background:var(--admin-surface);color:var(--admin-text)}
.farm-whats-new-refresh:hover{border-color:var(--admin-primary);color:var(--admin-primary)}
.farm-whats-new-add{border:1px solid var(--admin-primary);background:var(--admin-primary);color:#071006}
.farm-whats-new-add:hover{filter:brightness(1.05)}
.farm-whats-new-refresh:disabled,.farm-whats-new-add:disabled{opacity:.6;cursor:not-allowed}
.farm-whats-new-spin{animation:farm-whats-new-spin .7s linear infinite}
@keyframes farm-whats-new-spin{to{transform:rotate(360deg)}}
.farm-whats-new-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:13px;margin-bottom:16px}
.farm-whats-new-stat{min-height:82px;padding:14px;background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:14px;display:flex;align-items:center;gap:11px}
.farm-whats-new-stat-icon{width:38px;height:38px;display:grid;place-items:center;border-radius:10px;background:var(--admin-primary-soft);color:var(--admin-primary);flex:0 0 auto}
.farm-whats-new-stat span{display:block;color:var(--admin-muted);font-size:11px}
.farm-whats-new-stat strong{display:block;margin-top:4px;color:var(--admin-text);font-size:21px;line-height:1}
.farm-whats-new-filter-card{display:flex;align-items:center;gap:10px;margin-bottom:15px;padding:12px;background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:14px}
.farm-whats-new-search{height:38px;min-width:250px;flex:1;display:flex;align-items:center;gap:8px;padding:0 10px;border:1px solid var(--admin-border);border-radius:9px;background:var(--admin-surface-2);color:var(--admin-muted)}
.farm-whats-new-search:focus-within{border-color:var(--admin-primary)}
.farm-whats-new-search input{width:100%;height:100%;border:0;outline:0;background:transparent;color:var(--admin-text);font:inherit;font-size:12px}
.farm-whats-new-search input::placeholder{color:var(--admin-muted)}
.farm-whats-new-search button{width:25px;height:25px;border:0;background:transparent;color:var(--admin-muted);display:grid;place-items:center;cursor:pointer}
.farm-whats-new-filter{position:relative;width:155px}
.farm-whats-new-filter select{appearance:none;width:100%;height:38px;border:1px solid var(--admin-border);border-radius:9px;background:var(--admin-surface-2);color:var(--admin-text);padding:0 10px;font:inherit;font-size:12px;outline:0;cursor:pointer}
.farm-whats-new-result-count{min-width:90px;text-align:right;color:var(--admin-muted);font-size:11px;font-weight:700}
.farm-whats-new-list{display:flex;flex-direction:column;gap:11px}
.farm-whats-new-item{display:grid;grid-template-columns:190px minmax(0,1fr);min-height:190px;overflow:hidden;background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:15px}
.farm-whats-new-item-media{position:relative;min-height:190px;background:var(--admin-surface-2);overflow:hidden}
.farm-whats-new-item-media img{width:100%;height:100%;display:block;object-fit:cover}
.farm-whats-new-video-placeholder,.farm-whats-new-no-media{width:100%;height:100%;min-height:190px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;color:var(--admin-muted);font-size:11px}
.farm-whats-new-version{position:absolute;top:9px;right:9px;padding:5px 8px;border-radius:999px;background:rgba(15,23,42,.8);color:#fff;font-size:10px;font-weight:800}
.farm-whats-new-item-main{min-width:0;padding:16px 17px;display:flex;flex-direction:column}
.farm-whats-new-item-top{display:flex;align-items:flex-start;justify-content:space-between;gap:15px}
.farm-whats-new-item-top h3{margin:0;color:var(--admin-text);font-size:16px;line-height:1.35}
.farm-whats-new-item-top p{margin:5px 0 0;color:var(--admin-muted);font-size:12px;line-height:1.5}
.farm-whats-new-item-status{display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:flex-end}
.farm-whats-new-item-status span{padding:5px 8px;border-radius:999px;font-size:9px;font-weight:800}
.farm-whats-new-item-status .published{background:rgba(34,197,94,.12);color:#22c55e}
.farm-whats-new-item-status .draft{background:rgba(245,158,11,.12);color:#f59e0b}
.farm-whats-new-item-status .active{background:var(--admin-primary-soft);color:var(--admin-primary)}
.farm-whats-new-item-status .inactive{background:rgba(239,68,68,.12);color:#ef4444}
.farm-whats-new-item-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:13px}
.farm-whats-new-item-meta span{padding:5px 8px;border:1px solid var(--admin-border);border-radius:7px;color:var(--admin-muted);font-size:10px;background:var(--admin-surface-2)}
.farm-whats-new-item-bottom{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:auto;padding-top:13px;border-top:1px solid var(--admin-border)}
.farm-whats-new-order{display:flex;align-items:center;gap:5px;color:var(--admin-muted);font-size:10px}
.farm-whats-new-order button{width:27px;height:27px;border:1px solid var(--admin-border);border-radius:7px;background:var(--admin-surface-2);color:var(--admin-muted);display:grid;place-items:center;cursor:pointer}
.farm-whats-new-order button:hover:not(:disabled){border-color:var(--admin-primary);color:var(--admin-primary)}
.farm-whats-new-order button:disabled{opacity:.35;cursor:not-allowed}
.farm-whats-new-actions{display:flex;align-items:center;justify-content:flex-end;gap:6px;flex-wrap:wrap}
.farm-whats-new-actions button{height:32px;padding:0 9px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;gap:5px;font:inherit;font-size:10px;font-weight:700;cursor:pointer;transition:.2s ease}
.farm-whats-new-actions .view{border:1px solid var(--admin-border);background:var(--admin-surface-2);color:var(--admin-text)}
.farm-whats-new-actions .edit{border:1px solid var(--admin-border);background:var(--admin-surface-2);color:var(--admin-primary)}
.farm-whats-new-actions .publish{border:1px solid rgba(34,197,94,.3);background:rgba(34,197,94,.08);color:#22c55e}
.farm-whats-new-actions .unpublish{border:1px solid rgba(245,158,11,.3);background:rgba(245,158,11,.08);color:#f59e0b}
.farm-whats-new-actions .delete{width:32px;padding:0;border:1px solid rgba(239,68,68,.25);background:rgba(239,68,68,.07);color:#ef4444}
.farm-whats-new-actions button:hover{filter:brightness(1.08)}
.farm-whats-new-empty{min-height:260px;padding:35px 20px;background:var(--admin-surface);border:1px dashed var(--admin-border);border-radius:15px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:var(--admin-muted);text-align:center}
.farm-whats-new-empty svg{color:var(--admin-primary)}
.farm-whats-new-empty strong{color:var(--admin-text);font-size:14px}
.farm-whats-new-empty span{font-size:12px}
.farm-whats-new-empty button{height:35px;margin-top:6px;padding:0 12px;border:1px solid var(--admin-primary);border-radius:8px;background:var(--admin-primary);color:#071006;display:inline-flex;align-items:center;gap:6px;font:inherit;font-size:11px;font-weight:700;cursor:pointer}
.farm-whats-new-loader{width:24px;height:24px;border:3px solid var(--admin-border);border-top-color:var(--admin-primary);border-radius:50%;animation:farm-whats-new-spin .7s linear infinite}
.farm-whats-new-modal-backdrop,.farm-whats-new-preview-backdrop{position:fixed;z-index:1000;inset:0;padding:20px;background:rgba(0,0,0,.65);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center}
.farm-whats-new-modal{width:min(820px,100%);max-height:calc(100vh - 40px);overflow:auto;background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:16px;box-shadow:0 25px 80px rgba(0,0,0,.35)}
.farm-whats-new-modal-header{padding:17px 18px;border-bottom:1px solid var(--admin-border);display:flex;align-items:flex-start;justify-content:space-between;gap:15px}
.farm-whats-new-modal-title{display:flex;align-items:center;gap:8px;color:var(--admin-primary)}
.farm-whats-new-modal-title h2{margin:0;color:var(--admin-text);font-size:18px}
.farm-whats-new-modal-header p{margin:5px 0 0;color:var(--admin-muted);font-size:11px}
.farm-whats-new-modal-header>button{width:32px;height:32px;border:1px solid var(--admin-border);border-radius:8px;background:var(--admin-surface-2);color:var(--admin-muted);display:grid;place-items:center;cursor:pointer}
.farm-whats-new-form{padding:18px;display:flex;flex-direction:column;gap:15px}
.farm-whats-new-form label{display:flex;flex-direction:column;gap:6px;min-width:0}
.farm-whats-new-form label>span{color:var(--admin-text);font-size:11px;font-weight:700}
.farm-whats-new-form input,.farm-whats-new-form textarea,.farm-whats-new-form select{width:100%;border:1px solid var(--admin-border);border-radius:9px;background:var(--admin-surface-2);color:var(--admin-text);font:inherit;font-size:12px;outline:0}
.farm-whats-new-form input,.farm-whats-new-form select{height:38px;padding:0 10px}
.farm-whats-new-form textarea{padding:10px;resize:vertical;line-height:1.5}
.farm-whats-new-form input:focus,.farm-whats-new-form textarea:focus,.farm-whats-new-form select:focus{border-color:var(--admin-primary)}
.farm-whats-new-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px}
.farm-whats-new-form-section{padding:14px;border:1px solid var(--admin-border);border-radius:12px;background:var(--admin-surface-2);display:flex;flex-direction:column;gap:13px}
.farm-whats-new-form-section-title strong{display:block;color:var(--admin-text);font-size:13px}
.farm-whats-new-form-section-title span{display:block;margin-top:4px;color:var(--admin-muted);font-size:11px;line-height:1.4}
.farm-whats-new-media-types{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.farm-whats-new-media-types button{height:38px;border:1px solid var(--admin-border);border-radius:8px;background:var(--admin-surface);color:var(--admin-muted);display:flex;align-items:center;justify-content:center;gap:6px;font:inherit;font-size:11px;font-weight:700;cursor:pointer}
.farm-whats-new-media-types button.active{border-color:var(--admin-primary);background:var(--admin-primary-soft);color:var(--admin-primary)}
.farm-whats-new-video-settings{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.farm-whats-new-check{display:flex!important;flex-direction:row!important;align-items:center;gap:7px!important;padding:9px 10px;border:1px solid var(--admin-border);border-radius:8px;background:var(--admin-surface);cursor:pointer}
.farm-whats-new-check input{width:15px!important;height:15px!important;accent-color:var(--admin-primary);cursor:pointer}
.farm-whats-new-check span{font-size:11px!important;color:var(--admin-text)!important;font-weight:600!important}
.farm-whats-new-role-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}
.farm-whats-new-role-grid button{min-height:38px;border:1px solid var(--admin-border);border-radius:8px;background:var(--admin-surface);color:var(--admin-muted);display:flex;align-items:center;justify-content:center;gap:5px;font:inherit;font-size:10px;font-weight:700;cursor:pointer}
.farm-whats-new-role-grid button.active{border-color:var(--admin-primary);background:var(--admin-primary-soft);color:var(--admin-text)}
.farm-whats-new-role-grid button>span{width:17px;height:17px;border:1px solid var(--admin-border);border-radius:5px;display:grid;place-items:center;color:var(--admin-primary)}
.farm-whats-new-role-grid button.active>span{border-color:var(--admin-primary)}
.farm-whats-new-switch-row{display:flex;align-items:center;justify-content:space-between;gap:15px}
.farm-whats-new-switch-row strong{display:block;color:var(--admin-text);font-size:12px}
.farm-whats-new-switch-row span:not(.farm-whats-new-switch span){display:block;margin-top:4px;color:var(--admin-muted);font-size:10px}
.farm-whats-new-switch{position:relative;width:45px;height:24px;flex:0 0 auto;border:1px solid var(--admin-border);border-radius:999px;background:var(--admin-surface);cursor:pointer}
.farm-whats-new-switch>span{position:absolute;top:50%;left:3px;width:16px;height:16px;margin:0!important;border-radius:50%;background:var(--admin-muted);transform:translateY(-50%);transition:.2s ease}
.farm-whats-new-switch.active{border-color:var(--admin-primary);background:var(--admin-primary)}
.farm-whats-new-switch.active>span{left:24px;background:#fff}
.farm-whats-new-divider{height:1px;background:var(--admin-border)}
.farm-whats-new-modal-footer{display:flex;align-items:center;justify-content:flex-end;gap:9px;padding-top:3px}
.farm-whats-new-cancel,.farm-whats-new-save{height:39px;padding:0 14px;border-radius:9px;display:inline-flex;align-items:center;justify-content:center;gap:7px;font:inherit;font-size:11px;font-weight:700;cursor:pointer}
.farm-whats-new-cancel{border:1px solid var(--admin-border);background:var(--admin-surface-2);color:var(--admin-text)}
.farm-whats-new-save{border:1px solid var(--admin-primary);background:var(--admin-primary);color:#071006;min-width:125px}
.farm-whats-new-cancel:disabled,.farm-whats-new-save:disabled{opacity:.6;cursor:not-allowed}
.farm-whats-new-spinner{width:14px;height:14px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:farm-whats-new-spin .7s linear infinite}
.farm-whats-new-preview{width:min(700px,100%);max-height:calc(100vh - 40px);overflow:auto;background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:16px;box-shadow:0 25px 80px rgba(0,0,0,.35)}
.farm-whats-new-preview-head{padding:15px 17px;border-bottom:1px solid var(--admin-border);display:flex;align-items:flex-start;justify-content:space-between;gap:15px}
.farm-whats-new-preview-head span{color:var(--admin-primary);font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em}
.farm-whats-new-preview-head h2{margin:4px 0 0;color:var(--admin-text);font-size:18px}
.farm-whats-new-preview-head button{width:32px;height:32px;border:1px solid var(--admin-border);border-radius:8px;background:var(--admin-surface-2);color:var(--admin-muted);display:grid;place-items:center;cursor:pointer}
.farm-whats-new-preview-media{width:100%;aspect-ratio:16/9;background:var(--admin-surface-2);overflow:hidden}
.farm-whats-new-preview-media img,.farm-whats-new-preview-media video{width:100%;height:100%;display:block;object-fit:cover}
.farm-whats-new-preview-youtube{width:100%;height:100%;display:block;border:0;background:#000}
.farm-whats-new-preview-media>div{height:100%;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;color:var(--admin-muted);font-size:12px}
.farm-whats-new-preview-content{padding:19px}
.farm-whats-new-preview-version{display:inline-flex;padding:5px 8px;border-radius:999px;background:var(--admin-primary-soft);color:var(--admin-primary);font-size:10px;font-weight:800}
.farm-whats-new-preview-content h3{margin:10px 0 0;color:var(--admin-text);font-size:21px}
.farm-whats-new-preview-content p{margin:6px 0 0;color:var(--admin-muted);font-size:13px;line-height:1.5}
.farm-whats-new-preview-content>div{margin-top:13px;color:var(--admin-text);font-size:13px;line-height:1.65;white-space:pre-line}
.farm-whats-new-preview-cta{height:37px;margin-top:16px;padding:0 13px;border:1px solid var(--admin-primary);border-radius:8px;background:var(--admin-primary);color:#071006;font:inherit;font-size:11px;font-weight:700}

.farm-whats-new-media-source-note{padding:9px 10px;border:1px dashed var(--admin-border);border-radius:8px;color:var(--admin-muted);font-size:10px;line-height:1.5}
.farm-whats-new-media-source-note strong{color:var(--admin-text)}

@media(max-width:1100px){
.farm-whats-new-stats{grid-template-columns:repeat(2,minmax(0,1fr))}
.farm-whats-new-item{grid-template-columns:160px minmax(0,1fr)}
.farm-whats-new-video-settings{grid-template-columns:repeat(2,minmax(0,1fr))}
.farm-whats-new-role-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
}

@media(max-width:800px){
.farm-whats-new-header{align-items:flex-start;flex-direction:column}
.farm-whats-new-header-actions{width:100%;justify-content:flex-end}
.farm-whats-new-filter-card{flex-wrap:wrap}
.farm-whats-new-search{min-width:200px}
.farm-whats-new-filter{width:calc(50% - 5px)}
.farm-whats-new-result-count{width:100%;text-align:left}
.farm-whats-new-item{grid-template-columns:1fr}
.farm-whats-new-item-media{min-height:200px}
.farm-whats-new-video-placeholder,.farm-whats-new-no-media{min-height:200px}
}

@media(max-width:600px){
.farm-whats-new-title-row h1{font-size:21px}
.farm-whats-new-title-row p{font-size:11px}
.farm-whats-new-header-actions{justify-content:stretch}
.farm-whats-new-refresh,.farm-whats-new-add{flex:1}
.farm-whats-new-stats{grid-template-columns:1fr 1fr;gap:9px}
.farm-whats-new-stat{min-height:70px;padding:11px}
.farm-whats-new-stat-icon{width:34px;height:34px}
.farm-whats-new-stat strong{font-size:18px}
.farm-whats-new-filter-card{padding:9px}
.farm-whats-new-search{width:100%;min-width:0}
.farm-whats-new-filter{width:calc(50% - 5px)}
.farm-whats-new-item-main{padding:13px}
.farm-whats-new-item-top{flex-direction:column}
.farm-whats-new-item-status{justify-content:flex-start}
.farm-whats-new-item-bottom{align-items:flex-start;flex-direction:column}
.farm-whats-new-actions{width:100%;justify-content:flex-start}
.farm-whats-new-form{padding:13px}
.farm-whats-new-form-grid{grid-template-columns:1fr}
.farm-whats-new-video-settings{grid-template-columns:1fr}
.farm-whats-new-role-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
.farm-whats-new-modal-backdrop,.farm-whats-new-preview-backdrop{padding:8px}
.farm-whats-new-modal,.farm-whats-new-preview{max-height:calc(100vh - 16px);border-radius:12px}
.farm-whats-new-modal-footer{position:sticky;bottom:0;padding-top:10px;background:var(--admin-surface)}
}

@media(max-width:380px){
.farm-whats-new-stats{gap:7px}
.farm-whats-new-stat{gap:7px;padding:9px}
.farm-whats-new-stat span{font-size:9px}
.farm-whats-new-stat strong{font-size:16px}
.farm-whats-new-filter{width:100%}
.farm-whats-new-role-grid{grid-template-columns:1fr 1fr}
}
      `}</style>
    </section>
  );
};

export default WhatsNew;
