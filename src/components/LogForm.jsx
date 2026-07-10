const WATER_FEELS = ["colder", "normal", "warmer"];
const ENERGY_LEVELS = ["low", "steady", "bright"];
const MOODS = ["quiet", "calm", "restless", "happy"];

function ChoiceGroup({ label, value, options, onChange }) {
  return (
    <label className="field-group">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function LogForm({ log, onChange }) {
  return (
    <section className="log-card">
      <div className="section-heading compact">
        <p className="eyebrow">Personal log</p>
        <h2>Notes and dip record</h2>
      </div>

      <div className="check-row">
        {["swam", "surfed", "paddled"].map((field) => (
          <label key={field} className="check-pill">
            <input
              type="checkbox"
              checked={Boolean(log[field])}
              onChange={(event) => onChange({ [field]: event.target.checked })}
            />
            <span>{field[0].toUpperCase() + field.slice(1)}</span>
          </label>
        ))}
      </div>

      <div className="form-grid">
        <ChoiceGroup
          label="Water felt"
          value={log.waterFeel}
          options={WATER_FEELS}
          onChange={(value) => onChange({ waterFeel: value })}
        />
        <ChoiceGroup
          label="Energy"
          value={log.energy}
          options={ENERGY_LEVELS}
          onChange={(value) => onChange({ energy: value })}
        />
        <ChoiceGroup
          label="Mood"
          value={log.mood}
          options={MOODS}
          onChange={(value) => onChange({ mood: value })}
        />
      </div>

      <label className="notes-field">
        <span>Notes</span>
        <textarea
          value={log.notes}
          placeholder="Cold dip, paddle route, surf notes, how the water felt..."
          onChange={(event) => onChange({ notes: event.target.value })}
        />
      </label>
    </section>
  );
}
