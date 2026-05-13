import { useState, useEffect } from "react";

type MediaMap = Record<string, string>;

const cache: { data?: MediaMap; promise?: Promise<MediaMap> } = {};
const listeners = new Set<(m: MediaMap) => void>();

/** Drop the in-memory media cache and notify every active `useMedia` consumer
 *  so admin-driven content updates take effect without a hard page refresh. */
export function invalidateMediaCache(): void {
  delete cache.data;
  delete cache.promise;
  // Kick a fresh fetch and broadcast results to every mounted hook.
  fetchAssets().then((data) => {
    listeners.forEach((cb) => cb(data));
  });
}

// Default fallbacks pointing to the Leonardo.ai assets dropped into public/uploads
export const MEDIA_DEFAULTS: MediaMap = {
  navLogo:               "/uploads/A2.jpg",
  footerLogo:            "/uploads/A2.jpg",
  homeHero:              "/uploads/B1.jpg",
  homeSecurity:          "/uploads/B2.jpg",
  homeSocialProof:       "/uploads/B3.jpg",
  homeFaq:               "/uploads/F2.jpg",
  checkoutHero:          "/uploads/C1.jpg",
  checkoutStep1:         "/uploads/C2a.jpg",
  checkoutStep2:         "/uploads/C2b.jpg",
  checkoutStep3:         "/uploads/C2c.jpg",
  checkoutSecurity:      "/uploads/C3.jpg",
  newsHero:              "/uploads/D2.jpg",
  newsArticleFallback:   "/uploads/D1.jpg",
  accountLoginBg:        "/uploads/E1.jpg",
  accountEmpty:          "/uploads/E2.jpg",
  errorPage:             "/uploads/F3.jpg",
  paperTexture:          "/uploads/F1.jpg",
};

function fetchAssets(): Promise<MediaMap> {
  if (cache.data) return Promise.resolve(cache.data);
  if (cache.promise) return cache.promise;
  cache.promise = fetch("/api/page-content/media")
    .then((r) => (r.ok ? r.json() : {}))
    .then((d: any) => {
      // Section endpoint shape: { [section]: content }. Content for `assets`
      // section is a flat map { key: url }. Tolerate legacy nested shape.
      const sectionContent = (d && d.assets) || {};
      const flat = sectionContent && typeof sectionContent.assets === "object"
        ? sectionContent.assets
        : sectionContent;
      cache.data = { ...MEDIA_DEFAULTS, ...flat };
      delete cache.promise;
      return cache.data;
    })
    .catch(() => {
      cache.data = { ...MEDIA_DEFAULTS };
      delete cache.promise;
      return cache.data;
    });
  return cache.promise;
}

export function useMedia(): MediaMap {
  const [m, setM] = useState<MediaMap>(() => cache.data || MEDIA_DEFAULTS);
  useEffect(() => {
    let cancelled = false;
    const cb = (data: MediaMap) => { if (!cancelled) setM(data); };
    listeners.add(cb);
    fetchAssets().then((data) => { if (!cancelled) setM(data); });
    return () => { cancelled = true; listeners.delete(cb); };
  }, []);
  return m;
}

export function useMediaSrc(key: keyof typeof MEDIA_DEFAULTS): string {
  const m = useMedia();
  return m[key] || MEDIA_DEFAULTS[key];
}

export type MediaKey = keyof typeof MEDIA_DEFAULTS;
