import {
  Activity,
  Moon,
  Sunrise,
  Sunset,
  Thermometer,
  Waves,
  Wind,
} from "./Icons";
import { ConditionCard } from "./ConditionCard";
import { LogForm } from "./LogForm";
import { degreesToCompass, numberValue } from "../utils/format";
import { formatDayLabel, formatTime } from "../utils/date";

function tideLine(tides, type) {
  const items = tides?.[type];
  if (!items?.length) return "data unavailable";

  return items
    .slice(0, 2)
    .map((item) => `${formatTime(item.time)} (${numberValue(item.height, " m", 2)})`)
    .join(", ");
}

function tideEventLine(tideEvent) {
  if (!tideEvent) return "data unavailable";

  return `${formatTime(tideEvent.time)} (${numberValue(tideEvent.height, " m", 2)})`;
}

export function DayDashboard({ dateKey, conditions, log, onLogChange }) {
  return (
    <section className="dashboard">
      <div className="section-heading">
        <p className="eyebrow">Selected day</p>
        <h2>{formatDayLabel(dateKey)}</h2>
      </div>

      <div className="condition-grid">
        <ConditionCard icon={Sunrise} label="Sunrise" value={formatTime(conditions.sunrise)} />
        <ConditionCard icon={Sunset} label="Sunset" value={formatTime(conditions.sunset)} />
        <ConditionCard
          icon={Moon}
          label="Moon"
          value={conditions.moonPhase}
          helper={`${conditions.moonIllumination ?? "data unavailable"}% illuminated`}
        />
        <ConditionCard
          icon={Moon}
          label="Moonrise / set"
          value={`${formatTime(conditions.moonrise)} / ${formatTime(conditions.moonset)}`}
          helper={conditions.moonTimingIsEstimated ? "estimated" : ""}
        />
        <ConditionCard icon={Waves} label="High tide" value={tideLine(conditions.tides, "high")} />
        <ConditionCard icon={Waves} label="Low tide" value={tideLine(conditions.tides, "low")} />
        <ConditionCard icon={Waves} label="Next high" value={tideEventLine(conditions.tides?.nextHigh)} />
        <ConditionCard icon={Waves} label="Next low" value={tideEventLine(conditions.tides?.nextLow)} />
        <ConditionCard
          icon={Waves}
          label="Tide height"
          value={
            conditions.tides?.currentHeight
              ? `${numberValue(conditions.tides.currentHeight.height, " m", 2)} at ${formatTime(
                  conditions.tides.currentHeight.time,
                )}`
              : "data unavailable"
          }
        />
        <ConditionCard icon={Waves} label="Tide status" value={conditions.tides?.tideStatus || "data unavailable"} />
        <ConditionCard
          icon={Thermometer}
          label="Water temperature"
          value={numberValue(conditions.waterTemperature, "°C", 1)}
        />
        <ConditionCard
          icon={Thermometer}
          label="Air temperature"
          value={numberValue(conditions.airTemperature, "°C", 1)}
          helper={
            conditions.airTemperatureMin || conditions.airTemperatureMax
              ? `${numberValue(conditions.airTemperatureMin, "°C", 0)} to ${numberValue(
                  conditions.airTemperatureMax,
                  "°C",
                  0,
                )}`
              : ""
          }
        />
        <ConditionCard
          icon={Wind}
          label="Wind"
          value={numberValue(conditions.windSpeed, " km/h", 0)}
          helper={degreesToCompass(conditions.windDirection)}
        />
        <ConditionCard
          icon={Activity}
          label="Wave"
          value={numberValue(conditions.waveHeight, " m", 1)}
          helper={`${numberValue(conditions.wavePeriod, " s", 0)} from ${degreesToCompass(
            conditions.waveDirection,
          )}`}
        />
      </div>

      <LogForm log={log} onChange={onLogChange} />
    </section>
  );
}
