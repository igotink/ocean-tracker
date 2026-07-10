import { conditionText } from "../utils/format";

export function ConditionCard({ icon: Icon, label, value, helper }) {
  return (
    <article className="condition-card">
      <div className="condition-icon">{Icon ? <Icon size={20} /> : null}</div>
      <div>
        <p>{label}</p>
        <strong>{conditionText(value)}</strong>
        {helper ? <small>{helper}</small> : null}
      </div>
    </article>
  );
}
