/**
 * Geocode birthplace via Firebase Cloud Function (Plan Steps 1–7: send place → backend → cache/Google).
 * Set REACT_APP_GEOCODE_FUNCTION_URL to your deployed function URL.
 * Set REACT_APP_DEBUG_GEOCODE=true in .env to log step-by-step.
 */

const GEOCODE_URL = process.env.REACT_APP_GEOCODE_FUNCTION_URL || "https://geocodeplace-7gjdbdv4uq-el.a.run.app";
const FETCH_TIMEOUT_MS = 10000;
const MAX_PLACE_LENGTH = 200;
const MIN_PLACE_LENGTH = 2;

function log() {}

const inFlight = new Map();

/** Trim and enforce max length. Returns empty string if invalid. */
function trimPlace(place) {
  if (place == null || typeof place !== "string") return "";
  const s = String(place).trim();
  if (s.length < MIN_PLACE_LENGTH) return "";
  return s.length > MAX_PLACE_LENGTH ? s.slice(0, MAX_PLACE_LENGTH) : s;
}

function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
}

async function geocodePlaceImpl(place, usePost = false) {
  const trimmed = trimPlace(place);
  if (!trimmed) {
    return null;
  }
  if (!GEOCODE_URL) {
    return null;
  }

  log("Step 1: Sending place to backend:", trimmed);

  const cacheKey = trimmed.toLowerCase();
  const existing = inFlight.get(cacheKey);
  if (existing) {
    log("(dedupe: reusing in-flight request for)", cacheKey);
    return existing;
  }

  const promise = (async () => {
    try {
      let res;
      if (usePost) {
        res = await fetchWithTimeout(GEOCODE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ place: trimmed }),
        });
      } else {
        const url = new URL(GEOCODE_URL);
        url.searchParams.set("place", trimmed);
        res = await fetchWithTimeout(url.toString(), { method: "GET" });
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        log("Backend error:", res.status, data);
        return null;
      }
      if (data.lat == null || data.lng == null) {
        log("Backend response missing lat/lng");
        return null;
      }
      log("Backend response: lat/lng", data.lat, data.lng, "cached:", data.cached, "formatted:", data.formatted);
      return {
        lat: data.lat,
        lng: data.lng,
        placeKey: data.placeKey,
        cached: data.cached,
        formatted: data.formatted,
      };
    } catch (err) {
      return null;
    } finally {
      inFlight.delete(cacheKey);
    }
  })();

  inFlight.set(cacheKey, promise);
  return promise;
}

/**
 * Get lat/lng for a place name (GET). Deduplicates in-flight requests.
 * @param {string} place - e.g. "pune", "Mumbai"
 * @returns {Promise<{ lat: number, lng: number, placeKey: string, cached?: boolean, formatted?: string } | null>}
 */
export function geocodePlace(place) {
  return geocodePlaceImpl(place, false);
}

/**
 * Same via POST (for long names or CORS).
 */
export function geocodePlacePost(place) {
  return geocodePlaceImpl(place, true);
}

/**
 * City/place search using Google Geocoding via our Cloud Function.
 * Returns same shape as legacy searchCities: [{ display_name, lat, lon, place_id }].
 * @param {string} query - e.g. "pune", "Mumbai"
 * @param {{ limit?: number }} options - limit ignored; Google returns one result per query
 * @returns {Promise<Array<{ display_name: string, lat: string, lon: string, place_id: string }>>}
 */
export async function searchCities(query, options = {}) {
  const trimmed = typeof query === "string" ? query.trim() : "";
  if (!trimmed || trimmed.length < MIN_PLACE_LENGTH) {
    log("searchCities: skipped (query too short or empty)");
    return [];
  }
  if (trimmed.length > MAX_PLACE_LENGTH) {
    log("searchCities: query truncated to", MAX_PLACE_LENGTH);
  }
  const toSend = trimmed.length > MAX_PLACE_LENGTH ? trimmed.slice(0, MAX_PLACE_LENGTH) : trimmed;
  if (!GEOCODE_URL) {
    return [];
  }

  log("searchCities: calling backend for", toSend);
  const result = await geocodePlaceImpl(toSend, false);
  if (!result || result.lat == null || result.lng == null) {
    log("searchCities: no result from backend");
    return [];
  }

  const display_name = result.formatted || result.placeKey || trimmed;
  const list = [
    {
      display_name,
      lat: String(result.lat),
      lon: String(result.lng),
      place_id: result.placeKey || String(result.lat) + "," + String(result.lng),
    },
  ];
  log("searchCities: returning 1 suggestion:", display_name);
  return list;
}

/** Call this to check if city suggestions will work (e.g. to show a hint in UI). */
export function isGeocodeConfigured() {
  return Boolean(GEOCODE_URL);
}
