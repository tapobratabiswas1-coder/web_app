// ─── Weather App Configuration ───────────────────────────────────────
// Weather data powered by WeatherAPI.com
// 🔑 WeatherAPI:  https://www.weatherapi.com (free tier: 1M calls/month)
//
// ⚠️  For production / public repos, NEVER commit real keys.
// ─────────────────────────────────────────────────────────────────────

const CONFIG = {
  WEATHERAPI_KEY: "f198e1d368bd4c3b96473340260303",
  GOOGLE_MAPS_API_KEY: "YOUR_GOOGLE_MAPS_API_KEY_HERE",

  // Base URL
  WEATHERAPI_BASE: "https://api.weatherapi.com/v1",

  // Defaults
  DEFAULT_CITY: "Delhi",
  DEFAULT_LAT: 28.6139,
  DEFAULT_LON: 77.209,
  UNITS: "metric", // metric | imperial
  DEBOUNCE_MS: 300,
  CACHE_DURATION: 10 * 60 * 1000, // 10 minutes
};
