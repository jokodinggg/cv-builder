const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/** e.g. "CV_Budi Santoso_OCT26.pdf" — same pattern as the CVs in CV-list/. */
export function pdfFileName(fullName: string, date: Date): string {
  const name = fullName.replace(/[/\\:*?"<>|\u0000-\u001f]/g, "").replace(/\s+/g, " ").trim().slice(0, 80);
  const stamp = `${MONTHS[date.getMonth()]}${String(date.getFullYear()).slice(-2)}`;
  return name ? `CV_${name}_${stamp}.pdf` : `CV_${stamp}.pdf`;
}
