/* ═══════════════════════════════════════════════════════════════════════
   Weather App — Application Logic
   Author: Tapobrata
   
   Vanilla JS with async/await · modular functions · clean error handling
   ═══════════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ──────────────────────────────────────────────────────────────────
       STATE
       ────────────────────────────────────────────────────────────────── */
  const state = {
    unit: localStorage.getItem("unit") || "metric", // metric | imperial
    theme: localStorage.getItem("theme") || "dark",
    accent: localStorage.getItem("accent") || "#6366f1",
    font: localStorage.getItem("font") || "'Inter', sans-serif",
    bgStyle: localStorage.getItem("bgStyle") || "dynamic",
    animations: localStorage.getItem("animations") !== "off",
    favourites: JSON.parse(localStorage.getItem("favourites") || "[]"),
    currentLat: null,
    currentLon: null,
    currentCity: "",
    chart: null,
    map: null,
    mapMarker: null,
    debounceTimer: null,
  };

  /* ──────────────────────────────────────────────────────────────────
       DOM REFERENCES
      -*/
  const $ = (id) => document.getElementById(id);
  const dom = {
    body: document.documentElement,
    searchInput: $("searchInput"),
    searchClear: $("searchClear"),
    searchResults: $("searchResults"),
    btnMyLocation: $("btnMyLocation"),
    btnUnitToggle: $("btnUnitToggle"),
    btnThemeToggle: $("btnThemeToggle"),
    btnSettings: $("btnSettings"),
    settingsDrawer: $("settingsDrawer"),
    settingsOverlay: $("settingsOverlay"),
    btnSettingsClose: $("btnSettingsClose"),
    colourSwatches: $("colourSwatches"),
    fontSelect: $("fontSelect"),
    bgStyleSelect: $("bgStyleSelect"),
    toggleAnimations: $("toggleAnimations"),
    skeleton: $("skeletonScreen"),
    liveContent: $("liveContent"),
    heroIcon: $("heroIcon"),
    heroLocation: $("heroLocation"),
    heroTemp: $("heroTemp"),
    heroCondition: $("heroCondition"),
    heroRange: $("heroRange"),
    heroQuote: $("heroQuote"),
    btnFavourite: $("btnFavourite"),
    btnShare: $("btnShare"),
    favouritesBar: $("favouritesBar"),
    favouritesList: $("favouritesList"),
    alertsSection: $("alertsSection"),
    alertsList: $("alertsList"),
    detailsGrid: $("detailsGrid"),
    hourlyScroll: $("hourlyScroll"),
    dailyList: $("dailyList"),
    chartCanvas: $("tempChart"),
    mapContainer: $("mapContainer"),
    weatherBgEffects: $("weatherBgEffects"),
    toastContainer: $("toastContainer"),
  };

  /* ──────────────────────────────────────────────────────────────────
       WEATHER ICONS (inline SVG)
       ────────────────────────────────────────────────────────────────── */
  const weatherIcons = {
    "01d": `<svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="12" fill="#FBBF24"/><g stroke="#FBBF24" stroke-width="3" stroke-linecap="round"><line x1="32" y1="6" x2="32" y2="14"/><line x1="32" y1="50" x2="32" y2="58"/><line x1="6" y1="32" x2="14" y2="32"/><line x1="50" y1="32" x2="58" y2="32"/><line x1="13.6" y1="13.6" x2="19.3" y2="19.3"/><line x1="44.7" y1="44.7" x2="50.4" y2="50.4"/><line x1="13.6" y1="50.4" x2="19.3" y2="44.7"/><line x1="44.7" y1="19.3" x2="50.4" y2="13.6"/></g></svg>`,
    "01n": `<svg viewBox="0 0 64 64" fill="none"><circle cx="28" cy="32" r="16" fill="#FCD34D"/><circle cx="38" cy="26" r="14" fill="#09090b"/></svg>`,
    "02d": `<svg viewBox="0 0 64 64" fill="none"><circle cx="24" cy="22" r="9" fill="#FBBF24"/><g stroke="#FBBF24" stroke-width="2.5" stroke-linecap="round"><line x1="24" y1="6" x2="24" y2="10"/><line x1="24" y1="34" x2="24" y2="38"/><line x1="8" y1="22" x2="12" y2="22"/><line x1="36" y1="22" x2="40" y2="22"/></g><path d="M18 46a12 12 0 0 1 0-24h2a10 10 0 0 1 19.4 3H42a8 8 0 0 1 0 16H18z" fill="#CBD5E1" opacity="0.9"/></svg>`,
    "02n": `<svg viewBox="0 0 64 64" fill="none"><path d="M18 8a12 12 0 1 0 0 24A12 12 0 0 1 18 8z" fill="#FCD34D" opacity="0.8"/><path d="M18 48a12 12 0 0 1 0-24h2a10 10 0 0 1 19.4 3H42a8 8 0 0 1 0 16H18z" fill="#CBD5E1" opacity="0.9"/></svg>`,
    "03d": `<svg viewBox="0 0 64 64" fill="none"><path d="M16 46a12 12 0 0 1 0-24h2a10 10 0 0 1 19.4 3H40a8 8 0 0 1 0 16H16z" fill="#CBD5E1"/></svg>`,
    "03n": `<svg viewBox="0 0 64 64" fill="none"><path d="M16 46a12 12 0 0 1 0-24h2a10 10 0 0 1 19.4 3H40a8 8 0 0 1 0 16H16z" fill="#CBD5E1"/></svg>`,
    "04d": `<svg viewBox="0 0 64 64" fill="none"><path d="M12 48a11 11 0 0 1 0-22h1.5a9.5 9.5 0 0 1 18.3 2.5H34a7.5 7.5 0 0 1 0 15H12z" fill="#CBD5E1"/><path d="M28 38a9 9 0 0 1 0-18h1a8 8 0 0 1 15.4 2H46a6 6 0 0 1 0 12H28z" fill="#94A3B8" opacity="0.8"/></svg>`,
    "04n": `<svg viewBox="0 0 64 64" fill="none"><path d="M12 48a11 11 0 0 1 0-22h1.5a9.5 9.5 0 0 1 18.3 2.5H34a7.5 7.5 0 0 1 0 15H12z" fill="#CBD5E1"/><path d="M28 38a9 9 0 0 1 0-18h1a8 8 0 0 1 15.4 2H46a6 6 0 0 1 0 12H28z" fill="#94A3B8" opacity="0.8"/></svg>`,
    "09d": `<svg viewBox="0 0 64 64" fill="none"><path d="M14 36a10 10 0 0 1 0-20h2a8.5 8.5 0 0 1 16.4 2.5H34a7 7 0 0 1 0 14H14z" fill="#CBD5E1"/><g stroke="#60A5FA" stroke-width="2.5" stroke-linecap="round"><line x1="20" y1="42" x2="18" y2="52"/><line x1="28" y1="42" x2="26" y2="52"/><line x1="36" y1="42" x2="34" y2="52"/></g></svg>`,
    "09n": `<svg viewBox="0 0 64 64" fill="none"><path d="M14 36a10 10 0 0 1 0-20h2a8.5 8.5 0 0 1 16.4 2.5H34a7 7 0 0 1 0 14H14z" fill="#CBD5E1"/><g stroke="#60A5FA" stroke-width="2.5" stroke-linecap="round"><line x1="20" y1="42" x2="18" y2="52"/><line x1="28" y1="42" x2="26" y2="52"/><line x1="36" y1="42" x2="34" y2="52"/></g></svg>`,
    "10d": `<svg viewBox="0 0 64 64" fill="none"><circle cx="22" cy="18" r="7" fill="#FBBF24"/><path d="M14 38a10 10 0 0 1 0-20h2a8.5 8.5 0 0 1 16.4 2.5H34a7 7 0 0 1 0 14H14z" fill="#CBD5E1" opacity="0.9"/><g stroke="#60A5FA" stroke-width="2.5" stroke-linecap="round"><line x1="20" y1="44" x2="18" y2="54"/><line x1="28" y1="44" x2="26" y2="54"/><line x1="36" y1="44" x2="34" y2="54"/></g></svg>`,
    "10n": `<svg viewBox="0 0 64 64" fill="none"><path d="M14 38a10 10 0 0 1 0-20h2a8.5 8.5 0 0 1 16.4 2.5H34a7 7 0 0 1 0 14H14z" fill="#CBD5E1" opacity="0.9"/><g stroke="#60A5FA" stroke-width="2.5" stroke-linecap="round"><line x1="20" y1="44" x2="18" y2="54"/><line x1="28" y1="44" x2="26" y2="54"/><line x1="36" y1="44" x2="34" y2="54"/></g></svg>`,
    "11d": `<svg viewBox="0 0 64 64" fill="none"><path d="M12 34a10 10 0 0 1 0-20h2a8.5 8.5 0 0 1 16.4 2.5H32a7 7 0 0 1 0 14H12z" fill="#94A3B8"/><polygon points="28,36 22,48 28,48 24,58 36,44 30,44 34,36" fill="#FBBF24"/></svg>`,
    "11n": `<svg viewBox="0 0 64 64" fill="none"><path d="M12 34a10 10 0 0 1 0-20h2a8.5 8.5 0 0 1 16.4 2.5H32a7 7 0 0 1 0 14H12z" fill="#94A3B8"/><polygon points="28,36 22,48 28,48 24,58 36,44 30,44 34,36" fill="#FBBF24"/></svg>`,
    "13d": `<svg viewBox="0 0 64 64" fill="none"><path d="M14 36a10 10 0 0 1 0-20h2a8.5 8.5 0 0 1 16.4 2.5H34a7 7 0 0 1 0 14H14z" fill="#E2E8F0"/><g fill="#F1F5F9"><circle cx="20" cy="46" r="3"/><circle cx="30" cy="50" r="2.5"/><circle cx="38" cy="44" r="2"/></g></svg>`,
    "13n": `<svg viewBox="0 0 64 64" fill="none"><path d="M14 36a10 10 0 0 1 0-20h2a8.5 8.5 0 0 1 16.4 2.5H34a7 7 0 0 1 0 14H14z" fill="#E2E8F0"/><g fill="#F1F5F9"><circle cx="20" cy="46" r="3"/><circle cx="30" cy="50" r="2.5"/><circle cx="38" cy="44" r="2"/></g></svg>`,
    "50d": `<svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="20" r="10" fill="#FBBF24"/><g stroke="#FBBF24" stroke-width="2.5" stroke-linecap="round"><line x1="32" y1="4" x2="32" y2="9"/><line x1="32" y1="31" x2="32" y2="36"/><line x1="16" y1="20" x2="21" y2="20"/><line x1="43" y1="20" x2="48" y2="20"/><line x1="20.7" y1="8.7" x2="24.2" y2="12.2"/><line x1="39.8" y1="27.8" x2="43.3" y2="31.3"/><line x1="20.7" y1="31.3" x2="24.2" y2="27.8"/><line x1="39.8" y1="12.2" x2="43.3" y2="8.7"/></g><g stroke="#CBD5E1" stroke-width="2.5" stroke-linecap="round" opacity="0.6"><line x1="10" y1="42" x2="54" y2="42"/><line x1="14" y1="50" x2="50" y2="50"/><line x1="18" y1="58" x2="46" y2="58"/></g></svg>`,
    "50n": `<svg viewBox="0 0 64 64" fill="none"><g stroke="#CBD5E1" stroke-width="3" stroke-linecap="round" opacity="0.7"><line x1="8" y1="22" x2="48" y2="22"/><line x1="12" y1="32" x2="52" y2="32"/><line x1="10" y1="42" x2="44" y2="42"/></g></svg>`,
  };

  function getWeatherIcon(iconCode) {
    return weatherIcons[iconCode] || weatherIcons["03d"];
  }

  /* ──────────────────────────────────────────────────────────────────
       MOTIVATIONAL QUOTES
       ────────────────────────────────────────────────────────────────── */
  const quotes = {
    clear: [
      "Clear skies, clear mind — make today count.",
      "The sun is up, and so is your potential.",
      "Sunshine is the best medicine for the soul.",
    ],
    clouds: [
      "Every cloud hides a silver lining.",
      "Cloudy days are perfect for creative work.",
      "Behind the clouds, the sun is always shining.",
    ],
    rain: [
      "Let the rain wash away your worries.",
      "Rainy days are perfect for cosy coding sessions.",
      "After rain comes a rainbow — keep going.",
    ],
    snow: [
      "Snowflakes remind us that every detail matters.",
      "A snowy day is a blank canvas — paint it your way.",
      "Find peace in the quiet of falling snow.",
    ],
    thunder: [
      "Thunder shakes the sky, but you stand firm.",
      "Storms don't last forever — stay strong.",
      "Lightning sparks creativity. Use it.",
    ],
    mist: [
      "In the fog, focus on what's right ahead.",
      "Misty mornings carry quiet magic.",
      "Sometimes the unclear path leads to the best destination.",
    ],
  };

  function getQuote(conditionGroup) {
    const pool = quotes[conditionGroup] || quotes.clear;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /* ──────────────────────────────────────────────────────────────────
       UTILITY HELPERS
       ────────────────────────────────────────────────────────────────── */

  // Map WeatherAPI condition text → our condition group key
  function conditionGroup(conditionText) {
    const t = (conditionText || "").toLowerCase();
    if (t.includes("thunder")) return "thunder";
    if (t.includes("snow") || t.includes("sleet") || t.includes("blizzard") || t.includes("ice")) return "snow";
    if (t.includes("rain") || t.includes("drizzle") || t.includes("shower")) return "rain";
    if (t.includes("cloud") || t.includes("overcast") || t.includes("partly")) return "clouds";
    if (t.includes("clear") || t.includes("sunny")) return "clear";
    return "mist"; // mist, fog, haze, etc.
  }

  // Map condition group + time of day → background data attribute
  function conditionToBg(group, isNight) {
    if (group === "rain") return "rain";
    if (group === "snow") return "snow";
    if (group === "thunder") return "thunder";
    if (group === "clouds") return "cloudy";
    if (group === "clear" && isNight) return "clear-night";
    return "clear-day";
  }

  // Convert wind degrees → compass direction
  function windDirection(deg) {
    const dirs = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ];
    return dirs[Math.round(deg / 22.5) % 16];
  }

  // UV index label
  function uvLabel(uv) {
    if (uv <= 2) return "Low";
    if (uv <= 5) return "Moderate";
    if (uv <= 7) return "High";
    if (uv <= 10) return "Very High";
    return "Extreme";
  }

  // AQI label
  function aqiLabel(aqi) {
    const labels = ["", "Good", "Fair", "Moderate", "Poor", "Very Poor"];
    return labels[aqi] || "--";
  }

  // Format time string from WeatherAPI "HH:MM" or epoch
  function formatTimeStr(timeStr) {
    // WeatherAPI provides times like "06:44 AM" from astro
    return timeStr || "--";
  }

  // Format hour from WeatherAPI time string "2026-03-03 14:00"
  function formatHourFromStr(timeStr) {
    const d = new Date(timeStr);
    return d.toLocaleTimeString([], { hour: "numeric", hour12: true });
  }

  // Format day name from date string "2026-03-03"
  function formatDayFromStr(dateStr) {
    const d = new Date(dateStr + "T12:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(d);
    target.setHours(0, 0, 0, 0);
    const diff = Math.round((target - today) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    return d.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  // Temperature display helper (WeatherAPI gives temp_c directly)
  function tempStr(celsius) {
    if (state.unit === "imperial") {
      return Math.round((celsius * 9) / 5 + 32) + "°F";
    }
    return Math.round(celsius) + "°C";
  }

  function tempVal(celsius) {
    if (state.unit === "imperial") return Math.round((celsius * 9) / 5 + 32);
    return Math.round(celsius);
  }

  // Wind speed display (WeatherAPI gives wind_kph directly)
  function windStr(kph) {
    if (state.unit === "imperial") return Math.round(kph * 0.621) + " mph";
    return Math.round(kph) + " km/h";
  }

  // Debounce helper
  function debounce(fn, ms) {
    return (...args) => {
      clearTimeout(state.debounceTimer);
      state.debounceTimer = setTimeout(() => fn(...args), ms);
    };
  }

  // Toast notification
  function showToast(message, isError = false) {
    const toast = document.createElement("div");
    toast.className = "toast" + (isError ? " toast--error" : "");
    toast.textContent = message;
    dom.toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  /* ──────────────────────────────────────────────────────────────────
       API LAYER  (WeatherAPI.com)
       ────────────────────────────────────────────────────────────────── */

  async function fetchJSON(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

 // 1. Updated fetchWeatherData function
  async function fetchWeatherData(lat, lon) {
    // Direct API call er bodole amader secure netlify function ke call korchi
    const url = `/.netlify/functions/api?endpoint=forecast.json&q=${lat},${lon}`;
    return fetchJSON(url);
  }

  // Hardcoded coordinates for small towns not in WeatherAPI's search database
  const SMALL_TOWN_LOOKUP = {
    "tarapith": { name: "Tarapith", lat: 24.05, lon: 87.88, country: "India", state: "West Bengal" },
    "rampurhat": { name: "Rampurhat", lat: 24.17, lon: 87.78, country: "India", state: "West Bengal" },
    "suri": { name: "Suri", lat: 23.91, lon: 87.53, country: "India", state: "West Bengal" },
    "siuri": { name: "Siuri", lat: 23.91, lon: 87.53, country: "India", state: "West Bengal" },
    "bolpur": { name: "Bolpur", lat: 23.67, lon: 87.72, country: "India", state: "West Bengal" },
    "santiniketan": { name: "Santiniketan", lat: 23.68, lon: 87.69, country: "India", state: "West Bengal" },
    "nalhati": { name: "Nalhati", lat: 24.29, lon: 87.82, country: "India", state: "West Bengal" },
    "sainthia": { name: "Sainthia", lat: 23.95, lon: 87.67, country: "India", state: "West Bengal" },
    "dubrajpur": { name: "Dubrajpur", lat: 23.80, lon: 87.38, country: "India", state: "West Bengal" },
    "massanjore": { name: "Massanjore", lat: 24.25, lon: 87.00, country: "India", state: "Jharkhand" },
  };

  // 2. Updated geocodeCity function
  async function geocodeCity(query) {
    // Search er jonno amader secure netlify function ke call korchi
    const url = `/.netlify/functions/api?endpoint=search.json&q=${encodeURIComponent(query)}`;
    let results = [];

    try {
      const apiResults = await fetchJSON(url);
      const resultArray = Array.isArray(apiResults) ? apiResults : [];
      
      results = resultArray.map(r => ({
        name: r.name,
        lat: r.lat,
        lon: r.lon,
        country: r.country,
        state: r.region || "",
      }));
    } catch (e) {
      console.warn("Search failed via proxy:", e);
    }

    if (results.length === 0) {
      const q = query.toLowerCase().trim();
      if (SMALL_TOWN_LOOKUP[q]) {
        results.push(SMALL_TOWN_LOOKUP[q]);
      } else {
        Object.values(SMALL_TOWN_LOOKUP).forEach(town => {
          if (town.name.toLowerCase().startsWith(q) || q.startsWith(town.name.toLowerCase())) {
            results.push(town);
          }
        });
      }
    }
    return results;
  }

  // Map WeatherAPI condition code to our icon codes (01d/01n style)
  function mapConditionToIcon(code, isDay) {
    const suffix = isDay ? "d" : "n";
    // WeatherAPI condition codes: https://www.weatherapi.com/docs/weather_conditions.json
    if (code === 1000) return "01" + suffix; // Sunny/Clear
    if (code === 1003) return "02" + suffix; // Partly cloudy
    if (code === 1006) return "03" + suffix; // Cloudy
    if (code === 1009) return "04" + suffix; // Overcast
    if (code === 1030 || code === 1135 || code === 1147) return "01" + suffix; // Mist/Fog → show sun/moon instead of lines
    if ([1063, 1150, 1153, 1168, 1171, 1180, 1183].includes(code)) return "10" + suffix; // Light rain
    if ([1186, 1189, 1192, 1195, 1198, 1201, 1240, 1243, 1246].includes(code)) return "09" + suffix; // Rain
    if ([1066, 1069, 1072, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264].includes(code)) return "13" + suffix; // Snow
    if ([1087, 1273, 1276, 1279, 1282].includes(code)) return "11" + suffix; // Thunder
    return "03" + suffix; // default: cloudy
  }

  /* ──────────────────────────────────────────────────────────────────
       MAIN DATA FETCH & RENDER
       ────────────────────────────────────────────────────────────────── */

  async function loadWeather(lat, lon, cityName) {
    showSkeleton(true);
    try {
      if (!navigator.onLine) throw new Error("No internet connection.");

      const data = await fetchWeatherData(lat, lon);

      state.currentLat = lat;
      state.currentLon = lon;
      state.currentCity = cityName || data.location.name || "Unknown";

      renderHero(data);
      renderDetails(data);
      renderHourly(data);
      renderDaily(data);
      renderChart(data);
      renderAlerts(data);
      updateBackground(data);
      updateFavButton();
      updateMap(lat, lon);

      showSkeleton(false);
    } catch (err) {
      console.error("loadWeather error:", err);
      showToast(err.message || "Failed to load weather data.", true);
      showSkeleton(false);
    }
  }

  function showSkeleton(show) {
    dom.skeleton.hidden = !show;
    dom.liveContent.hidden = show;
  }

  /* ──────────────────────────────────────────────────────────────────
       RENDER: HERO
       ────────────────────────────────────────────────────────────────── */
  function renderHero(data) {
    const current = data.current;
    const todayForecast = data.forecast.forecastday[0];
    const iconCode = mapConditionToIcon(current.condition.code, current.is_day);
    const group = conditionGroup(current.condition.text);

    dom.heroIcon.innerHTML = getWeatherIcon(iconCode);
    dom.heroLocation.textContent = `${state.currentCity}, ${data.location.country}`;
    dom.heroTemp.textContent = tempStr(current.temp_c);
    dom.heroCondition.textContent = current.condition.text;
    dom.heroRange.innerHTML = `H: ${tempStr(todayForecast.day.maxtemp_c)} &nbsp; L: ${tempStr(todayForecast.day.mintemp_c)}`;
    dom.heroQuote.textContent = getQuote(group);
  }

  /* ──────────────────────────────────────────────────────────────────
       RENDER: DETAILS
       ────────────────────────────────────────────────────────────────── */
  function renderDetails(data) {
    const current = data.current;
    const todayAstro = data.forecast.forecastday[0].astro;

    $("valFeelsLike").textContent = tempStr(current.feelslike_c);
    $("valHumidity").textContent = current.humidity + "%";
    $("valWind").textContent = windStr(current.wind_kph);
    $("valWindDir").textContent = current.wind_dir || "";
    $("valVisibility").textContent = current.vis_km + " km";
    $("valPressure").textContent = current.pressure_mb + " hPa";
    $("valSunrise").textContent = formatTimeStr(todayAstro.sunrise);
    $("valSunset").textContent = formatTimeStr(todayAstro.sunset);
    $("valClouds").textContent = current.cloud + "%";

    // UV — WeatherAPI includes UV in current data (0 at night is normal)
    $("valUV").textContent = current.uv != null ? current.uv : "0";
    $("valUVLabel").textContent = current.uv ? uvLabel(current.uv) : "";

    // AQI — WeatherAPI includes air_quality in current data
    if (current.air_quality && current.air_quality["us-epa-index"]) {
      const aqiVal = current.air_quality["us-epa-index"];
      $("valAQI").textContent = aqiVal;
      $("valAQILabel").textContent = aqiLabel(aqiVal);
    } else {
      $("valAQI").textContent = "--";
      $("valAQILabel").textContent = "";
    }
  }

  /* ──────────────────────────────────────────────────────────────────
       RENDER: HOURLY FORECAST
       ────────────────────────────────────────────────────────────────── */
  function renderHourly(data) {
    // Get current hour and build next 8 hours from today + tomorrow
    const now = new Date(data.location.localtime);
    const currentHour = now.getHours();
    const allHours = [];

    data.forecast.forecastday.forEach(day => {
      day.hour.forEach(h => allHours.push(h));
    });

    // Find hours from current time onwards
    const upcomingHours = allHours.filter(h => {
      const hourTime = new Date(h.time);
      return hourTime >= now;
    }).slice(0, 8);

    dom.hourlyScroll.innerHTML = upcomingHours
      .map((item, i) => {
        const time = i === 0 ? "Now" : formatHourFromStr(item.time);
        const iconCode = mapConditionToIcon(item.condition.code, item.is_day);
        const icon = getWeatherIcon(iconCode);
        return `
                <div class="hourly-card${i === 0 ? " now" : ""}">
                    <div class="hourly-card__time">${time}</div>
                    <div class="hourly-card__icon">${icon}</div>
                    <div class="hourly-card__temp">${tempStr(item.temp_c)}</div>
                </div>`;
      })
      .join("");
  }

  /* ──────────────────────────────────────────────────────────────────
       RENDER: 7-DAY FORECAST
       ────────────────────────────────────────────────────────────────── */
  function renderDaily(data) {
    const days = data.forecast.forecastday;

    dom.dailyList.innerHTML = days
      .map(
        (day) => {
          const iconCode = mapConditionToIcon(day.day.condition.code, true);
          return `
            <div class="daily-card">
                <div class="daily-card__day">${formatDayFromStr(day.date)}</div>
                <div class="daily-card__icon">${getWeatherIcon(iconCode)}</div>
                <div class="daily-card__condition">${day.day.condition.text}</div>
                <div class="daily-card__temps">
                    <span class="daily-card__temp-high">${tempStr(day.day.maxtemp_c)}</span>
                    <span class="daily-card__temp-low">${tempStr(day.day.mintemp_c)}</span>
                </div>
            </div>`;
        },
      )
      .join("");
  }

  /* ──────────────────────────────────────────────────────────────────
       RENDER: TEMPERATURE CHART
       ────────────────────────────────────────────────────────────────── */
  function renderChart(data) {
    // Use same hourly data as renderHourly
    const now = new Date(data.location.localtime);
    const allHours = [];
    data.forecast.forecastday.forEach(day => {
      day.hour.forEach(h => allHours.push(h));
    });
    const upcomingHours = allHours.filter(h => {
      const hourTime = new Date(h.time);
      return hourTime >= now;
    }).slice(0, 8);

    const labels = upcomingHours.map((item, i) =>
      i === 0 ? "Now" : formatHourFromStr(item.time),
    );
    const temps = upcomingHours.map((item) => tempVal(item.temp_c));

    const textColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--text-secondary")
        .trim() || "#94a3b8";
    const accentColor = state.accent;

    // Destroy previous chart instance
    if (state.chart) {
      state.chart.destroy();
      state.chart = null;
    }

    const ctx = dom.chartCanvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 0, 250);
    gradient.addColorStop(0, accentColor + "55");
    gradient.addColorStop(1, accentColor + "05");

    state.chart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Temperature",
            data: temps,
            borderColor: accentColor,
            backgroundColor: gradient,
            borderWidth: 2.5,
            pointBackgroundColor: accentColor,
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(15,23,42,0.9)",
            titleColor: "#f1f5f9",
            bodyColor: "#f1f5f9",
            padding: 10,
            displayColors: false,
            callbacks: {
              label: (ctx) =>
                ctx.parsed.y + (state.unit === "imperial" ? "°F" : "°C"),
            },
          },
        },
        scales: {
          x: {
            ticks: { color: textColor, font: { size: 11 } },
            grid: { display: false },
          },
          y: {
            ticks: {
              color: textColor,
              font: { size: 11 },
              callback: (v) => v + "°",
            },
            grid: { color: "rgba(148,163,184,0.1)" },
          },
        },
        interaction: {
          intersect: false,
          mode: "index",
        },
      },
    });
  }

  /* ──────────────────────────────────────────────────────────────────
       RENDER: ALERTS
       ────────────────────────────────────────────────────────────────── */
  function renderAlerts(data) {
    // WeatherAPI includes alerts in the response if available
    if (data.alerts && data.alerts.alert && data.alerts.alert.length) {
      dom.alertsSection.hidden = false;
      dom.alertsList.innerHTML = data.alerts.alert
        .map(
          (a) => `
                <div class="alert-card">
                    <div class="alert-card__title">${a.event || a.headline || "Alert"}</div>
                    <div class="alert-card__desc">${a.desc || a.instruction || ""}</div>
                </div>`,
        )
        .join("");
    } else {
      dom.alertsSection.hidden = true;
    }
  }

  /* ──────────────────────────────────────────────────────────────────
       BACKGROUND EFFECTS
       ────────────────────────────────────────────────────────────────── */
  function updateBackground(data) {
    const current = data.current;
    const group = conditionGroup(current.condition.text);
    const isNight = !current.is_day;
    const bgKey = conditionToBg(group, isNight);

    // Only apply dynamic background if setting is dynamic
    if (state.bgStyle === "dynamic") {
      dom.body.setAttribute("data-condition", bgKey);
      dom.body.removeAttribute("data-bg");
    }

    // Background effects
    if (state.animations) {
      renderBgEffects(group, isNight);
    }
  }

  function renderBgEffects(group, isNight) {
    dom.weatherBgEffects.innerHTML = "";

    if (group === "rain") {
      // Create rain drops
      for (let i = 0; i < 60; i++) {
        const drop = document.createElement("div");
        drop.className = "rain-drop";
        drop.style.left = Math.random() * 100 + "%";
        drop.style.height = Math.random() * 20 + 15 + "px";
        drop.style.animationDuration = Math.random() * 0.6 + 0.6 + "s";
        drop.style.animationDelay = Math.random() * 2 + "s";
        dom.weatherBgEffects.appendChild(drop);
      }
    } else if (group === "snow") {
      for (let i = 0; i < 40; i++) {
        const flake = document.createElement("div");
        flake.className = "snowflake";
        flake.style.left = Math.random() * 100 + "%";
        flake.style.animationDuration = Math.random() * 3 + 3 + "s";
        flake.style.animationDelay = Math.random() * 3 + "s";
        flake.style.width = Math.random() * 4 + 3 + "px";
        flake.style.height = flake.style.width;
        dom.weatherBgEffects.appendChild(flake);
      }
    } else if (isNight || group === "clear") {
      // Stars for night
      if (isNight) {
        for (let i = 0; i < 50; i++) {
          const star = document.createElement("div");
          star.className = "star";
          star.style.left = Math.random() * 100 + "%";
          star.style.top = Math.random() * 60 + "%";
          star.style.animationDuration = Math.random() * 2 + 1.5 + "s";
          star.style.animationDelay = Math.random() * 3 + "s";
          const size = Math.random() * 2 + 1.5 + "px";
          star.style.width = size;
          star.style.height = size;
          dom.weatherBgEffects.appendChild(star);
        }
      }
    }
  }

  /* ──────────────────────────────────────────────────────────────────
       FAVOURITES
       ────────────────────────────────────────────────────────────────── */
  function renderFavourites() {
    if (state.favourites.length === 0) {
      dom.favouritesBar.hidden = true;
      return;
    }
    dom.favouritesBar.hidden = false;
    dom.favouritesList.innerHTML = state.favourites
      .map(
        (fav) => `
            <div class="fav-chip" data-lat="${fav.lat}" data-lon="${fav.lon}" data-name="${fav.name}">
                <span>${fav.name}</span>
                <span class="fav-chip__remove" data-name="${fav.name}" title="Remove">&times;</span>
            </div>`,
      )
      .join("");
  }

  function toggleFavourite() {
    const exists = state.favourites.findIndex(
      (f) =>
        f.lat.toFixed(2) === state.currentLat.toFixed(2) &&
        f.lon.toFixed(2) === state.currentLon.toFixed(2),
    );

    if (exists >= 0) {
      state.favourites.splice(exists, 1);
    } else {
      state.favourites.push({
        name: state.currentCity,
        lat: state.currentLat,
        lon: state.currentLon,
      });
    }
    localStorage.setItem("favourites", JSON.stringify(state.favourites));
    renderFavourites();
    updateFavButton();
  }

  function updateFavButton() {
    const isFav = state.favourites.some(
      (f) =>
        f.lat.toFixed(2) === state.currentLat?.toFixed(2) &&
        f.lon.toFixed(2) === state.currentLon?.toFixed(2),
    );
    dom.btnFavourite.classList.toggle("active", isFav);
    dom.btnFavourite.querySelector("span").textContent = isFav
      ? "Saved"
      : "Save";
  }

  /* ──────────────────────────────────────────────────────────────────
       SHARE
       ────────────────────────────────────────────────────────────────── */
  function shareWeather() {
    const text = `Weather in ${state.currentCity}: ${dom.heroTemp.textContent}, ${dom.heroCondition.textContent}`;
    if (navigator.share) {
      navigator.share({ title: "Weather Update", text }).catch(() => { });
    } else {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          showToast("Weather info copied to clipboard!");
        })
        .catch(() => {
          showToast("Could not copy text.", true);
        });
    }
  }

  /* ──────────────────────────────────────────────────────────────────
       MAP (Leaflet + OpenStreetMap)
       ────────────────────────────────────────────────────────────────── */
  function initMap(lat, lon) {
    if (typeof L === "undefined") {
      // Leaflet not loaded yet, wait
      setTimeout(() => initMap(lat, lon), 200);
      return;
    }
    if (state.map) return;

    state.map = L.map(dom.mapContainer, {
      center: [lat, lon],
      zoom: 8,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 18,
    }).addTo(state.map);

    state.mapMarker = L.marker([lat, lon]).addTo(state.map);

    // Click to get weather at any point on map
    state.map.on("click", function (e) {
      const { lat: clickLat, lng: clickLon } = e.latlng;
      loadWeather(clickLat, clickLon);
    });

    // Force recalculate tile positions after layout settles
    setTimeout(() => state.map.invalidateSize(), 100);
    setTimeout(() => state.map.invalidateSize(), 500);
  }

  function updateMap(lat, lon) {
    if (!state.map) {
      initMap(lat, lon);
      return;
    }
    state.map.setView([lat, lon], 8);
    if (state.mapMarker) {
      state.mapMarker.setLatLng([lat, lon]);
    } else {
      state.mapMarker = L.marker([lat, lon]).addTo(state.map);
    }
    // Force tile recalculation at multiple intervals to fix gray tiles
    state.map.invalidateSize();
    setTimeout(() => state.map.invalidateSize(), 100);
    setTimeout(() => state.map.invalidateSize(), 300);
    setTimeout(() => state.map.invalidateSize(), 600);
    setTimeout(() => state.map.invalidateSize(), 1000);
  }

  /* ──────────────────────────────────────────────────────────────────
       SEARCH
       ────────────────────────────────────────────────────────────────── */
  const handleSearch = debounce(async (query) => {
    if (query.length < 2) {
      dom.searchResults.hidden = true;
      return;
    }
    try {
      const results = await geocodeCity(query);
      if (!results.length) {
        dom.searchResults.innerHTML =
          '<li class="search__result-item"><span>No cities found</span></li>';
        dom.searchResults.hidden = false;
        return;
      }
      dom.searchResults.innerHTML = results
        .map(
          (r) => `
                <li class="search__result-item" role="option"
                    data-lat="${r.lat}" data-lon="${r.lon}" data-name="${r.name}">
                    <span>${r.name}</span>
                    <span>${r.state ? r.state + ", " : ""}${r.country}</span>
                </li>`,
        )
        .join("");
      dom.searchResults.hidden = false;
    } catch (err) {
      console.error("Search error:", err);
    }
  }, CONFIG.DEBOUNCE_MS);

  /* ──────────────────────────────────────────────────────────────────
       GEOLOCATION
       ────────────────────────────────────────────────────────────────── */
  function getUserLocation() {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser.", true);
      loadWeather(CONFIG.DEFAULT_LAT, CONFIG.DEFAULT_LON, CONFIG.DEFAULT_CITY);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => loadWeather(pos.coords.latitude, pos.coords.longitude),
      (err) => {
        console.warn("Geolocation error:", err.message);
        showToast("Location access denied. Showing default city.", true);
        loadWeather(
          CONFIG.DEFAULT_LAT,
          CONFIG.DEFAULT_LON,
          CONFIG.DEFAULT_CITY,
        );
      },
      { timeout: 10000 },
    );
  }

  /* ──────────────────────────────────────────────────────────────────
       SETTINGS & PREFERENCES
       ────────────────────────────────────────────────────────────────── */
  function applyPreferences() {
    // Theme
    dom.body.setAttribute("data-theme", state.theme);

    // Accent
    document.documentElement.style.setProperty("--accent", state.accent);
    const rgb = hexToRgb(state.accent);
    if (rgb)
      document.documentElement.style.setProperty(
        "--accent-rgb",
        `${rgb.r},${rgb.g},${rgb.b}`,
      );

    // Font
    document.documentElement.style.setProperty("--font", state.font);

    // Background style
    if (state.bgStyle !== "dynamic") {
      dom.body.setAttribute("data-bg", state.bgStyle);
    } else {
      dom.body.removeAttribute("data-bg");
    }

    // Animations
    dom.body.setAttribute("data-animations", state.animations ? "on" : "off");

    // Unit toggle button text
    dom.btnUnitToggle.textContent = state.unit === "metric" ? "°C" : "°F";

    // Settings panel controls
    dom.fontSelect.value = state.font;
    dom.bgStyleSelect.value = state.bgStyle;
    dom.toggleAnimations.checked = state.animations;

    // Highlight active swatch
    document.querySelectorAll(".swatch").forEach((s) => {
      s.classList.toggle("active", s.dataset.colour === state.accent);
    });
  }

  function hexToRgb(hex) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m
      ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
      : null;
  }

  function openSettings() {
    dom.settingsDrawer.setAttribute("aria-hidden", "false");
  }
  function closeSettings() {
    dom.settingsDrawer.setAttribute("aria-hidden", "true");
  }

  /* ──────────────────────────────────────────────────────────────────
       EVENT LISTENERS
       ────────────────────────────────────────────────────────────────── */
  function bindEvents() {
    // Search input
    dom.searchInput.addEventListener("input", (e) => {
      const q = e.target.value.trim();
      dom.searchClear.hidden = !q;
      handleSearch(q);
    });

    // Search clear
    dom.searchClear.addEventListener("click", () => {
      dom.searchInput.value = "";
      dom.searchClear.hidden = true;
      dom.searchResults.hidden = true;
    });

    // Search result click (delegated)
    dom.searchResults.addEventListener("click", (e) => {
      const item = e.target.closest(".search__result-item");
      if (!item || !item.dataset.lat) return;
      const lat = parseFloat(item.dataset.lat);
      const lon = parseFloat(item.dataset.lon);
      const name = item.dataset.name;
      dom.searchInput.value = name;
      dom.searchResults.hidden = true;
      loadWeather(lat, lon, name);
    });

    // Close search results on click outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest("#searchWrapper")) {
        dom.searchResults.hidden = true;
      }
    });

    // Keyboard navigation in search
    dom.searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        dom.searchResults.hidden = true;
      }
      if (e.key === "Enter") {
        const first = dom.searchResults.querySelector(
          ".search__result-item[data-lat]",
        );
        if (first) first.click();
      }
    });

    // My Location
    dom.btnMyLocation.addEventListener("click", getUserLocation);

    // Unit toggle
    dom.btnUnitToggle.addEventListener("click", () => {
      state.unit = state.unit === "metric" ? "imperial" : "metric";
      localStorage.setItem("unit", state.unit);
      dom.btnUnitToggle.textContent = state.unit === "metric" ? "°C" : "°F";
      if (state.currentLat !== null) {
        loadWeather(state.currentLat, state.currentLon, state.currentCity);
      }
    });

    // Theme toggle
    dom.btnThemeToggle.addEventListener("click", () => {
      state.theme = state.theme === "dark" ? "light" : "dark";
      localStorage.setItem("theme", state.theme);
      dom.body.setAttribute("data-theme", state.theme);
    });

    // Settings drawer
    dom.btnSettings.addEventListener("click", openSettings);
    dom.btnSettingsClose.addEventListener("click", closeSettings);
    dom.settingsOverlay.addEventListener("click", closeSettings);

    // Colour swatches
    dom.colourSwatches.addEventListener("click", (e) => {
      const swatch = e.target.closest(".swatch");
      if (!swatch) return;
      state.accent = swatch.dataset.colour;
      localStorage.setItem("accent", state.accent);
      applyPreferences();
      // Re-render chart with new accent
      if (state.currentLat !== null) {
        fetchWeatherData(state.currentLat, state.currentLon)
          .then((data) => renderChart(data))
          .catch(() => { });
      }
    });

    // Font select
    dom.fontSelect.addEventListener("change", (e) => {
      state.font = e.target.value;
      localStorage.setItem("font", state.font);
      applyPreferences();
    });

    // Background style
    dom.bgStyleSelect.addEventListener("change", (e) => {
      state.bgStyle = e.target.value;
      localStorage.setItem("bgStyle", state.bgStyle);
      applyPreferences();
      // Re-apply weather bg if switching back to dynamic
      if (state.bgStyle === "dynamic" && state.currentLat !== null) {
        fetchCurrentWeather(state.currentLat, state.currentLon)
          .then((data) => updateBackground(data))
          .catch(() => { });
      }
    });

    // Animation toggle
    dom.toggleAnimations.addEventListener("change", (e) => {
      state.animations = e.target.checked;
      localStorage.setItem("animations", state.animations ? "on" : "off");
      applyPreferences();
      if (!state.animations) {
        dom.weatherBgEffects.innerHTML = "";
      } else if (state.currentLat !== null) {
        fetchCurrentWeather(state.currentLat, state.currentLon)
          .then((data) => updateBackground(data))
          .catch(() => { });
      }
    });

    // Favourite button
    dom.btnFavourite.addEventListener("click", toggleFavourite);

    // Share button
    dom.btnShare.addEventListener("click", shareWeather);

    // Favourites list (delegated)
    dom.favouritesList.addEventListener("click", (e) => {
      const remove = e.target.closest(".fav-chip__remove");
      if (remove) {
        const name = remove.dataset.name;
        state.favourites = state.favourites.filter((f) => f.name !== name);
        localStorage.setItem("favourites", JSON.stringify(state.favourites));
        renderFavourites();
        updateFavButton();
        return;
      }
      const chip = e.target.closest(".fav-chip");
      if (chip) {
        loadWeather(
          parseFloat(chip.dataset.lat),
          parseFloat(chip.dataset.lon),
          chip.dataset.name,
        );
      }
    });
  }

  /* ──────────────────────────────────────────────────────────────────
       SERVICE WORKER REGISTRATION
       ────────────────────────────────────────────────────────────────── */
  function registerSW() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("SW registration failed:", err);
      });
    }
  }

  /* ──────────────────────────────────────────────────────────────────
       INIT
       ────────────────────────────────────────────────────────────────── */
  function init() {
    applyPreferences();
    renderFavourites();
    bindEvents();
    registerSW();
    getUserLocation();
  }

  // Wait for DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
