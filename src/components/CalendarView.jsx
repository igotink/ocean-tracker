import { Moon, Waves } from "./Icons";
import { getDaysForMonth, formatDayLabel, formatMonthTitle } from "../utils/date";
import { numberValue } from "../utils/format";
import { moonDetails } from "../services/astronomy";

export function CalendarView({ activeMonth, dailyData, logs, selectedDate, onSelectDate }) {
  const days = getDaysForMonth(activeMonth);

  return (
    <section className="calendar-view">
      <div className="section-heading">
        <p className="eyebrow">Monthly calendar</p>
        <h2>{formatMonthTitle(activeMonth)}</h2>
      </div>

      <div className="calendar-list">
        {days.map((dateKey) => {
          const conditions = dailyData[dateKey] || {};
          const moon = moonDetails(dateKey, conditions.sunrise, conditions.sunset);
          const log = logs[dateKey] || {};
          const hasLog = log.swam || log.surfed || log.paddled || log.notes;

          return (
            <button
              key={dateKey}
              className={`calendar-row ${selectedDate === dateKey ? "selected" : ""}`}
              onClick={() => onSelectDate(dateKey)}
            >
              <span className="date-block">
                <strong>{new Date(`${dateKey}T12:00:00`).getDate()}</strong>
                <small>{formatDayLabel(dateKey, { short: true }).split(" ")[0]}</small>
              </span>
              <span className="calendar-main">
                <span>{formatDayLabel(dateKey, { short: true })}</span>
                <small>
                  <Waves size={14} /> {numberValue(conditions.waterTemperature, "°C", 1)}
                  <Moon size={14} /> {moon.moonPhase}
                </small>
              </span>
              <span className={hasLog ? "log-dot active" : "log-dot"} aria-label={hasLog ? "Logged" : "No log"} />
            </button>
          );
        })}
      </div>
    </section>
  );
}
