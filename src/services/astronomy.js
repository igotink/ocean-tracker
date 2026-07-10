const LUNAR_CYCLE = 29.530588853;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);
const SUNRISE_SUNSET_URL = "https://api.sunrise-sunset.org/json";
const FARMSENSE_MOON_URL = "https://api.farmsense.net/v1/moonphases/";
const IPGEOLOCATION_ASTRONOMY_URL = "https://api.ipgeolocation.io/astronomy";

const PHASES = [
  "New moon",
  "Waxing crescent",
  "First quarter",
  "Waxing gibbous",
  "Full moon",
  "Waning gibbous",
  "Last quarter",
  "Waning crescent",
];

function minutesToTime(dateKey, minutes) {
  if (minutes === null || minutes === undefined || Number.isNaN(minutes)) {
    return null;
  }

  const normalized = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const hours = String(Math.floor(normalized / 60)).padStart(2, "0");
  const mins = String(normalized % 60).padStart(2, "0");
  return `${dateKey}T${hours}:${mins}:00+02:00`;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

function withLocalDate(dateKey, time) {
  if (!time) return null;
  if (time.includes("T")) return time;

  return `${dateKey}T${time.padStart(5, "0")}:00+02:00`;
}

function withoutEmptyValues(data) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== null && value !== undefined && value !== ""),
  );
}

function parseIllumination(value) {
  if (value === null || value === undefined || value === "") return undefined;
  const text = String(value).replace("%", "");
  const number = Number(text);
  if (Number.isNaN(number)) return undefined;

  return Math.round(number <= 1 ? number * 100 : number);
}

export function moonDetails(dateKey, sunrise, sunset) {
  const date = new Date(`${dateKey}T12:00:00+02:00`);
  const age =
    (((date.getTime() - KNOWN_NEW_MOON) / 86400000) % LUNAR_CYCLE) + LUNAR_CYCLE;
  const normalizedAge = age % LUNAR_CYCLE;
  const phaseIndex = Math.floor((normalizedAge / LUNAR_CYCLE) * 8 + 0.5) % 8;
  const illumination = Math.round(
    ((1 - Math.cos((2 * Math.PI * normalizedAge) / LUNAR_CYCLE)) / 2) * 100,
  );

  const sunriseDate = sunrise ? new Date(sunrise) : null;
  const sunsetDate = sunset ? new Date(sunset) : null;
  const sunriseMinutes =
    sunriseDate && !Number.isNaN(sunriseDate.getTime())
      ? sunriseDate.getHours() * 60 + sunriseDate.getMinutes()
      : 420;
  const sunsetMinutes =
    sunsetDate && !Number.isNaN(sunsetDate.getTime())
      ? sunsetDate.getHours() * 60 + sunsetDate.getMinutes()
      : 1080;

  const moonriseMinutes = sunriseMinutes + (normalizedAge / LUNAR_CYCLE) * 1440;
  const moonsetMinutes = sunsetMinutes + (normalizedAge / LUNAR_CYCLE) * 1440;

  return {
    moonPhase: PHASES[phaseIndex],
    moonIllumination: illumination,
    moonrise: minutesToTime(dateKey, moonriseMinutes),
    moonset: minutesToTime(dateKey, moonsetMinutes),
    moonTimingIsEstimated: true,
  };
}

async function fetchIpGeolocationAstronomy(location, dateKey) {
  const key = import.meta.env.VITE_IPGEOLOCATION_API_KEY;
  if (!key) return null;

  const url = new URL(IPGEOLOCATION_ASTRONOMY_URL);
  url.searchParams.set("apiKey", key);
  url.searchParams.set("lat", location.latitude);
  url.searchParams.set("long", location.longitude);
  url.searchParams.set("date", dateKey);

  const data = await fetchJson(url);

  return {
    ...withoutEmptyValues({
      sunrise: withLocalDate(dateKey, data.sunrise),
      sunset: withLocalDate(dateKey, data.sunset),
      moonrise: withLocalDate(dateKey, data.moonrise),
      moonset: withLocalDate(dateKey, data.moonset),
      moonPhase: data.moon_phase,
      moonIllumination: parseIllumination(data.moon_illumination),
    }),
    moonTimingIsEstimated: false,
  };
}

async function fetchSunriseSunset(location, dateKey) {
  const url = new URL(SUNRISE_SUNSET_URL);
  url.searchParams.set("lat", location.latitude);
  url.searchParams.set("lng", location.longitude);
  url.searchParams.set("date", dateKey);
  url.searchParams.set("formatted", "0");

  const data = await fetchJson(url);
  if (data.status !== "OK") {
    throw new Error(data.status || "Sunrise/sunset data unavailable");
  }

  return {
    sunrise: data.results?.sunrise,
    sunset: data.results?.sunset,
  };
}

async function fetchFarmSenseMoon(dateKey) {
  const noon = Math.floor(new Date(`${dateKey}T12:00:00+02:00`).getTime() / 1000);
  const url = new URL(FARMSENSE_MOON_URL);
  url.searchParams.set("d", noon);

  const data = await fetchJson(url);
  const moon = Array.isArray(data) ? data[0] : data;

  return {
    ...withoutEmptyValues({
      moonPhase: moon?.Phase,
      moonIllumination: parseIllumination(moon?.Illumination),
    }),
  };
}

export async function fetchAstronomy(location, dateKey, fallbackSunrise, fallbackSunset) {
  const warnings = [];
  const seeded = moonDetails(dateKey, fallbackSunrise, fallbackSunset);
  let astronomy = {
    ...seeded,
    sunrise: fallbackSunrise,
    sunset: fallbackSunset,
  };

  const provider = await Promise.allSettled([
    fetchIpGeolocationAstronomy(location, dateKey),
    fetchSunriseSunset(location, dateKey),
    fetchFarmSenseMoon(dateKey),
  ]);

  const [ipGeo, sun, moon] = provider;

  if (ipGeo.status === "fulfilled" && ipGeo.value) {
    astronomy = {
      ...astronomy,
      ...ipGeo.value,
    };
  } else if (ipGeo.status === "rejected") {
    warnings.push("moonrise/moonset");
  }

  if (sun.status === "fulfilled") {
    astronomy = {
      ...astronomy,
      ...sun.value,
    };
  } else {
    warnings.push("sunrise/sunset");
  }

  if (moon.status === "fulfilled") {
    astronomy = {
      ...astronomy,
      ...moon.value,
    };
  } else if (!astronomy.moonPhase) {
    warnings.push("moon phase");
  }

  if (!astronomy.moonrise || !astronomy.moonset) {
    const estimated = moonDetails(dateKey, astronomy.sunrise, astronomy.sunset);
    astronomy = {
      ...astronomy,
      moonrise: astronomy.moonrise || estimated.moonrise,
      moonset: astronomy.moonset || estimated.moonset,
      moonTimingIsEstimated: true,
    };
  }

  return {
    astronomy,
    warnings,
  };
}
