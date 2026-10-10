export type Pagination = { pages: number[][]; overflow: number[] };

/** Greedy packing of measured blocks into pages. Returns block indexes per page. */
export function paginate(heights: number[], breakBefore: boolean[], pageHeight: number): Pagination {
  const pages: number[][] = [[]];
  const overflow: number[] = [];
  let used = 0;

  heights.forEach((height, index) => {
    const current = pages[pages.length - 1];
    const needsNewPage = current.length > 0 && (breakBefore[index] || used + height > pageHeight);
    if (needsNewPage) {
      pages.push([]);
      used = 0;
    }
    pages[pages.length - 1].push(index);
    used += height;
    if (height > pageHeight) overflow.push(index);
  });

  return { pages, overflow };
}
