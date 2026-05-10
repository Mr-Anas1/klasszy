export type ISODateString = `${number}-${number}-${number}`; // YYYY-MM-DD

export function getLocalISODate(d: Date = new Date()): ISODateString {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}` as ISODateString;
}

/**
 * Compare YYYY-MM-DD strings lexicographically.
 * Works only when both inputs are normalized to YYYY-MM-DD.
 */
export function compareISODate(a: string, b: string): -1 | 0 | 1 {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

export function isISODateBefore(a: string, b: string): boolean {
  return compareISODate(a, b) === -1;
}

export function isISODateAfter(a: string, b: string): boolean {
  return compareISODate(a, b) === 1;
}

export function isISODateOnOrBefore(a: string, b: string): boolean {
  return compareISODate(a, b) !== 1;
}

export function isISODateOnOrAfter(a: string, b: string): boolean {
  return compareISODate(a, b) !== -1;
}

export function isActiveBetween(today: string, fromDate: string, toDate: string): boolean {
  return isISODateOnOrAfter(today, fromDate) && isISODateOnOrBefore(today, toDate);
}

export function isExpiredAfter(today: string, toDate: string): boolean {
  return isISODateAfter(today, toDate);
}

