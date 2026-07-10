const WORLDTIDES_URL = "https://www.worldtides.info/api/v3";

function emptyTideResult(reason = "data unavailable") {
  return {
    tides: {},
    attribution: "",
    error: reason,
  };
}

function ensureDay(tides, dateKey) {
  tides[dateKey] = tides[dateKey] || {
    high: [],
    low: [],
    heights: [],
    currentHeight: null,
    nextHigh: null,
    nextLow: null,
    tideStatus: null,
  };

  return tides[dateKey];
}

function toDateKey(value) {
  return value?.slice(0, 10);
}

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function heightSummaryForDay(heights, dateKey) {
  const now = new Date();
  const reference = dateKey === localDateKey(now) ? now : new Date(`${dateKey}T12:00:00`);
  const dayHeights = heights
    .filter((item) => toDateKey(item.date) === dateKey)
    .map((item) => ({
      time: item.date,
      height: item.height,
    }))
    .sort((a, b) => new Date(a.time) - new Date(b.time));

  if (!dayHeights.length) return { dayHeights, currentHeight: null, tideStatus: null };

  const currentHeight = dayHeights.reduce((closest, item) => {
    const itemDistance = Math.abs(new Date(item.time).getTime() - reference.getTime());
    const closestDistance = Math.abs(new Date(closest.time).getTime() - reference.getTime());
    return itemDistance < closestDistance ? item : closest;
  }, dayHeights[0]);

  const before = [...dayHeights].reverse().find((item) => new Date(item.time) <= reference);
  const after = dayHeights.find((item) => new Date(item.time) >= reference);
  let tideStatus = null;

  if (before && after && before.time !== after.time) {
    const difference = Number(after.height) - Number(before.height);
    tideStatus = Math.abs(difference) < 0.02 ? "steady" : difference > 0 ? "rising" : "falling";
  }

  return { dayHeights, currentHeight, tideStatus };
}

function nextTideForDay(extremes, dateKey, type) {
  const now = new Date();
  const selectedDayStart = new Date(`${dateKey}T00:00:00`);
  const threshold = dateKey === localDateKey(now) ? now : selectedDayStart;

  return (
    extremes
      .filter((item) => item.date && item.type?.toLowerCase() === type && new Date(item.date) >= threshold)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((item) => ({
        type: item.type,
        time: item.date,
        height: item.height,
      }))[0] || null
  );
}

export async function fetchTides(location, startDate, days = 7) {
  const key = import.meta.env.VITE_WORLDTIDES_API_KEY;
  if (!key) {
    return emptyTideResult("Add VITE_WORLDTIDES_API_KEY in .env to load live tide data");
  }

  const url = new URL(WORLDTIDES_URL);
  url.searchParams.set("extremes", "");
  url.searchParams.set("heights", "");
  url.searchParams.set("localtime", "");
  url.searchParams.set("date", startDate);
  url.searchParams.set("days", days);
  url.searchParams.set("lat", location.latitude);
  url.searchParams.set("lon", location.longitude);
  url.searchParams.set("key", key);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Tide request failed: ${response.status}`);
    }

    const data = await response.json();
    if (data.status && data.status !== 200) {
      throw new Error(data.error || `WorldTides status ${data.status}`);
    }

    const tides = {};
    const extremes = data.extremes || [];
    const heights = data.heights || [];

    extremes.forEach((item) => {
      const dateKey = toDateKey(item.date);
      if (!dateKey) return;

      const day = ensureDay(tides, dateKey);
      const entry = {
        time: item.date,
        height: item.height,
      };

      if (item.type?.toLowerCase() === "high") {
        day.high.push(entry);
      } else if (item.type?.toLowerCase() === "low") {
        day.low.push(entry);
      }
    });

    for (let index = 0; index < days; index += 1) {
      const date = new Date(`${startDate}T12:00:00`);
      date.setDate(date.getDate() + index);
      const dateKey = localDateKey(date);
      const day = ensureDay(tides, dateKey);
      const { dayHeights, currentHeight, tideStatus } = heightSummaryForDay(heights, dateKey);
      day.heights = dayHeights;
      day.currentHeight = currentHeight;
      day.tideStatus = tideStatus;
      day.nextHigh = nextTideForDay(extremes, dateKey, "high");
      day.nextLow = nextTideForDay(extremes, dateKey, "low");
    }

    return {
      tides,
      attribution: data.copyright || "",
      error: "",
    };
  } catch (error) {
    return emptyTideResult(error.message);
  }
}
