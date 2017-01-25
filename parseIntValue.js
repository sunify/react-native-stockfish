module.exports = function parseIntValue(str, valueKey) {
  const regexp = new RegExp(`\\s${valueKey}\\s(\-{0,1}\\d+)`);
  const match = str.match(regexp);
  if (!match) {
    return null;
  }

  return Number(match[1]);
}
