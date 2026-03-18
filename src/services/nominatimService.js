/**
 * City search using OpenStreetMap Nominatim API (free, no API key).
 * Fetches list of places (cities) and their latitude/longitude.
 * Usage policy: https://operations.osmfoundation.org/policies/nominatim/
 * - Use a valid User-Agent
 * - Max 1 request per second for heavy use
 */

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'MazaBiodataKundaliMatch/1.0 (contact@mazabiodata.com)';

/**
 * Search for cities/places by name. Returns matches with lat/lon.
 * @param {string} query - Search term (e.g. "Mumbai", "Pune")
 * @param {object} options - { limit?: number, countryCodes?: string }
 * @returns {Promise<Array<{ display_name: string, lat: string, lon: string, place_id: string }>>}
 */
export async function searchCities(query, options = {}) {
  const trimmed = (query || '').trim();
  if (!trimmed || trimmed.length < 2) return [];

  const params = new URLSearchParams({
    q: trimmed,
    format: 'json',
    addressdetails: '1',
    limit: String(options.limit ?? 10),
  });
  if (options.countryCodes) params.set('countrycodes', options.countryCodes);

  const url = `${NOMINATIM_BASE}/search?${params.toString()}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Accept-Language': 'en',
      'User-Agent': USER_AGENT,
    },
  });

  if (!res.ok) throw new Error('City search failed');
  const data = await res.json();
  if (!Array.isArray(data)) return [];

  return data.map((item) => ({
    display_name: item.display_name || '',
    lat: item.lat,
    lon: item.lon,
    place_id: String(item.place_id || ''),
  }));
}

/**
 * Get latitude and longitude for a selected place (by place_id or by name).
 * If you already have a result from searchCities, use its lat/lon directly.
 * This is useful if you need to re-fetch a single place.
 */
export async function getCoordinatesForPlace(query) {
  const results = await searchCities(query, { limit: 1 });
  if (results.length === 0) return null;
  return { latitude: parseFloat(results[0].lat), longitude: parseFloat(results[0].lon), display_name: results[0].display_name };
}
