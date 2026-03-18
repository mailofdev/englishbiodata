/**
 * Firebase Cloud Function: Geocode (Plan Steps 2–7).
 * Step 2: Security wall (hide API keys, cache, prevent duplicates).
 * Step 4: Standardize place name. Step 5: Check cache first. Step 6: Call Google. Step 7: Save to Firestore.
 * Env: set GOOGLE_GEOCODING_API_KEY in Firebase Console → Functions → geocodePlace → Environment variables.
 */
import { onRequest } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp();
const db = getFirestore();

const LOG_PREFIX = "[geocodePlace]";
function logStep(step, ...args) {
  console.log(LOG_PREFIX, `Plan Step ${step}:`, ...args);
}

const MAX_PLACE_LENGTH = 200;
const MIN_PLACE_LENGTH = 2;
const GEOCODE_FETCH_MS = 8000;
const L1_TTL_MS = 60 * 1000;       // 1 min in-memory
const L1_MAX_ENTRIES = 500;
const CACHE_CONTROL_CACHED = "public, max-age=86400";   // 1 day when from cache
const CACHE_CONTROL_FRESH = "public, max-age=300";      // 5 min when from Google

const isProduction = process.env.NODE_ENV === "production";

// L1 in-memory cache (reduces Firestore reads for hot keys)
const l1Cache = new Map();
let l1Expiry = null;
function getL1(placeKey) {
  const now = Date.now();
  if (l1Expiry != null && now > l1Expiry) {
    l1Cache.clear();
    l1Expiry = null;
  }
  const entry = l1Cache.get(placeKey);
  if (!entry || now > entry.expires) return null;
  return entry.data;
}
function setL1(placeKey, data) {
  if (l1Cache.size >= L1_MAX_ENTRIES) {
    const first = l1Cache.keys().next().value;
    if (first != null) l1Cache.delete(first);
  }
  l1Expiry = l1Expiry == null ? Date.now() + L1_TTL_MS : l1Expiry;
  l1Cache.set(placeKey, { data, expires: Date.now() + L1_TTL_MS });
}

/** Step 4: Standardize place name — lowercase, trim, collapse spaces — to avoid duplicates. */
function normalizePlaceName(place) {
  if (place == null) return "";
  const s = String(place).trim().toLowerCase().replace(/\s+/g, " ").slice(0, MAX_PLACE_LENGTH);
  return s.length >= MIN_PLACE_LENGTH ? s : "";
}

function getPlaceFromRequest(req) {
  if (req.method === "GET") return req.query?.place;
  let body = req.body;
  if (typeof body === "string" && body.trim()) {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  return body && (body.place ?? body.birthplace);
}

function setNoCache(res) {
  res.set("Cache-Control", "no-store");
}

function jsonResponse(res, status, data, cacheControl) {
  if (cacheControl) res.set("Cache-Control", cacheControl);
  res.status(status).json(data);
}

export const geocodePlace = onRequest(
  {
    cors: true,
    region: "asia-south1",
    timeoutSeconds: 15,
    memory: "256MiB",
  },
  async (req, res) => {
    if (req.method !== "GET" && req.method !== "POST") {
      setNoCache(res);
      return res.status(405).json({ error: "Method not allowed" });
    }

    const placeRaw = getPlaceFromRequest(req);
    const placeKey = normalizePlaceName(placeRaw);
    logStep(4, "Standardize place name:", JSON.stringify(placeRaw), "->", placeKey);

    if (!placeKey) {
      setNoCache(res);
      return res.status(400).json({
        error: "Invalid or missing place. Send at least 2 characters, e.g. ?place=pune or body: { place: 'pune' }",
      });
    }

    const apiKey =
      process.env.GOOGLE_GEOCODING_API_KEY ||
      process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      setNoCache(res);
      return res.status(503).json({
        error: "Geocoding service is not configured. Contact support.",
      });
    }

    try {
      const fromL1 = getL1(placeKey);
      if (fromL1) {
        logStep(5, "Cache HIT (L1 in-memory), returning lat/lng");
        return jsonResponse(res, 200, { ...fromL1, cached: true }, CACHE_CONTROL_CACHED);
      }

      const cacheRef = db.collection("placeCache").doc(placeKey);
      const cached = await cacheRef.get();
      if (cached?.exists) {
        logStep(5, "Cache HIT (Firestore placeCache), returning lat/lng");
        const data = cached.data();
        const payload = {
          lat: data.lat,
          lng: data.lng,
          placeKey,
          formatted: data.formatted || null,
          cached: true,
        };
        setL1(placeKey, payload);
        return jsonResponse(res, 200, payload, CACHE_CONTROL_CACHED);
      }

      logStep(6, "Cache MISS — calling Google Geocoding API for", placeKey);
      const controller = new AbortController();
      const to = setTimeout(() => controller.abort(), GEOCODE_FETCH_MS);
      const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
      url.searchParams.set("address", placeKey);
      url.searchParams.set("key", apiKey);

      const geoRes = await fetch(url.toString(), { signal: controller.signal });
      clearTimeout(to);
      const geo = await geoRes.json();

      if (geo.status !== "OK" || !geo.results?.[0]) {
        logStep(6, "Google returned:", geo.status);
        setNoCache(res);
        const msg = geo.status === "ZERO_RESULTS" ? "Place not found. Try a different name or spelling." : "Place lookup failed. Please try again.";
        return res.status(404).json({ error: msg, placeKey });
      }

      const loc = geo.results[0].geometry.location;
      const lat = loc.lat;
      const lng = loc.lng;
      const formatted = geo.results[0].formatted_address || null;

      logStep(7, "Saving to Firestore placeCache:", placeKey, "lat/lng", lat, lng);
      await cacheRef.set({
        lat,
        lng,
        placeKey,
        formatted,
        updatedAt: new Date().toISOString(),
      });

      const payload = { lat, lng, placeKey, formatted, cached: false };
      setL1(placeKey, payload);
      logStep(7, "Saved. Returning to client.");
      jsonResponse(res, 200, payload, CACHE_CONTROL_FRESH);
    } catch (err) {
      console.error(LOG_PREFIX, "Error:", err.message);
      setNoCache(res);
      res.status(500).json({
        error: "An error occurred while looking up the place. Please try again.",
        ...(isProduction ? {} : { message: err.message }),
      });
    }
  }
);
