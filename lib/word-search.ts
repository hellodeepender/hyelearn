interface WordPlacement {
  word: string;
  row: number;
  col: number;
  direction: "horizontal" | "vertical";
}

interface WordSearchResult {
  grid: string[][];
  words: string[];
  placements: WordPlacement[];
}

// Simple seeded PRNG for deterministic puzzles
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

export function generateWordSearch(words: string[], seed: number, gridSize: number = 0): WordSearchResult {
  const cleanWords = words.map((w) => w.toUpperCase().replace(/[^A-Z]/g, "")).filter((w) => w.length > 0 && w.length <= 12);
  const size = gridSize || (cleanWords.length <= 3 ? 10 : 12);
  const rand = seededRandom(seed);

  // Initialize empty grid
  const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(""));
  const placements: WordPlacement[] = [];

  // Sort words longest first for better placement
  const sorted = [...cleanWords].sort((a, b) => b.length - a.length);

  for (const word of sorted) {
    let placed = false;

    for (let attempt = 0; attempt < 200; attempt++) {
      const dir: "horizontal" | "vertical" = rand() < 0.5 ? "horizontal" : "vertical";
      const maxRow = dir === "vertical" ? size - word.length : size - 1;
      const maxCol = dir === "horizontal" ? size - word.length : size - 1;

      if (maxRow < 0 || maxCol < 0) continue;

      const row = Math.floor(rand() * (maxRow + 1));
      const col = Math.floor(rand() * (maxCol + 1));

      // Check if word fits
      let fits = true;
      for (let i = 0; i < word.length; i++) {
        const r = dir === "vertical" ? row + i : row;
        const c = dir === "horizontal" ? col + i : col;
        const existing = grid[r][c];
        if (existing !== "" && existing !== word[i]) {
          fits = false;
          break;
        }
      }

      if (fits) {
        for (let i = 0; i < word.length; i++) {
          const r = dir === "vertical" ? row + i : row;
          const c = dir === "horizontal" ? col + i : col;
          grid[r][c] = word[i];
        }
        placements.push({ word, row, col, direction: dir });
        placed = true;
        break;
      }
    }

    if (!placed) {
      // Force place horizontally at a random row if possible
      for (let r = 0; r < size; r++) {
        if (word.length <= size) {
          const c = 0;
          let canPlace = true;
          for (let i = 0; i < word.length; i++) {
            const existing = grid[r][c + i];
            if (existing !== "" && existing !== word[i]) { canPlace = false; break; }
          }
          if (canPlace) {
            for (let i = 0; i < word.length; i++) grid[r][c + i] = word[i];
            placements.push({ word, row: r, col: c, direction: "horizontal" });
            break;
          }
        }
      }
    }
  }

  // Fill empty cells with random letters
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === "") {
        grid[r][c] = letters[Math.floor(rand() * 26)];
      }
    }
  }

  return { grid, words: placements.map((p) => p.word), placements };
}
