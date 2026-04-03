import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { matchKundliAstrologyApi, normalizeAstrologyKundliResponse } from '../../services/gunMilanService';
import { searchCities, geocodePlace, isGeocodeConfigured } from '../../services/geocodeService';
import { content } from '../../content/staticContent';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_TO_NUM = Object.fromEntries(MONTHS.map((m, i) => [m, String(i + 1).padStart(2, '0')]));
const PERIODS = ['AM', 'PM'];
const PERIOD_TO_24H = { AM: 'AM', PM: 'PM' };

const defaultBoy = { name: '', day: '', month: '', year: '', hour: '', minute: '', period: '', city: '', latitude: 28.6139, longitude: 77.209 };
const defaultGirl = { name: '', day: '', month: '', year: '', hour: '', minute: '', period: '', city: '', latitude: 19.076, longitude: 72.8777 };

const DEBOUNCE_MS = 1500;

/** Searchable city dropdown using Google Geocoding (Cloud Function); on select returns display_name, lat, lon. */
function CitySelect({ value, onSelect, placeholder = 'Search city / Select city', id, showGeocodeHint = true }) {
  const [inputText, setInputText] = useState(value || '');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownRect, setDropdownRect] = useState(null);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setInputText(value || '');
  }, [value]);

  useEffect(() => {
    if (!inputText.trim() || inputText.length < 2) {
      setOptions([]);
      setShowDropdown(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      searchCities(inputText, { limit: 1 })
        .then((list) => {
          setOptions(list || []);
          setShowDropdown((list?.length ?? 0) > 0);
        })
        .catch((err) => {
          setOptions([]);
          setShowDropdown(false);
        })
        .finally(() => setLoading(false));
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputText]);

  // Position dropdown under the input (portal renders in body; position:fixed uses viewport coords)
  useEffect(() => {
    if (showDropdown && options.length > 0 && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownRect({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    } else {
      setDropdownRect(null);
    }
  }, [showDropdown, options.length]);

  const handleSelect = (item) => {
    setInputText(item.display_name);
    setShowDropdown(false);
    setOptions([]);
    onSelect({ display_name: item.display_name, lat: item.lat, lon: item.lon });
  };

  const handleBlur = () => {
    setTimeout(() => setShowDropdown(false), 200);
  };

  const listboxId = id ? `${id}-listbox` : 'city-select-listbox';
  const dropdownList = showDropdown && options.length > 0 && dropdownRect && (
    <ul
      id={listboxId}
      className="list-group position-fixed shadow-sm rounded-2 overflow-auto"
      style={{
        top: dropdownRect.top,
        left: dropdownRect.left,
        width: dropdownRect.width,
        maxHeight: '220px',
        zIndex: 1060,
      }}
      role="listbox"
    >
      {options.map((item) => (
        <li
          key={item.place_id}
          role="option"
          aria-selected="false"
          tabIndex={-1}
          className="list-group-item list-group-item-action small py-2"
          style={{ cursor: 'pointer' }}
          onMouseDown={(e) => { e.preventDefault(); handleSelect(item); }}
        >
          {item.display_name}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="position-relative">
      <label className="form-label small mb-1">Birth place (City)</label>
      <input
        ref={inputRef}
        id={id}
        type="text"
        className="form-control"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onFocus={() => options.length > 0 && setShowDropdown(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={showDropdown}
      />
      {loading && (
        <div className="position-absolute top-50 end-0 translate-middle-y me-2">
          <span className="spinner-border spinner-border-sm text-secondary" aria-hidden="true" />
        </div>
      )}
      {showGeocodeHint && !isGeocodeConfigured() && (
        <p className="small text-muted mb-0 mt-1">
          {process.env.NODE_ENV === 'production'
            ? 'City search is not configured. You can type the city name manually.'
            : 'City suggestions need REACT_APP_GEOCODE_FUNCTION_URL in .env (or in Vercel → Project Settings → Environment Variables for deployment).'}
        </p>
      )}
      {dropdownList && createPortal(dropdownList, document.body)}
    </div>
  );
}

function toISODate(day, month, year) {
  if (!day || !month || !year) return '';
  const m = MONTH_TO_NUM[month];
  if (!m) return '';
  return `${year}-${m}-${String(day).padStart(2, '0')}`;
}

function toTime24(hour, minute, period) {
  if (!hour || !minute) return '';
  let h = parseInt(hour, 10);
  const m = parseInt(minute, 10);
  const ampm = PERIOD_TO_24H[period];
  if (ampm === 'PM' && h < 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

const KundaliMatchPage = () => {
  const [boy, setBoy] = useState(defaultBoy);
  const [girl, setGirl] = useState(defaultGirl);
  const [includeManglik, setIncludeManglik] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const page = content.pages?.kundaliMatch;

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const updatePerson = useCallback((personKey, field, value) => {
    const updater = personKey === 'boy' ? setBoy : setGirl;
    updater((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    const dateBoy = toISODate(boy.day, boy.month, boy.year);
    const timeBoy = toTime24(boy.hour, boy.minute, boy.period);
    const dateGirl = toISODate(girl.day, girl.month, girl.year);
    const timeGirl = toTime24(girl.hour, girl.minute, girl.period);
    if (!dateBoy || !timeBoy || !dateGirl || !timeGirl) {
      setError('Please select birth date and time for both boy and girl.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Step 1/5–7: Resolve city via backend (cache-first); fallback to entered text or Mumbai.
      const [boyCityRes, girlCityRes] = await Promise.all([
        boy.city && String(boy.city).trim().length >= 2 ? geocodePlace(boy.city) : Promise.resolve(null),
        girl.city && String(girl.city).trim().length >= 2 ? geocodePlace(girl.city) : Promise.resolve(null),
      ]);
      const boyCity = (boyCityRes?.formatted || boyCityRes?.placeKey) || (boy.city && String(boy.city).trim()) || 'Mumbai';
      const girlCity = (girlCityRes?.formatted || girlCityRes?.placeKey) || (girl.city && String(girl.city).trim()) || 'Mumbai';

      const res = await matchKundliAstrologyApi(
        { date: dateBoy, time: timeBoy, city: boyCity, country_code: 'IN', name: boy.name?.trim() || undefined },
        { date: dateGirl, time: timeGirl, city: girlCity, country_code: 'IN', name: girl.name?.trim() || undefined },
        includeManglik
      );
      if (res.success) {
        setResult(res.data);
        setError(null);
      } else {
        setError(typeof res.error === 'string' ? res.error : (res.error?.message || 'Could not get match result. Please try again.'));
        setResult(null);
      }
    } catch (err) {
      setError(err?.message && typeof err.message === 'string' ? err.message : 'Something went wrong. Please try again.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [boy.name, boy.day, boy.month, boy.year, boy.hour, boy.minute, boy.period, boy.city, girl.name, girl.day, girl.month, girl.year, girl.hour, girl.minute, girl.period, girl.city, includeManglik]);

  const onBoyCitySelect = useCallback(({ display_name, lat, lon }) => {
    setBoy((prev) => ({ ...prev, city: display_name, latitude: parseFloat(lat), longitude: parseFloat(lon) }));
  }, []);
  const onGirlCitySelect = useCallback(({ display_name, lat, lon }) => {
    setGirl((prev) => ({ ...prev, city: display_name, latitude: parseFloat(lat), longitude: parseFloat(lon) }));
  }, []);

  // API may return { success, data, meta }; payload is the inner data object
  const payload = result && (result.data !== undefined ? result.data : result);
  const normalized = payload ? normalizeAstrologyKundliResponse(payload) : null;
  // API returns kutas as array: [{ name, score, max, description }]; normalize for display
  const kutasArray = Array.isArray(payload?.kutas) ? payload.kutas : null;
  const gunaMilanForDisplay = payload?.guna_milan && Object.keys(payload.guna_milan).length > 0
    ? payload.guna_milan
    : (payload?.kutas && Array.isArray(payload.kutas)
        ? Object.fromEntries(payload.kutas.map((k) => [String(k.name || k.kuta || '').toLowerCase() || 'unknown', { points: k.points ?? k.score, max: k.max ?? 0, description: k.description }]))
        : null)
    || payload?.kuta_scores
    || normalized?.guna_milan
    || {};
  const GUNA_LABELS = { varna: 'Varna', vashya: 'Vashya', tara: 'Tara', yoni: 'Yoni', graha_maitri: 'Graha Maitri', 'graha maitri': 'Graha Maitri', gana: 'Gana', bhakoot: 'Bhakoot', nadi: 'Nadi' };
  const percentage = payload?.percentage != null ? payload.percentage : (payload?.max_score && payload?.total_score != null ? Math.round((Number(payload.total_score) / Number(payload.max_score)) * 100) : null);
  const doshasIsArray = Array.isArray(payload?.doshas);
  const manglikAnalysis = payload?.manglik_analysis;
  const groomDetails = payload?.groom_details;
  const brideDetails = payload?.bride_details;
  // const metadata = result?.metadata;
  const verdictDetail = payload?.verdict_detail;

  return (
    <div className="pb-2 kundali-match-page">
      <div className="text-center mb-5">
        <h1 className="h2 fw-bold app-body-text mb-2" style={{ color: '#5C2D6E' }}>{page?.headerTitle}</h1>
        <p className="text-muted app-body-text mb-0" style={{ maxWidth: '420px', margin: '0 auto' }}>
          {page?.headerSubtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row g-4 justify-content-center">
          {/* Boy */}
          <div className="col-12 col-lg-5">
            <div className="card border-0 shadow h-100 rounded-3" style={{ borderLeft: '4px solid #5C2D6E', overflow: 'visible' }}>
              <div className="card-header py-3 px-4 text-white" style={{ backgroundColor: '#5C2D6E' }}>
                <h2 className="h5 fw-bold mb-0">{page?.boyTitle}</h2>
              </div>
              <div className="card-body p-4" style={{ overflow: 'visible' }}>
                <div className="mb-3">
                  <label className="form-label small mb-1">Name (optional)</label>
                  <input type="text" className="form-control" value={boy.name} onChange={(e) => updatePerson('boy', 'name', e.target.value)} 
                  placeholder="e.g. Arjun patil" />
                </div>
                <p className="small text-uppercase text-muted fw-semibold mb-2">Birth date</p>
                <div className="row g-2 mb-4">
                  <div className="col-4">
                    <label className="form-label small mb-1">Day</label>
                    <select className="form-select" value={boy.day} onChange={(e) => updatePerson('boy', 'day', e.target.value)}><option value="">-</option>{days.map((d) => <option key={d} value={d}>{d}</option>)}</select>
                  </div>
                  <div className="col-4">
                    <label className="form-label small mb-1">Month</label>
                    <select className="form-select" value={boy.month} onChange={(e) => updatePerson('boy', 'month', e.target.value)}><option value="">-</option>{MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}</select>
                  </div>
                  <div className="col-4">
                    <label className="form-label small mb-1">Year</label>
                    <select className="form-select" value={boy.year} onChange={(e) => updatePerson('boy', 'year', e.target.value)}><option value="">-</option>{years.map((y) => <option key={y} value={y}>{y}</option>)}</select>
                  </div>
                </div>
                <p className="small text-uppercase text-muted fw-semibold mb-2">Birth time</p>
                <div className="row g-2">
                  <div className="col-4">
                    <label className="form-label small mb-1">Hour</label>
                    <select className="form-select" value={boy.hour} onChange={(e) => updatePerson('boy', 'hour', e.target.value)}><option value="">-</option>{hours.map((h) => <option key={h} value={h}>{h}</option>)}</select>
                  </div>
                  <div className="col-4">
                    <label className="form-label small mb-1">Minute</label>
                    <select className="form-select" value={boy.minute} onChange={(e) => updatePerson('boy', 'minute', e.target.value)}><option value="">-</option>{minutes.map((m) => <option key={m} value={m}>{m}</option>)}</select>
                  </div>
                  <div className="col-4">
                    <label className="form-label small mb-1">AM/PM</label>
                    <select className="form-select" value={boy.period} onChange={(e) => updatePerson('boy', 'period', e.target.value)}><option value="">-</option>{PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}</select>
                  </div>
                </div>
                <div className="mt-3">
                  <CitySelect
                    id="boy-city"
                    value={boy.city}
                    placeholder="Search city (e.g. Mumbai, Pune)"
                    onSelect={onBoyCitySelect}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Girl */}
          <div className="col-12 col-lg-5">
            <div className="card border-0 shadow h-100 rounded-3" style={{ borderLeft: '4px solid #2d6e4a', overflow: 'visible' }}>
              <div className="card-header py-3 px-4 text-white" style={{ backgroundColor: '#2d6e4a' }}>
                <h2 className="h5 fw-bold mb-0">{page?.girlTitle}</h2>
              </div>
              <div className="card-body p-4" style={{ overflow: 'visible' }}>
                <div className="mb-3">
                  <label className="form-label small mb-1">Name (optional)</label>
                  <input type="text" className="form-control" value={girl.name} onChange={(e) => updatePerson('girl', 'name', e.target.value)} 
                  placeholder="e.g. Priyanka kadam" />
                </div>
                <p className="small text-uppercase text-muted fw-semibold mb-2">Birth date</p>
                <div className="row g-2 mb-4">
                  <div className="col-4">
                    <label className="form-label small mb-1">Day</label>
                    <select className="form-select" value={girl.day} onChange={(e) => updatePerson('girl', 'day', e.target.value)}><option value="">-</option>{days.map((d) => <option key={d} value={d}>{d}</option>)}</select>
                  </div>
                  <div className="col-4">
                    <label className="form-label small mb-1">Month</label>
                    <select className="form-select" value={girl.month} onChange={(e) => updatePerson('girl', 'month', e.target.value)}><option value="">-</option>{MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}</select>
                  </div>
                  <div className="col-4">
                    <label className="form-label small mb-1">Year</label>
                    <select className="form-select" value={girl.year} onChange={(e) => updatePerson('girl', 'year', e.target.value)}><option value="">-</option>{years.map((y) => <option key={y} value={y}>{y}</option>)}</select>
                  </div>
                </div>
                <p className="small text-uppercase text-muted fw-semibold mb-2">Birth time</p>
                <div className="row g-2">
                  <div className="col-4">
                    <label className="form-label small mb-1">Hour</label>
                    <select className="form-select" value={girl.hour} onChange={(e) => updatePerson('girl', 'hour', e.target.value)}><option value="">-</option>{hours.map((h) => <option key={h} value={h}>{h}</option>)}</select>
                  </div>
                  <div className="col-4">
                    <label className="form-label small mb-1">Minute</label>
                    <select className="form-select" value={girl.minute} onChange={(e) => updatePerson('girl', 'minute', e.target.value)}><option value="">-</option>{minutes.map((m) => <option key={m} value={m}>{m}</option>)}</select>
                  </div>
                  <div className="col-4">
                    <label className="form-label small mb-1">AM/PM</label>
                    <select className="form-select" value={girl.period} onChange={(e) => updatePerson('girl', 'period', e.target.value)}><option value="">-</option>{PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}</select>
                  </div>
                </div>
                <div className="mt-3">
                  <CitySelect
                    id="girl-city"
                    value={girl.city}
                    placeholder="Search city (e.g. Mumbai, Pune)"
                    onSelect={onGirlCitySelect}
                    showGeocodeHint={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

      <div className="text-center mt-5">
          <div className="form-check form-check-inline justify-content-center mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="include-manglik"
              checked={includeManglik}
              onChange={(e) => setIncludeManglik(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="include-manglik">
              {page?.includeManglik}
            </label>
          </div>
          <button type="submit" className="btn btn-lg px-5 py-3 rounded-pill shadow-sm" style={{ backgroundColor: '#5C2D6E', color: 'white' }} disabled={loading}>
            {loading ? <>{page?.loading || 'Loading…'} <span className="spinner-border spinner-border-sm ms-2" /></> : (page?.submit || 'Submit')}
          </button>
        </div>
      </form>

      {error && (
        <div className="alert alert-danger mt-4 mx-auto rounded-3 shadow-sm" style={{ maxWidth: '600px' }} role="alert">
          {typeof error === 'string' ? error : (error?.message || 'Something went wrong.')}
        </div>
      )}

      {result && payload && (
        <div className="mt-5 mx-auto" style={{ maxWidth: '800px' }}>
          {/* Names + Score & verdict */}
          <div className="card border-0 shadow rounded-3 mb-4 overflow-hidden" style={{ borderLeft: '4px solid #f0ad4e' }}>
            <div className="card-header py-3 px-4 text-dark" style={{ backgroundColor: 'rgba(240,173,78,0.2)' }}>
              <h2 className="h5 fw-bold mb-0">{page?.resultTitle}</h2>
            </div>
            <div className="card-body p-4">
              {(payload.groom_name || payload.bride_name) && (
                <p className="mb-3 small text-muted">
                  <strong>{payload.groom_name || 'Groom'}</strong> & <strong>{payload.bride_name || 'Bride'}</strong>
                </p>
              )}
              <div className="row align-items-center mb-3">
                <div className="col-auto">
                  <span className="display-5 fw-bold" style={{ color: '#5C2D6E' }}>{normalized?.totalPoints ?? payload?.total_score ?? payload?.compatibility_score}</span>
                  <span className="text-muted fs-5"> / {normalized?.maxPoints ?? payload?.max_score ?? 36}</span>
                </div>
                <div className="col">
                  {percentage != null && <p className="mb-1 small text-muted">Percentage: <strong className="text-dark">{percentage}%</strong></p>}
                  {(normalized?.verdict || payload.verdict) && <p className="mb-0 fw-semibold" style={{ color: '#2d6e4a' }}>{normalized?.verdict || payload.verdict}</p>}
                  {verdictDetail && <p className="mb-0 mt-1 small text-muted">{verdictDetail}</p>}
                </div>
              </div>
              {(normalized?.recommendation || payload.recommendation) && (
                <p className="mb-0 p-3 rounded-3" style={{ backgroundColor: 'rgba(92,45,110,0.06)' }}>{normalized?.recommendation || payload.recommendation}</p>
              )}
            </div>
          </div>

          {/* Guna Milan (Ashtakoot) – kutas array or object */}
          {(kutasArray?.length > 0 || (gunaMilanForDisplay && Object.keys(gunaMilanForDisplay).length > 0)) && (
            <div className="card border-0 shadow rounded-3 mb-4 overflow-hidden" style={{ borderLeft: '4px solid #5C2D6E' }}>
              <div className="card-header py-3 px-4 text-white" style={{ backgroundColor: '#5C2D6E' }}>
                <h3 className="h6 fw-bold mb-0">Guna Milan (Ashtakoot)</h3>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  {kutasArray && kutasArray.length > 0
                    ? kutasArray.map((k, idx) => (
                        <div key={k.name || idx} className="col-12 col-md-6">
                          <div className="p-3 border rounded-3 h-100" style={{ backgroundColor: 'rgba(92,45,110,0.04)' }}>
                            <div className="d-flex justify-content-between align-items-start mb-1">
                              <span className="fw-semibold">{GUNA_LABELS[String(k.name || '').toLowerCase()] || GUNA_LABELS[String(k.name || '').toLowerCase().replace(/\s+/g, '_')] || k.name || '—'}</span>
                              <span className="badge rounded-pill" style={{ backgroundColor: '#5C2D6E' }}>{k.score ?? k.points ?? 0} / {k.max ?? 0}</span>
                            </div>
                            {k.description && <p className="small text-muted mb-1">{k.description}</p>}
                            {k.aspect && <p className="small mb-0" style={{ color: '#5C2D6E', opacity: 0.9 }}>{k.aspect}</p>}
                          </div>
                        </div>
                      ))
                    : Object.entries(gunaMilanForDisplay).map(([key, g]) => (
                        <div key={key} className="col-12 col-md-6">
                          <div className="p-3 border rounded-3 h-100" style={{ backgroundColor: 'rgba(92,45,110,0.04)' }}>
                            <div className="d-flex justify-content-between align-items-start mb-1">
                              <span className="fw-semibold">{GUNA_LABELS[key] || key}</span>
                              <span className="badge rounded-pill" style={{ backgroundColor: '#5C2D6E' }}>{g.points ?? g.score ?? 0} / {g.max ?? 0}</span>
                            </div>
                            {g.description && <p className="small text-muted mb-0">{g.description}</p>}
                          </div>
                        </div>
                      ))}
                </div>
              </div>
            </div>
          )}

          {/* Manglik analysis (groom_manglik, bride_manglik, match_status) */}
          {manglikAnalysis && (
            <div className="card border-0 shadow rounded-3 mb-4 overflow-hidden" style={{ borderLeft: '4px solid #6c757d' }}>
              <div className="card-header py-3 px-4 text-white bg-secondary">
                <h3 className="h6 fw-bold mb-0">Manglik Analysis</h3>
              </div>
              <div className="card-body p-4">
                <div className="row g-2">
                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded">
                      <strong>Groom:</strong> {manglikAnalysis.groom_manglik ? 'Manglik' : 'Not Manglik'}
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded">
                      <strong>Bride:</strong> {manglikAnalysis.bride_manglik ? 'Manglik' : 'Not Manglik'}
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded">
                      <strong>Compatibility:</strong> <span className="text-capitalize">{manglikAnalysis.match_status || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Groom & Bride details (nakshatra, moon_sign, gana, nadi, etc.) */}
          {(groomDetails || brideDetails) && (
            <div className="card border-0 shadow rounded-3 mb-4 overflow-hidden" style={{ borderLeft: '4px solid #2d6e4a' }}>
              <div className="card-header py-3 px-4 text-white" style={{ backgroundColor: '#2d6e4a' }}>
                <h3 className="h6 fw-bold mb-0">Birth Details</h3>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  {groomDetails && (
                    <div className="col-12 col-md-6">
                      <div className="p-3 rounded-3 h-100" style={{ backgroundColor: 'rgba(92,45,110,0.06)', borderLeft: '3px solid #5C2D6E' }}>
                        <h4 className="h6 fw-semibold mb-2" style={{ color: '#5C2D6E' }}>{payload.groom_name || 'Groom'}</h4>
                        <ul className="list-unstyled small mb-0">
                          {groomDetails.nakshatra != null && <li><strong>Nakshatra:</strong> {groomDetails.nakshatra}</li>}
                          {groomDetails.nakshatra_lord != null && <li><strong>Nakshatra Lord:</strong> {groomDetails.nakshatra_lord}</li>}
                          {groomDetails.moon_sign != null && <li><strong>Moon Sign:</strong> {groomDetails.moon_sign}</li>}
                          {groomDetails.gana != null && <li><strong>Gana:</strong> {groomDetails.gana}</li>}
                          {groomDetails.nadi != null && <li><strong>Nadi:</strong> {groomDetails.nadi}</li>}
                        </ul>
                      </div>
                    </div>
                  )}
                  {brideDetails && (
                    <div className="col-12 col-md-6">
                      <div className="p-3 rounded-3 h-100" style={{ backgroundColor: 'rgba(45,110,74,0.08)', borderLeft: '3px solid #2d6e4a' }}>
                        <h4 className="h6 fw-semibold mb-2" style={{ color: '#2d6e4a' }}>{payload.bride_name || 'Bride'}</h4>
                        <ul className="list-unstyled small mb-0">
                          {brideDetails.nakshatra != null && <li><strong>Nakshatra:</strong> {brideDetails.nakshatra}</li>}
                          {brideDetails.nakshatra_lord != null && <li><strong>Nakshatra Lord:</strong> {brideDetails.nakshatra_lord}</li>}
                          {brideDetails.moon_sign != null && <li><strong>Moon Sign:</strong> {brideDetails.moon_sign}</li>}
                          {brideDetails.gana != null && <li><strong>Gana:</strong> {brideDetails.gana}</li>}
                          {brideDetails.nadi != null && <li><strong>Nadi:</strong> {brideDetails.nadi}</li>}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Doshas – array (name, severity, description, remedies) or object format */}
          {(doshasIsArray ? payload.doshas?.length > 0 : payload.doshas && typeof payload.doshas === 'object' && !Array.isArray(payload.doshas) && Object.keys(payload.doshas).length > 0) && (
            <div className="card border-0 shadow rounded-3 mb-4 overflow-hidden" style={{ borderLeft: '4px solid #6c757d' }}>
              <div className="card-header py-3 px-4 text-white bg-secondary">
                <h3 className="h6 fw-bold mb-0">Doshas & Remedies</h3>
              </div>
              <div className="card-body p-4">
                {doshasIsArray ? (
                  <div className="d-flex flex-column gap-4">
                    {payload.doshas.map((d, i) => (
                      <div key={i} className="p-3 rounded-3 border" style={{ backgroundColor: 'rgba(108,117,125,0.06)' }}>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <strong>{typeof d === 'object' ? (d?.name || d?.type || '—') : d}</strong>
                          {typeof d === 'object' && d?.severity && (
                            <span className={`badge rounded-pill ${d.severity === 'high' ? 'bg-danger' : d.severity === 'medium' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                              {d.severity}
                            </span>
                          )}
                        </div>
                        {typeof d === 'object' && d?.description && <p className="small text-muted mb-2">{d.description}</p>}
                        {Array.isArray(d?.remedies) && d.remedies.length > 0 && (
                          <div>
                            <strong className="small">Remedies:</strong>
                            <ul className="mb-0 mt-1 small">
                              {d.remedies.map((r, j) => (
                                <li key={j}>{r}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {payload.doshas.manglik && (
                      <div className="mb-4">
                        <h4 className="h6 fw-semibold mb-2">Manglik</h4>
                        <div className="row g-2">
                          <div className="col-md-6">
                            <div className="p-2 bg-light rounded">
                              <strong>Groom:</strong> {payload.doshas.manglik.boy?.present ? `Yes (${payload.doshas.manglik.boy.intensity || '-'})` : 'No'}
                              {payload.doshas.manglik.boy?.cancelled_by && <span className="small text-muted"> — {payload.doshas.manglik.boy.cancelled_by}</span>}
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="p-2 bg-light rounded">
                              <strong>Bride:</strong> {payload.doshas.manglik.girl?.present ? `Yes (${payload.doshas.manglik.girl.intensity || '-'})` : 'No'}
                              {payload.doshas.manglik.girl?.cancelled_by && <span className="small text-muted"> — {payload.doshas.manglik.girl.cancelled_by}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {payload.doshas.nadi_dosha && (
                      <div>
                        <h4 className="h6 fw-semibold mb-2">Nadi Dosha</h4>
                        <div className="p-3 bg-light rounded mb-2">
                          <p className="mb-1"><strong>Present:</strong> {payload.doshas.nadi_dosha.present ? 'Yes' : 'No'} {payload.doshas.nadi_dosha.severity && ` — ${payload.doshas.nadi_dosha.severity}`}</p>
                          {Array.isArray(payload.doshas.nadi_dosha.remedies) && payload.doshas.nadi_dosha.remedies.length > 0 && (
                            <p className="mb-0"><strong>Remedies:</strong> {payload.doshas.nadi_dosha.remedies.join(', ')}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
          {doshasIsArray && payload.doshas?.length === 0 && (
            <div className="card border-0 shadow rounded-3 mb-4 overflow-hidden" style={{ borderLeft: '4px solid #2d6e4a' }}>
              <div className="card-body p-4">
                <p className="mb-0 text-muted">No doshas reported.</p>
              </div>
            </div>
          )}

          {/* Ayanamsa & metadata (subtle footer) */}
          {/* {(payload?.ayanamsa || metadata) && (
            <div className="card border-0 shadow-sm rounded-3 mb-4">
              <div className="card-body py-2 px-3 small text-muted d-flex flex-wrap align-items-center gap-3">
                {payload?.ayanamsa && <span>Ayanamsa: <strong>{payload.ayanamsa}</strong></span>}
                {metadata?.calculation_time_ms != null && <span>Calculation: {metadata.calculation_time_ms} ms</span>}
                {metadata?.api_version && <span>API v{metadata.api_version}</span>}
                {metadata?.cache_hit === true && <span className="text-success">Served from cache</span>}
              </div>
            </div>
          )} */}

          {/* Detailed analysis */}
          {payload.detailed_analysis && Object.keys(payload.detailed_analysis).length > 0 && (
            <div className="card border-0 shadow rounded-3 mb-4 overflow-hidden" style={{ borderLeft: '4px solid #2d6e4a' }}>
              <div className="card-header py-3 px-4 text-white" style={{ backgroundColor: '#2d6e4a' }}>
                <h3 className="h6 fw-bold mb-0">Detailed Analysis</h3>
              </div>
              <div className="card-body p-4">
                <div className="row g-2">
                  {Object.entries(payload.detailed_analysis).map(([key, value]) => (
                    <div key={key} className="col-12 col-md-6 d-flex align-items-center p-3 border rounded-3" style={{ backgroundColor: 'rgba(45,110,74,0.05)' }}>
                      <span className="text-muted text-capitalize me-2" style={{ minWidth: '140px' }}>{key.replace(/_/g, ' ')}:</span>
                      <span className="fw-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KundaliMatchPage;
