export function numberValue(value, suffix = "", digits = 0) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "data unavailable";
  }

  return `${Number(value).toFixed(digits)}${suffix}`;
}

export function degreesToCompass(degrees) {
  if (degrees === null || degrees === undefined || Number.isNaN(Number(degrees))) {
    return "data unavailable";
  }

  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(Number(degrees) / 45) % directions.length;
  return `${directions[index]} ${Math.round(Number(degrees))}°`;
}

export function conditionText(value) {
  return value || "data unavailable";
}
