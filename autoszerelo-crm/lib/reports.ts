const MONTH_SHORT = ["Jan", "Feb", "Már", "Ápr", "Máj", "Jún", "Júl", "Aug", "Szep", "Okt", "Nov", "Dec"];

export function lastNMonths(n: number) {
  const now = new Date();
  const months: { year: number; month: number; label: string }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth(), label: MONTH_SHORT[d.getMonth()] });
  }
  return months;
}

export function isInMonth(date: Date, year: number, month: number) {
  return date.getFullYear() === year && date.getMonth() === month;
}
