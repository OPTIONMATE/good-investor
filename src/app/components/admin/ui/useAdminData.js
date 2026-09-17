"use client";

import { useEffect, useState } from "react";

/**
 * Standardised fetch hook for admin feature pages.
 * Provides loading / error / retry states plus the fetched data.
 *
 * @param url      API endpoint (or null to skip).
 * @param extractor maps the JSON response to the data the page needs.
 */
export function useAdminData(url, extractor = (json) => json) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const json = await res.json();
      setData(extractor(json));
    } catch (err) {
      console.error(`Admin fetch error (${url}):`, err);
      setError(err.message || "Unable to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return { data, loading, error, load };
}