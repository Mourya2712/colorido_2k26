/**
 * Utility to format participant/team size count for display:
 * If min === max: "2 Members", "4 Members", "1 Member"
 * If min !== max: "2–5 Members", "4–15 Members"
 * Also normalizes existing string labels like "2–2 Members" -> "2 Members"
 */
export function formatParticipantCount(
  minOrLabel?: number | string | null,
  max?: number | null,
  defaultUnit: string = 'Members'
): string {
  if (!minOrLabel) return '';

  if (typeof minOrLabel === 'string') {
    const trimmed = minOrLabel.trim();
    // Match "X - Y Members", "X–Y Members", "X-Y Members", "X to Y Members"
    const match = trimmed.match(/^(\d+)\s*[-–—to\s]+\s*(\d+)\s*(Members?|Players?)?$/i);
    if (match) {
      const minVal = parseInt(match[1], 10);
      const maxVal = parseInt(match[2], 10);
      const rawUnit = match[3] || defaultUnit;
      const isPlayer = rawUnit.toLowerCase().startsWith('player');

      if (minVal === maxVal) {
        if (isPlayer) {
          return `${minVal} ${minVal === 1 ? 'Player' : 'Players'}`;
        }
        return `${minVal} ${minVal === 1 ? 'Member' : 'Members'}`;
      }

      if (isPlayer) {
        return `${minVal}–${maxVal} ${maxVal === 1 ? 'Player' : 'Players'}`;
      }
      return `${minVal}–${maxVal} Members`;
    }

    return trimmed;
  }

  const minVal = typeof minOrLabel === 'number' ? minOrLabel : undefined;
  const maxVal = typeof max === 'number' ? max : undefined;

  if (minVal !== undefined && maxVal !== undefined && minVal > 0 && maxVal > 0) {
    if (minVal === maxVal) {
      return `${minVal} ${minVal === 1 ? 'Member' : 'Members'}`;
    }
    return `${minVal}–${maxVal} Members`;
  }

  return '';
}
