export interface MonthYear {
  monthIndex: number; // 0-based
  year: number;
}

/** Hard cap on how many months a single date-range query can span, so a
 * picker mistake can't trigger a huge request against a 40/hr API limit. */
export const MAX_RANGE_MONTHS = 12;

const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function formatMonthYear(monthIndex: number, year: number): string {
  return `${MONTH_LABELS[monthIndex]} ${year}`;
}

export function formatMonthYearShort(monthIndex: number, year: number): string {
  return `${MONTH_LABELS[monthIndex].slice(0, 3)} ${year}`;
}

/** Inclusive count of months between two month/year points (>= 1). */
export function monthsBetween(
  startMonthIndex: number,
  startYear: number,
  endMonthIndex: number,
  endYear: number
): number {
  return (endYear - startYear) * 12 + (endMonthIndex - startMonthIndex) + 1;
}

/** Lists every {monthIndex, year} pair from start to end, inclusive. */
export function enumerateMonths(
  startMonthIndex: number,
  startYear: number,
  endMonthIndex: number,
  endYear: number
): MonthYear[] {
  const months: MonthYear[] = [];
  let m = startMonthIndex;
  let y = startYear;
  let guard = 0; // safety valve against a malformed range looping forever
  while ((y < endYear || (y === endYear && m <= endMonthIndex)) && guard < 1000) {
    months.push({ monthIndex: m, year: y });
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
    guard += 1;
  }
  return months;
}
