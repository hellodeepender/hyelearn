import jsPDF from "jspdf";
import { generateWordSearch } from "./word-search";

interface VocabItem {
  word_native?: string;
  word_transliteration: string;
  word_english: string;
}

export interface SundayLessonPDFData {
  locale: "hy" | "el";
  lessonNumber: number;
  title: string;
  titleNative: string;
  unitTitle: string;
  vocabulary: VocabItem[];
  activityType: string;
}

function drawArmenianCross(doc: jsPDF, x: number, y: number, color: string) {
  doc.setDrawColor(color);
  doc.setLineWidth(2.5);
  // Vertical bar
  doc.line(x, y, x, y + 40);
  // Horizontal bar
  doc.line(x - 12, y + 12, x + 12, y + 12);
  // Small circles at endpoints
  doc.setLineWidth(1);
  doc.circle(x, y - 2, 2);
  doc.circle(x, y + 42, 2);
  doc.circle(x - 14, y + 12, 2);
  doc.circle(x + 14, y + 12, 2);
  // Inner circle
  doc.circle(x, y + 12, 4);
}

function drawGreekCross(doc: jsPDF, x: number, y: number, color: string) {
  doc.setDrawColor(color);
  doc.setLineWidth(2.5);
  // Vertical bar
  doc.line(x, y, x, y + 40);
  // Top crossbar
  doc.line(x - 8, y + 8, x + 8, y + 8);
  // Main crossbar
  doc.line(x - 14, y + 18, x + 14, y + 18);
  // Bottom crossbar (angled)
  doc.line(x - 10, y + 30, x + 10, y + 30);
}

export function generateSundaySchoolPDF(data: SundayLessonPDFData): jsPDF {
  const { locale, lessonNumber, title, titleNative, unitTitle, vocabulary, activityType } = data;
  const isHy = locale === "hy";
  const doc = new jsPDF("portrait", "pt", "letter");
  const pageW = 612;
  const margin = 40;
  const contentW = pageW - margin * 2;

  // Colors
  const headerBg = isHy ? "#F5F0E8" : "#E8F0F5";
  const crossColor = isHy ? "#8B7355" : "#4A6B8A";
  const brandName = isHy ? "HyeLearn" : "Mathaino";

  // ── HEADER ──
  // Background tint
  doc.setFillColor(headerBg);
  doc.rect(0, 0, pageW, 110, "F");

  // Cross icon
  if (isHy) {
    drawArmenianCross(doc, margin + 18, 20, crossColor);
  } else {
    drawGreekCross(doc, margin + 18, 20, crossColor);
  }

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor("#333333");
  doc.text(title, margin + 50, 45);

  // Unit + week
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor("#999999");
  doc.text(`${unitTitle} \u2022 Week ${lessonNumber}`, margin + 50, 62);

  // Decorative line
  doc.setDrawColor("#CCCCCC");
  doc.setLineWidth(0.5);
  doc.line(margin, 100, pageW - margin, 100);

  // ── WORD SEARCH ──
  let cursorY = 120;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor("#333333");
  doc.text("Find the Words!", margin, cursorY);
  cursorY += 20;

  // Generate word search from English vocabulary
  const englishWords = vocabulary.map((v) => v.word_english).filter((w) => w.length >= 2 && w.length <= 12);
  const gridSize = englishWords.length <= 3 ? 10 : 12;
  const ws = generateWordSearch(englishWords, lessonNumber * 1000 + (isHy ? 1 : 2), gridSize);

  // Draw grid
  const cellSize = Math.min(28, (contentW * 0.6) / gridSize);
  const gridW = cellSize * gridSize;
  const gridX = margin;
  const gridY = cursorY;

  doc.setDrawColor("#CCCCCC");
  doc.setLineWidth(0.5);

  for (let r = 0; r <= gridSize; r++) {
    doc.line(gridX, gridY + r * cellSize, gridX + gridW, gridY + r * cellSize);
  }
  for (let c = 0; c <= gridSize; c++) {
    doc.line(gridX + c * cellSize, gridY, gridX + c * cellSize, gridY + gridSize * cellSize);
  }

  // Fill grid letters
  doc.setFont("courier", "bold");
  doc.setFontSize(Math.min(16, cellSize * 0.55));
  doc.setTextColor("#333333");

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const letter = ws.grid[r][c];
      doc.text(letter, gridX + c * cellSize + cellSize / 2, gridY + r * cellSize + cellSize * 0.68, { align: "center" });
    }
  }

  // Word bank (to the right of grid or below)
  const bankX = gridX + gridW + 20;
  const bankFitsRight = bankX + 160 < pageW - margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor("#333333");

  if (bankFitsRight) {
    doc.text("Word Bank:", bankX, gridY + 10);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    vocabulary.forEach((word, i) => {
      const y = gridY + 28 + i * 18;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(crossColor);
      doc.text(word.word_transliteration, bankX, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor("#666666");
      doc.text(` = ${word.word_english.toUpperCase()}`, bankX + doc.getTextWidth(word.word_transliteration), y);
    });
  } else {
    // Below grid
    cursorY = gridY + gridSize * cellSize + 16;
    doc.text("Word Bank:", margin, cursorY);
    cursorY += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const cols = Math.min(3, vocabulary.length);
    const colW = contentW / cols;
    vocabulary.forEach((word, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = margin + col * colW;
      const y = cursorY + row * 16;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(crossColor);
      doc.text(word.word_transliteration, x, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor("#666666");
      doc.text(` = ${word.word_english.toUpperCase()}`, x + doc.getTextWidth(word.word_transliteration), y);
    });
    cursorY += Math.ceil(vocabulary.length / cols) * 16 + 10;
  }

  // ── ACTIVITY PROMPT ──
  const promptY = bankFitsRight
    ? gridY + gridSize * cellSize + 24
    : cursorY + 10;

  // Derive prompt from activity type
  let prompt = "Draw or write one thing you learned today.";
  if (activityType === "discussion") prompt = "Write or draw one thing you talked about today.";
  else if (activityType === "game") prompt = "Draw your favorite part of today\u2019s game.";
  else if (activityType === "craft") prompt = "Draw what you made today or want to make.";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor("#333333");
  doc.text(prompt, margin, promptY);

  // Draw box
  const boxY = promptY + 10;
  const boxH = Math.min(140, 792 - boxY - 50);
  doc.setDrawColor("#CCCCCC");
  doc.setLineWidth(1);
  doc.rect(margin, boxY, contentW, boxH);

  // ── FOOTER ──
  const footerY = 792 - 25;
  doc.setDrawColor("#CCCCCC");
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 10, pageW - margin, footerY - 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor("#999999");
  doc.text("diasporalearn.org", margin, footerY);
  doc.text(`Sunday School \u2022 Week ${lessonNumber}`, pageW / 2, footerY, { align: "center" });
  doc.text(brandName, pageW - margin, footerY, { align: "right" });

  return doc;
}
