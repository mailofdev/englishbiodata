/**
 * Kundli Matching – client service for astrology-api.io (groom/bride birth_data format).
 * Builds request: { groom: { name, birth_data }, bride: { name, birth_data }, options: { ayanamsa }, include_manglik }.
 * Set REACT_APP_KUNDLI_MATCH_PROXY_URL to override (default: /api/kundli-match).
 */

import axios from 'axios';

const KUNDLI_MATCH_URL = process.env.REACT_APP_KUNDLI_MATCH_PROXY_URL || '/api/kundli-match';

/**
 * Parse "YYYY-MM-DD" -> { year, month, day } (numbers).
 */
function parseDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parts = dateStr.trim().split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) return null;
  return { year, month, day };
}

/**
 * Parse "HH:mm" (24h) -> { hour, minute } (numbers).
 */
function parseTime(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const parts = timeStr.trim().split(':');
  if (parts.length < 2) return null;
  const hour = parseInt(parts[0], 10);
  const minute = parseInt(parts[1], 10);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  return { hour, minute };
}

function toShortCity(cityStr) {
  if (!cityStr || typeof cityStr !== 'string') return 'Mumbai';
  const first = String(cityStr).trim().split(',')[0].trim();
  return first || 'Mumbai';
}

/**
 * Build one person's birth_data from { date, time, city?, country_code?, name? }.
 * defaultName used when person.name is missing (e.g. 'Groom' / 'Bride').
 */
function toBirthData(person, defaultName) {
  if (!person?.date || !person?.time) return null;
  const d = parseDate(person.date);
  const t = parseTime(person.time);
  if (!d || !t) return null;
  const name = (person.name && String(person.name).trim()) || defaultName || 'Groom';
  return {
    name,
    birth_data: {
      year: d.year,
      month: d.month,
      day: d.day,
      hour: t.hour,
      minute: t.minute,
      city: toShortCity(person.city),
      country_code: (person.country_code && String(person.country_code).trim()) || 'IN',
    },
  };
}

/**
 * Build the exact API request body: groom, bride, options, include_manglik.
 * @param {{ date: string, time: string, city?: string, country_code?: string, name?: string }} male
 * @param {{ date: string, time: string, city?: string, country_code?: string, name?: string }} female
 * @param {boolean} [include_manglik=true]
 */
export function buildKundliRequestBody(male, female, include_manglik = true) {
  const groomData = toBirthData(male, 'Groom');
  const brideData = toBirthData(female, 'Bride');
  if (!groomData || !brideData) return null;
  return {
    groom: { name: groomData.name, birth_data: groomData.birth_data },
    bride: { name: brideData.name, birth_data: brideData.birth_data },
    male: { date: male.date, time: male.time, city: male.city || 'Mumbai', country_code: male.country_code || 'IN', name: male.name },
    female: { date: female.date, time: female.time, city: female.city || 'Mumbai', country_code: female.country_code || 'IN', name: female.name },
    options: { ayanamsa: 'lahiri' },
    include_manglik: !!include_manglik,
  };
}

/**
 * Call Kundli Match API with male/female (date, time, city?, country_code?, name?) and optional include_manglik.
 * Sends the sample request format: { groom, bride, options, include_manglik }.
 */
const ERRORS = {
  MISSING_DATA: 'Please provide birth date and time for both persons.',
  SERVICE_NOT_CONFIGURED: 'Kundli match service is not configured. Please try again later.',
  REQUEST_FAILED: 'Request failed. Please check your connection and try again.',
  GENERIC: 'Could not get match result. Please try again.',
};

export async function matchKundliAstrologyApi(male, female, include_manglik = true) {
  if (!male || !female) {
    return { success: false, error: ERRORS.MISSING_DATA };
  }
  const body = buildKundliRequestBody(male, female, include_manglik);
  if (!body) {
    return { success: false, error: ERRORS.MISSING_DATA };
  }
  if (!KUNDLI_MATCH_URL) {
    return { success: false, error: ERRORS.SERVICE_NOT_CONFIGURED };
  }
  try {
    const res = await axios.post(KUNDLI_MATCH_URL, body, {
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' },
    });
    const data = res?.data;
    if (!data) {
      return { success: false, error: ERRORS.GENERIC };
    }
    return { success: true, data };
  } catch (err) {
    const data = err.response?.data;
    let message = ERRORS.GENERIC;
    if (data && typeof data === 'object') {
      const e = data.error;
      const d = data.detail;
      if (typeof e === 'string' && e.trim()) message = e;
      else if (typeof d === 'string' && d.trim()) message = d;
      else if (typeof e === 'object' && e?.message) message = e.message;
      else if (typeof d === 'object' && d?.message) message = d.message;
      else if (Array.isArray(d) && d[0]?.msg) message = d[0].msg;
      else if (typeof data.message === 'string' && data.message.trim()) message = data.message;
    } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      message = 'Request timed out. Please try again.';
    } else if (err.message && typeof err.message === 'string') {
      message = err.message;
    }
    return { success: false, error: message };
  }
}

/**
 * Normalize astrology-api.io Kundli Matching (v3) response for UI.
 */
export function normalizeAstrologyKundliResponse(apiResponse) {
  const d = apiResponse;
  const kutas = d?.kutas ?? d?.kuta_scores ?? d?.ashtakoota ?? d?.guna_milan ?? {};
  const totalScore = d?.total_score ?? d?.score ?? d?.received_points ?? d?.compatibility_score ?? 0;
  const maxPoints = d?.max_score ?? d?.max_points ?? 36;
  const percentage = maxPoints ? Math.round((Number(totalScore) / Number(maxPoints)) * 100) : (d?.percentage ?? 0);
  return {
    totalPoints: totalScore,
    maxPoints: maxPoints,
    percentage: d?.percentage ?? percentage,
    verdict: d?.verdict ?? d?.match_report ?? (percentage >= 75 ? 'अत्यंत अनुकूल' : percentage >= 50 ? 'अनुकूल' : 'तपासा'),
    recommendation: d?.recommendation ?? d?.conclusion ?? d?.match_report ?? (d?.remedies ? (Array.isArray(d.remedies) ? d.remedies.join('; ') : String(d.remedies)) : ''),
    guna_milan: typeof kutas === 'object' && kutas !== null ? kutas : {},
    doshas: d?.doshas ?? { manglik: d?.manglik, nadi_dosha: d?.nadi_dosha, bhakoot_dosha: d?.bhakoot_dosha },
    detailed_analysis: d?.detailed_analysis ?? {},
    recommendations: d?.recommendations ?? (d?.remedies ? (Array.isArray(d.remedies) ? d.remedies : [d.remedies]) : []) ?? (d?.recommendation ? [d.recommendation] : []),
  };
}
