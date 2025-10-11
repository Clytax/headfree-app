// utils/date/iso.ts
export const toISODate = (d: Date) => d.toISOString().slice(0, 10); // YYYY-MM-DD
export const isSameDay = (a: Date, b: Date) => toISODate(a) === toISODate(b);
export const addDays = (d: Date, days: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
};
