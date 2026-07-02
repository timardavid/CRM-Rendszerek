const FORMULA_TRIGGER_CHARS = ["=", "+", "-", "@", "\t", "\r"];

function escapeCsvCell(value: unknown): string {
  let str = value === null || value === undefined ? "" : String(value);

  // Neutralize CSV/formula injection: Excel/Sheets execute cells starting with
  // these characters as formulas when the file is opened, so prefix with a
  // single quote to force plain-text interpretation.
  if (FORMULA_TRIGGER_CHARS.some((char) => str.startsWith(char))) {
    str = `'${str}`;
  }

  if (/[",\n;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildCsv(headers: string[], rows: (string | number | null | undefined)[][]) {
  const lines = [headers.map(escapeCsvCell).join(","), ...rows.map((row) => row.map(escapeCsvCell).join(","))];
  return "﻿" + lines.join("\r\n");
}
