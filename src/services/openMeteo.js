const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";
const MARINE_URL = "https://marine-api.open-meteo.com/v1/marine";

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

function buildUrl(baseUrl, params) {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url.toString();
}

export async function fetchWeatherForecast(location, days = 16) {
  const url = buildUrl(WEATHER_URL, {
    latitude: location.latitude,
    longitude: location.longitude,
    timezone: location.timezone,
    forecast_days: days,
    current: "temperature_2m,wind_speed_10m,wind_direction_10m",
    daily:
      "temperature_2m_max,temperature_2m_min,temperature_2m_mean,sunrise,sunset,wind_speed_10m_max,wind_direction_10m_dominant",
    wind_speed_unit: "kmh",
  });

  return fetchJson(url);
}

export async function fetchMarineForecast(location, days = 8) {
  const url = buildUrl(MARINE_URL, {
    latitude: location.latitude,
    longitude: location.longitude,
    timezone: location.timezone,
    forecast_days: days,
    daily: "wave_height_max,wave_period_max,wave_direction_dominant,sea_surface_temperature_mean",
    current: "wave_height,wave_period,wave_direction,sea_surface_temperature",
  });

  return fetchJson(url);
}

export function mapDailyOpenMeteo(weather, marine) {
  const days = {};

  weather?.daily?.time?.forEach((dateKey, index) => {
    days[dateKey] = {
      ...(days[dateKey] || {}),
      airTemperature: weather.daily.temperature_2m_mean?.[index],
      airTemperatureMin: weather.daily.temperature_2m_min?.[index],
      airTemperatureMax: weather.daily.temperature_2m_max?.[index],
      sunrise: weather.daily.sunrise?.[index],
      sunset: weather.daily.sunset?.[index],
      windSpeed: weather.daily.wind_speed_10m_max?.[index],
      windDirection: weather.daily.wind_direction_10m_dominant?.[index],
    };
  });

  marine?.daily?.time?.forEach((dateKey, index) => {
    days[dateKey] = {
      ...(days[dateKey] || {}),
      waveHeight: marine.daily.wave_height_max?.[index],
      wavePeriod: marine.daily.wave_period_max?.[index],
      waveDirection: marine.daily.wave_direction_dominant?.[index],
      waterTemperature: marine.daily.sea_surface_temperature_mean?.[index],
    };
  });

  return days;
}
