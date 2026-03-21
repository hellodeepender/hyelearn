"use client";

import { useState } from "react";
import type { SundayLessonPDFData } from "@/lib/generate-sunday-school-pdf";

export default function DownloadPDFButton({ data }: { data: SundayLessonPDFData }) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const { generateSundaySchoolPDF } = await import("@/lib/generate-sunday-school-pdf");
      const doc = generateSundaySchoolPDF(data);
      doc.save(`sunday-school-week-${data.lessonNumber}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-2 text-sm text-brown-500 hover:text-brown-700 border border-brown-200 hover:border-brown-300 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {loading ? "Generating..." : "Worksheet PDF"}
    </button>
  );
}
