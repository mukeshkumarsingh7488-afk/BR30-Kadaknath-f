import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import whatsNewApi from "../api/whatsNewApi";

const WhatsNewContext = createContext(null);

const LOGIN_SESSION_KEY = "br30_login_session";
const POPUP_SESSION_KEY = "br30_whatsnew_popup_session";

export const WhatsNewProvider = ({ children }) => {
  const [features, setFeatures] = useState([]);
  const [popupFeatures, setPopupFeatures] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [isOpen, setIsOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadRequestRef = useRef(false);

  /* =========================================================
     SESSION HELPERS
  ========================================================= */

  const getLoginSessionId = useCallback(() => {
    return localStorage.getItem(LOGIN_SESSION_KEY) || "";
  }, []);

  const getPopupSessionId = useCallback(() => {
    return sessionStorage.getItem(POPUP_SESSION_KEY) || "";
  }, []);

  const setPopupSessionId = useCallback((sessionId) => {
    if (!sessionId) {
      return;
    }

    sessionStorage.setItem(POPUP_SESSION_KEY, sessionId);
  }, []);

  const clearPopupSession = useCallback(() => {
    sessionStorage.removeItem(POPUP_SESSION_KEY);
  }, []);

  /* =========================================================
     LOAD WHAT'S NEW
  ========================================================= */

  const loadWhatsNew = useCallback(async () => {
    const token = localStorage.getItem("br30_access_token");

    if (!token) {
      setFeatures([]);
      setPopupFeatures([]);
      setCurrentIndex(0);
      setIsOpen(false);
      clearPopupSession();
      return;
    }

    try {
      loadRequestRef.current = true;

      setLoading(true);
      setError("");

      const response = await whatsNewApi.getAvailable();

      const allFeatures = Array.isArray(response?.features) ? response.features : [];

      const availablePopupFeatures = Array.isArray(response?.popupFeatures) ? response.popupFeatures : [];

      const currentSessionId = getLoginSessionId();
      const alreadyOpenedInThisSession = currentSessionId && getPopupSessionId() === currentSessionId;

      /*
       * Backend shouldShow is the primary source.
       *
       * Frontend session guard prevents the popup from opening
       * again after a refresh during the same login session.
       */
      let finalPopupFeatures = availablePopupFeatures;

      if (alreadyOpenedInThisSession) {
        finalPopupFeatures = [];
      }

      setFeatures(allFeatures);
      setPopupFeatures(finalPopupFeatures);
      setCurrentIndex(0);

      console.log("WHAT'S NEW DEBUG:", {
        allFeatures,
        availablePopupFeatures,
        finalPopupFeatures,
        popupCount: finalPopupFeatures.length,
        currentSessionId,
        alreadyOpenedInThisSession,
      });

      if (finalPopupFeatures.length > 0) {
        /*
         * Mark this login session as having opened the popup.
         *
         * Refresh ke baad ye same session ID milegi, therefore
         * popup dobara automatically open nahi hoga.
         */
        setPopupSessionId(currentSessionId);

        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    } catch (err) {
      console.error("What's New load error:", err);

      setFeatures([]);
      setPopupFeatures([]);
      setCurrentIndex(0);
      setIsOpen(false);

      setError(err?.message || "Failed to load What's New");
    } finally {
      loadRequestRef.current = false;
      setLoading(false);
    }
  }, [clearPopupSession, getLoginSessionId, getPopupSessionId, setPopupSessionId]);

  /* =========================================================
     INITIAL LOAD + AUTH CHANGE
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    const handleAuthChanged = async () => {
      if (!mounted) {
        return;
      }

      /*
       * Logout par AuthContext login session remove karta hai.
       * Isliye old popup-session marker bhi clear kar do.
       */
      const token = localStorage.getItem("br30_access_token");

      if (!token) {
        clearPopupSession();

        setFeatures([]);
        setPopupFeatures([]);
        setCurrentIndex(0);
        setIsOpen(false);

        return;
      }

      setTimeout(async () => {
        if (!mounted) {
          return;
        }

        if (loadRequestRef.current) {
          return;
        }

        await loadWhatsNew();
      }, 150);
    };

    const handleStorage = (event) => {
      if (event.key !== "br30_access_token") {
        return;
      }

      if (event.newValue) {
        setTimeout(() => {
          if (mounted) {
            loadWhatsNew();
          }
        }, 150);
      } else {
        clearPopupSession();

        setFeatures([]);
        setPopupFeatures([]);
        setCurrentIndex(0);
        setIsOpen(false);
      }
    };

    window.addEventListener("br30-auth-changed", handleAuthChanged);
    window.addEventListener("storage", handleStorage);

    const token = localStorage.getItem("br30_access_token");

    if (token) {
      loadWhatsNew();
    }

    return () => {
      mounted = false;

      window.removeEventListener("br30-auth-changed", handleAuthChanged);

      window.removeEventListener("storage", handleStorage);
    };
  }, [loadWhatsNew, clearPopupSession]);

  /* =========================================================
     CURRENT FEATURE
  ========================================================= */

  const currentFeature = popupFeatures[currentIndex] || null;

  /* =========================================================
     UPDATE FEATURE TRACKING LOCALLY
  ========================================================= */

  const updateFeatureTracking = useCallback((featureId, trackingUpdate) => {
    const updateFeature = (feature) => {
      if (feature._id !== featureId) {
        return feature;
      }

      return {
        ...feature,
        tracking: {
          ...(feature.tracking || {}),
          ...trackingUpdate,
        },
      };
    };

    setFeatures((previous) => previous.map(updateFeature));

    setPopupFeatures((previous) => previous.map(updateFeature));
  }, []);

  /* =========================================================
     MARK VIEWED
  ========================================================= */

  const markViewed = useCallback(
    async (featureId) => {
      if (!featureId) {
        return false;
      }

      try {
        const response = await whatsNewApi.markViewed(featureId);

        updateFeatureTracking(featureId, {
          viewed: true,
          viewedAt: response?.view?.viewedAt || new Date().toISOString(),
          loginSessionId: response?.view?.loginSessionId || getLoginSessionId(),
        });

        return response?.success !== false;
      } catch (err) {
        console.error("What's New mark viewed error:", err);

        return false;
      }
    },
    [getLoginSessionId, updateFeatureTracking]
  );

  /* =========================================================
     MARK EXPLORED
  ========================================================= */

  const markExplored = useCallback(
    async (featureId) => {
      if (!featureId) {
        return false;
      }

      try {
        const response = await whatsNewApi.markExplored(featureId);

        updateFeatureTracking(featureId, {
          viewed: true,
          explored: true,
          viewedAt: response?.view?.viewedAt || new Date().toISOString(),
          exploredAt: response?.view?.exploredAt || new Date().toISOString(),
          loginSessionId: response?.view?.loginSessionId || getLoginSessionId(),
        });

        return response?.success !== false;
      } catch (err) {
        console.error("What's New mark explored error:", err);

        return false;
      }
    },
    [getLoginSessionId, updateFeatureTracking]
  );

  /* =========================================================
     OPEN WHAT'S NEW
  ========================================================= */

  const openWhatsNew = useCallback(
    (featureId = null) => {
      if (popupFeatures.length === 0) {
        return;
      }

      let targetIndex = 0;

      if (featureId) {
        const foundIndex = popupFeatures.findIndex((feature) => feature._id === featureId);

        if (foundIndex !== -1) {
          targetIndex = foundIndex;
        }
      }

      setCurrentIndex(targetIndex);
      setIsOpen(true);
    },
    [popupFeatures]
  );

  /* =========================================================
     CLOSE WHAT'S NEW
  ========================================================= */

  const closeWhatsNew = useCallback(() => {
    setIsOpen(false);
  }, []);

  /* =========================================================
     NEXT FEATURE
  ========================================================= */

  const nextFeature = useCallback(() => {
    if (popupFeatures.length === 0) {
      return;
    }

    setCurrentIndex((previous) => {
      if (previous >= popupFeatures.length - 1) {
        return previous;
      }

      return previous + 1;
    });
  }, [popupFeatures.length]);

  /* =========================================================
     PREVIOUS FEATURE
  ========================================================= */

  const previousFeature = useCallback(() => {
    if (popupFeatures.length === 0) {
      return;
    }

    setCurrentIndex((previous) => {
      if (previous <= 0) {
        return 0;
      }

      return previous - 1;
    });
  }, [popupFeatures.length]);

  /* =========================================================
     GO TO SPECIFIC FEATURE
  ========================================================= */

  const goToFeature = useCallback(
    (index) => {
      if (index < 0 || index >= popupFeatures.length) {
        return;
      }

      setCurrentIndex(index);
    },
    [popupFeatures.length]
  );

  /* =========================================================
     OPEN SPECIFIC FEATURE
  ========================================================= */

  const openFeature = useCallback(
    (featureId) => {
      if (!featureId) {
        return;
      }

      openWhatsNew(featureId);
    },
    [openWhatsNew]
  );

  /* =========================================================
     AUTO MARK VIEWED WHEN FEATURE OPENS
  ========================================================= */

  useEffect(() => {
    if (!isOpen || !currentFeature?._id) {
      return;
    }

    if (currentFeature?.tracking?.viewed) {
      return;
    }

    markViewed(currentFeature._id);
  }, [isOpen, currentFeature?._id, currentFeature?.tracking?.viewed, markViewed]);

  /* =========================================================
     KEYBOARD NAVIGATION
  ========================================================= */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeWhatsNew();
      }

      if (event.key === "ArrowRight") {
        nextFeature();
      }

      if (event.key === "ArrowLeft") {
        previousFeature();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeWhatsNew, nextFeature, previousFeature]);

  /* =========================================================
     RESET INDEX IF DATA CHANGES
  ========================================================= */

  useEffect(() => {
    if (popupFeatures.length === 0) {
      setCurrentIndex(0);
      return;
    }

    if (currentIndex >= popupFeatures.length) {
      setCurrentIndex(popupFeatures.length - 1);
    }
  }, [popupFeatures.length, currentIndex]);

  /* =========================================================
     CONTEXT VALUE
  ========================================================= */

  const value = useMemo(
    () => ({
      features,
      popupFeatures,
      currentFeature,

      currentIndex,
      totalFeatures: popupFeatures.length,

      isOpen,
      loading,
      error,

      loadWhatsNew,

      openWhatsNew,
      openFeature,
      closeWhatsNew,

      nextFeature,
      previousFeature,
      goToFeature,

      markViewed,
      markExplored,

      hasFeatures: features.length > 0,
      hasPopupFeatures: popupFeatures.length > 0,

      isFirstFeature: currentIndex === 0,

      isLastFeature: popupFeatures.length === 0 || currentIndex === popupFeatures.length - 1,
    }),
    [features, popupFeatures, currentFeature, currentIndex, isOpen, loading, error, loadWhatsNew, openWhatsNew, openFeature, closeWhatsNew, nextFeature, previousFeature, goToFeature, markViewed, markExplored]
  );

  return <WhatsNewContext.Provider value={value}>{children}</WhatsNewContext.Provider>;
};

/* =========================================================
   HOOK
========================================================= */

export const useWhatsNew = () => {
  const context = useContext(WhatsNewContext);

  if (!context) {
    throw new Error("useWhatsNew must be used inside WhatsNewProvider");
  }

  return context;
};

export default WhatsNewContext;
