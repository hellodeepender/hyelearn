/** Read a locale-specific field from an exercise object. Falls back to _hy for backwards compat. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lf(obj: any, field: string, locale: string): any {
  return obj[`${field}_${locale}`] ?? obj[`${field}_hy`] ?? "";
}
