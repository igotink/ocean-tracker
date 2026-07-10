function IconBase({ children, size = 20, className = "", ...props }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width={size}
      {...props}
    >
      {children}
    </svg>
  );
}

export function Activity(props) {
  return (
    <IconBase {...props}>
      <path d="M3 12h4l3-8 4 16 3-8h4" />
    </IconBase>
  );
}

export function CalendarDays(props) {
  return (
    <IconBase {...props}>
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
    </IconBase>
  );
}

export function MapPin(props) {
  return (
    <IconBase {...props}>
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </IconBase>
  );
}

export function Moon(props) {
  return (
    <IconBase {...props}>
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5Z" />
    </IconBase>
  );
}

export function Sunrise(props) {
  return (
    <IconBase {...props}>
      <path d="M12 2v8" />
      <path d="m4.93 10.93 1.41 1.41" />
      <path d="M2 18h20" />
      <path d="M18.36 12.34 19.77 11" />
      <path d="M8 18a4 4 0 0 1 8 0" />
      <path d="m12 10 3-3" />
      <path d="m12 10-3-3" />
    </IconBase>
  );
}

export function Sunset(props) {
  return (
    <IconBase {...props}>
      <path d="M12 10V2" />
      <path d="m4.93 10.93 1.41 1.41" />
      <path d="M2 18h20" />
      <path d="M18.36 12.34 19.77 11" />
      <path d="M8 18a4 4 0 0 1 8 0" />
      <path d="m12 2 3 3" />
      <path d="m12 2-3 3" />
    </IconBase>
  );
}

export function Thermometer(props) {
  return (
    <IconBase {...props}>
      <path d="M14 14.76V5a2 2 0 1 0-4 0v9.76a4 4 0 1 0 4 0Z" />
    </IconBase>
  );
}

export function Waves(props) {
  return (
    <IconBase {...props}>
      <path d="M2 6c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2" />
      <path d="M2 12c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2" />
      <path d="M2 18c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2" />
    </IconBase>
  );
}

export function Wind(props) {
  return (
    <IconBase {...props}>
      <path d="M3 8h12a3 3 0 1 0-3-3" />
      <path d="M3 12h16a2 2 0 1 1-2 2" />
      <path d="M3 16h10a2 2 0 1 1-2 2" />
    </IconBase>
  );
}
