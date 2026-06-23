function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const str = String(value);

  if (str.includes('"') || str.includes(",") || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

export function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) {
    return "";
  }

  const headers = Object.keys(rows[0]!);
  const headerRow = headers.map(escapeCSVValue).join(",");
  const dataRows = rows.map((row) =>
    headers.map((header) => escapeCSVValue(row[header])).join(","),
  );

  return [headerRow, ...dataRows].join("\r\n");
}
