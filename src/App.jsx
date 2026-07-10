import { useEffect, useMemo, useState } from "react";
import { DEFAULT_LOCATION } from "./config/locations";
import { useDailyLogs } from "./hooks/useDailyLogs";
import { fetchAstronomy, moonDetails } from "./services/astronomy";
import {
  fetchMarineForecast,
  fetchWeatherForecast,
  mapDailyOpenMeteo,
} from "./services/openMeteo";
import { fetchTides } from "./services/tides";
import { CalendarView } from "./components/CalendarView";
import { DayDashboard } from "./components/DayDashboard";
import { CalendarDays, MapPin, Waves } from "./components/Icons";
import { LocationPanel } from "./components/LocationPanel";
import { ShareSection } from "./components/ShareSection";
import { SUPPORTED_MONTHS, clampToSupportedDate, todayKey } from "./utils/date";

export default function App() {
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [selectedDate, setSelectedDate] = useState(clampToSupportedDate(todayKey()));
  const [activeMonth, setActiveMonth] = useState(selectedDate.slice(0, 7));
  const [view, setView] = useState("today");
  const [dailyData, setDailyData] = useState({});
  const [astronomyData, setAstronomyData] = useState({});
  const [tideData, setTideData] = useState({});
  const [tideAttribution, setTideAttribution] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [tideSetupMessage, setTideSetupMessage] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const { logs, getLog, updateLog } = useDailyLogs();

  useEffect(() => {
    let isMounted = true;

    async function loadForecasts() {
      setLoading(true);
      setStatus("");
      setTideSetupMessage("");

      try {
        const [weather, marine, tides] = await Promise.allSettled([
          fetchWeatherForecast(location),
          fetchMarineForecast(location),
          fetchTides(location, selectedDate, 7),
        ]);

        if (!isMounted) return;

        const mapped = mapDailyOpenMeteo(
          weather.status === "fulfilled" ? weather.value : null,
          marine.status === "fulfilled" ? marine.value : null,
        );

        const baseForSelectedDate = mapped[selectedDate] || {};
        const astronomyResult = await Promise.allSettled([
          fetchAstronomy(location, selectedDate, baseForSelectedDate.sunrise, baseForSelectedDate.sunset),
        ]);
        const astronomy =
          astronomyResult[0].status === "fulfilled"
            ? astronomyResult[0].value
            : { astronomy: {}, warnings: ["astronomy"] };

        if (!isMounted) return;

        setDailyData(mapped);
        setAstronomyData((current) => ({
          ...current,
          [selectedDate]: astronomy.astronomy,
        }));
        setTideData(tides.status === "fulfilled" ? tides.value.tides : {});
        setTideAttribution(tides.status === "fulfilled" ? tides.value.attribution : "");
        setTideSetupMessage(
          tides.status === "fulfilled" && tides.value?.error?.includes("VITE_WORLDTIDES_API_KEY")
            ? tides.value.error
            : "",
        );
        setLastUpdated(new Date().toISOString());

        const warnings = [];
        if (weather.status === "rejected") warnings.push("weather");
        if (marine.status === "rejected") warnings.push("marine");
        if (tides.status === "rejected") warnings.push("tides");
        if (tides.status === "fulfilled" && tides.value?.error) warnings.push(`tides: ${tides.value.error}`);
        warnings.push(...astronomy.warnings);
        setStatus(warnings.length ? `${warnings.join(", ")} data unavailable` : "");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadForecasts();

    return () => {
      isMounted = false;
    };
  }, [location, selectedDate]);

  const selectedConditions = useMemo(() => {
    const base = dailyData[selectedDate] || {};
    return {
      ...base,
      ...moonDetails(selectedDate, base.sunrise, base.sunset),
      ...(astronomyData[selectedDate] || {}),
      tides: tideData[selectedDate] || null,
    };
  }, [astronomyData, dailyData, selectedDate, tideData]);

  const liveLabel = useMemo(() => {
    if (!lastUpdated) return "";

    return new Intl.DateTimeFormat("en-ZA", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(lastUpdated));
  }, [lastUpdated]);

  function chooseDate(dateKey) {
    setSelectedDate(dateKey);
    setActiveMonth(dateKey.slice(0, 7));
    setView("today");
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">False Bay daily log</p>
          <h1>Ocean Tracker</h1>
          <p className="subhead">Muizenberg and St James conditions for cold dips, paddles, surf, and notes.</p>
        </div>
        <Waves aria-hidden="true" className="brand-icon" />
      </header>

      <section className="top-controls" aria-label="App controls">
        <div className="segmented-control">
          <button className={view === "today" ? "active" : ""} onClick={() => setView("today")}>
            <Waves size={18} />
            Today
          </button>
          <button className={view === "calendar" ? "active" : ""} onClick={() => setView("calendar")}>
            <CalendarDays size={18} />
            Monthly
          </button>
        </div>

        <div className="month-tabs" aria-label="Supported months">
          {SUPPORTED_MONTHS.map((month) => (
            <button
              key={month.value}
              className={activeMonth === month.value ? "active" : ""}
              onClick={() => {
                setActiveMonth(month.value);
                setView("calendar");
              }}
            >
              {month.label}
            </button>
          ))}
        </div>
      </section>

      <LocationPanel location={location} onLocationChange={setLocation} />

      {loading ? <div className="notice">Loading the latest available sea and sky data...</div> : null}
      {liveLabel ? <div className="notice">Live - Last updated {liveLabel}</div> : null}
      {tideSetupMessage ? (
        <div className="notice muted">
          <strong>Tide setup:</strong> Create a free WorldTides account at{" "}
          <a href="https://www.worldtides.info/register" target="_blank" rel="noreferrer">
            worldtides.info/register
          </a>
          , then add <code>VITE_WORLDTIDES_API_KEY</code> to <code>.env</code> and restart the app.
        </div>
      ) : null}
      {status ? <div className="notice muted">{status}</div> : null}

      {view === "today" ? (
        <DayDashboard
          dateKey={selectedDate}
          conditions={selectedConditions}
          log={getLog(selectedDate)}
          onLogChange={(updates) => updateLog(selectedDate, updates)}
        />
      ) : (
        <CalendarView
          activeMonth={activeMonth}
          dailyData={dailyData}
          logs={logs}
          selectedDate={selectedDate}
          onSelectDate={chooseDate}
        />
      )}

      <ShareSection />

      <footer className="app-footer">
        <MapPin size={16} />
        <span>
          Default coordinates: {DEFAULT_LOCATION.latitude}, {DEFAULT_LOCATION.longitude}. {tideAttribution}
        </span>
      </footer>
    </main>
  );
}
