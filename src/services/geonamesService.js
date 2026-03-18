/**
 * City search using GeoNames API (free with registration).
 * Returns places with lat/lon, population, timezone, country, etc.
 * If GeoNames returns 401 or "account not enabled", falls back to Nominatim (no key required).
 *
 * To use GeoNames: register at https://www.geonames.org/login, then enable the free webservice
 * at https://www.geonames.org/manageaccount and set REACT_APP_GEONAMES_USERNAME in .env.
 * Free tier: 30,000 credits/day (1 credit per search), 1000/hour.
 * @see https://www.geonames.org/export/web-services.html
 */

import { searchCities as nominatimSearchCities } from './nominatimService';

const GEONAMES_BASE = 'https://secure.geonames.org';

function getUsername() {
  const u = process.env.REACT_APP_GEONAMES_USERNAME || 'mazabiodata';
  return u.trim() || 'demo';
}

/**
 * Build a readable display name from GeoNames place fields.
 */
function toDisplayName(place) {
  const parts = [place.name];
  if (place.adminName1 && place.adminName1 !== place.name) parts.push(place.adminName1);
  if (place.countryName) parts.push(place.countryName);
  return parts.join(', ');
}

/**
 * Map Nominatim results to same shape as GeoNames (display_name, lat, lon, place_id).
 */
function mapNominatimResults(items) {
  return (items || []).map((item) => ({
    display_name: item.display_name || '',
    lat: item.lat,
    lon: item.lon,
    place_id: String(item.place_id || ''),
    population: undefined,
    timezone: undefined,
    countryCode: undefined,
    countryName: undefined,
  }));
}

/**
 * Search for cities/places by name. Returns matches with lat/lon and optional details.
 * Uses GeoNames when the account is enabled; otherwise falls back to Nominatim.
 * @param {string} query - Search term (e.g. "Mumbai", "Pune")
 * @param {object} options - { limit?: number, countryCodes?: string }
 * @returns {Promise<Array<{ display_name: string, lat: string, lon: string, place_id: string, population?: number, timezone?: string, countryCode?: string }>>}
 */
export async function searchCities(query, options = {}) {
  const trimmed = (query || '').trim();
  if (!trimmed || trimmed.length < 2) return [];

  const params = new URLSearchParams({
    q: trimmed,
    maxRows: String(options.limit ?? 10),
    username: getUsername(),
    type: 'json',
  });
  params.set('featureClass', 'P');
  if (options.countryCodes) params.set('country', options.countryCodes);

  const url = `${GEONAMES_BASE}/search?${params.toString()}`;
  const res = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' } });
  const data = await res.json();

  // 401 or "user account not enabled to use the free webservice" (status.value === 10)
  const geonamesDisabled = !res.ok || data?.status?.value === 10;
  if (geonamesDisabled) {
    try {
      const nominatimResults = await nominatimSearchCities(trimmed, options);
      return mapNominatimResults(nominatimResults);
    } catch (fallbackError) {
      throw new Error('City search failed. Enable free webservice at https://www.geonames.org/manageaccount or try again later.');
    }
  }

  const list = data.geonames;
  if (!Array.isArray(list)) return [];

  return list.map((item) => ({
    display_name: toDisplayName(item),
    lat: String(item.lat),
    lon: String(item.lng),
    place_id: String(item.geonameId || ''),
    population: item.population,
    timezone: item.timezone?.timeZoneId,
    countryCode: item.countryCode,
    countryName: item.countryName,
  }));
}

/**
 * Get latitude and longitude for a selected place.
 */
export async function getCoordinatesForPlace(query) {
  const results = await searchCities(query, { limit: 1 });
  if (results.length === 0) return null;
  const r = results[0];
  return { latitude: parseFloat(r.lat), longitude: parseFloat(r.lon), display_name: r.display_name };
}
