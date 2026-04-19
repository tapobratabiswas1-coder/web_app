// ─── Weather App Configuration ───────────────────────────────────────
// Weather data powered by WeatherAPI.com
// 🔑 WeatherAPI:  https://www.weatherapi.com (free tier: 1M calls/month)
//
// ⚠️  For production / public repos, NEVER commit real keys.
// ─────────────────────────────────────────────────────────────────────

const CONFIG = {
  // Key backend e sorano hoyeche security er jonno
  DEFAULT_CITY: "Delhi",
  DEFAULT_LAT: 28.6139,
  DEFAULT_LON: 77.209,
  UNITS: "metric",
  DEBOUNCE_MS: 300,
  CACHE_DURATION: 10 * 60 * 1000,
};
