export default function parseIntValue(str, valueKey) {
  const regexp = new RegExp(`\\s${valueKey}\\s(\\d+)`);
  const match = str.match(regexp);
  if (!match) {
    return null;
  }

  return Number(match[1]);
}
