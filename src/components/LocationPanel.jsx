import { MapPin } from "./Icons";

export function LocationPanel({ location, onLocationChange }) {
  function updateField(field, value) {
    onLocationChange({
      ...location,
      [field]: field === "latitude" || field === "longitude" ? Number(value) : value,
    });
  }

  return (
    <section className="location-panel" aria-label="Location settings">
      <div>
        <MapPin size={18} />
        <strong>{location.name}</strong>
      </div>
      <div className="location-grid">
        <label>
          Name
          <input value={location.name} onChange={(event) => updateField("name", event.target.value)} />
        </label>
        <label>
          Latitude
          <input
            type="number"
            step="0.0001"
            value={location.latitude}
            onChange={(event) => updateField("latitude", event.target.value)}
          />
        </label>
        <label>
          Longitude
          <input
            type="number"
            step="0.0001"
            value={location.longitude}
            onChange={(event) => updateField("longitude", event.target.value)}
          />
        </label>
      </div>
    </section>
  );
}
