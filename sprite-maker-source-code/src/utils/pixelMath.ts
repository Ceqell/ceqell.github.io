export interface Point {
  x: number;
  y: number;
}

// Bresenham's line algorithm
export function getLinePoints(x0: number, y0: number, x1: number, y1: number): Point[] {
  const points: Point[] = [];
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  let currX = x0;
  let currY = y0;

  while (true) {
    points.push({ x: currX, y: currY });
    if (currX === x1 && currY === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      currX += sx;
    }
    if (e2 < dx) {
      err += dx;
      currY += sy;
    }
  }

  return points;
}

// Rectangle points (stroke)
export function getRectanglePoints(x0: number, y0: number, x1: number, y1: number, fill = false): Point[] {
  const minX = Math.min(x0, x1);
  const maxX = Math.max(x0, x1);
  const minY = Math.min(y0, y1);
  const maxY = Math.max(y0, y1);
  const points: Point[] = [];

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (fill || x === minX || x === maxX || y === minY || y === maxY) {
        points.push({ x, y });
      }
    }
  }
  return points;
}

// Circle points (stroke or fill) using midpoint circle algorithm
export function getCirclePoints(x0: number, y0: number, x1: number, y1: number, fill = false): Point[] {
  const minX = Math.min(x0, x1);
  const maxX = Math.max(x0, x1);
  const minY = Math.min(y0, y1);
  const maxY = Math.max(y0, y1);

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const rx = Math.max(0.5, (maxX - minX) / 2);
  const ry = Math.max(0.5, (maxY - minY) / 2);

  const points: Point[] = [];

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const dx = (x + 0.5 - cx) / rx;
      const dy = (y + 0.5 - cy) / ry;
      const distSq = dx * dx + dy * dy;

      if (fill) {
        if (distSq <= 1.0) {
          points.push({ x, y });
        }
      } else {
        // Outline thickness check
        if (distSq <= 1.15 && distSq >= 0.65) {
          points.push({ x, y });
        }
      }
    }
  }
  return points;
}

// Flood Fill BFS algorithm
export function floodFill(
  pixels: string[],
  width: number,
  height: number,
  startX: number,
  startY: number,
  fillColor: string
): string[] {
  if (startX < 0 || startX >= width || startY < 0 || startY >= height) return pixels;

  const targetColor = pixels[startY * width + startX] || '';
  if (targetColor.toLowerCase() === fillColor.toLowerCase()) {
    return pixels;
  }

  const result = [...pixels];
  const queue: Point[] = [{ x: startX, y: startY }];
  const visited = new Uint8Array(width * height);
  visited[startY * width + startX] = 1;

  while (queue.length > 0) {
    const { x, y } = queue.shift()!;
    const idx = y * width + x;
    result[idx] = fillColor;

    const neighbors = [
      { x: x + 1, y },
      { x: x - 1, y },
      { x, y: y + 1 },
      { x, y: y - 1 },
    ];

    for (const n of neighbors) {
      if (n.x >= 0 && n.x < width && n.y >= 0 && n.y < height) {
        const nIdx = n.y * width + n.x;
        if (!visited[nIdx]) {
          visited[nIdx] = 1;
          const colorAtN = result[nIdx] || '';
          if (colorAtN.toLowerCase() === targetColor.toLowerCase()) {
            queue.push(n);
          }
        }
      }
    }
  }

  return result;
}

// Adjust brightness of a hex color (e.g. for Lighten / Darken tools)
export function adjustBrightness(hex: string, amount: number): string {
  if (!hex || hex === '') return hex;
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  if (cleanHex.length === 8) {
    cleanHex = cleanHex.substring(0, 6);
  }

  const num = parseInt(cleanHex, 16);
  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0x00ff) + amount;
  let b = (num & 0x0000ff) + amount;

  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

// Flip rectangle of pixels horizontally
export function flipPixelsHorizontal(pixels: string[], w: number, h: number): string[] {
  const result = new Array(w * h).fill('');
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const srcIdx = y * w + x;
      const destX = w - 1 - x;
      const destIdx = y * w + destX;
      result[destIdx] = pixels[srcIdx];
    }
  }
  return result;
}

// Flip rectangle of pixels vertically
export function flipPixelsVertical(pixels: string[], w: number, h: number): string[] {
  const result = new Array(w * h).fill('');
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const srcIdx = y * w + x;
      const destY = h - 1 - y;
      const destIdx = destY * w + x;
      result[destIdx] = pixels[srcIdx];
    }
  }
  return result;
}

// Compute all integer grid pixels enclosed by a freehand lasso polygon
export function getPolygonEnclosedPixels(points: Point[]): Point[] {
  if (points.length === 0) return [];
  if (points.length === 1) return [points[0]];
  if (points.length === 2) return getLinePoints(points[0].x, points[0].y, points[1].x, points[1].y);

  const perimeterSet = new Set<string>();
  const perimeterList: Point[] = [];

  const addPoint = (x: number, y: number) => {
    const key = `${x},${y}`;
    if (!perimeterSet.has(key)) {
      perimeterSet.add(key);
      perimeterList.push({ x, y });
    }
  };

  // 1. Trace all perimeter points with Bresenham lines between vertices
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    const line = getLinePoints(p1.x, p1.y, p2.x, p2.y);
    for (const pt of line) {
      addPoint(pt.x, pt.y);
    }
  }

  // 2. Compute bounding box
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of perimeterList) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  const result: Point[] = [...perimeterList];
  const resultSet = new Set<string>(perimeterSet);

  // 3. Ray casting algorithm to detect interior pixels
  const isInside = (px: number, py: number) => {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const xi = points[i].x, yi = points[i].y;
      const xj = points[j].x, yj = points[j].y;
      const intersect = ((yi > py) !== (yj > py)) &&
        (px < ((xj - xi) * (py - yi)) / (yj - yi + 0.0000001) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const key = `${x},${y}`;
      if (!resultSet.has(key) && isInside(x + 0.5, y + 0.5)) {
        resultSet.add(key);
        result.push({ x, y });
      }
    }
  }

  return result;
}

/**
 * Safely adapts a layer's pixels if its dimensions or array length do not match the target canvas dimensions.
 * Prevents stride-mismatch diagonal wrapping/skew bugs.
 */
export function normalizeLayerPixels(
  layer: { pixels: string[]; width?: number; height?: number },
  targetWidth: number,
  targetHeight: number,
  fallbackAnchor: 'center' | 'top-left' = 'center'
): string[] {
  const targetTotal = targetWidth * targetHeight;
  if (
    layer.pixels.length === targetTotal &&
    (!layer.width || layer.width === targetWidth) &&
    (!layer.height || layer.height === targetHeight)
  ) {
    return layer.pixels;
  }

  // Deduce source width and height
  let srcW = layer.width;
  let srcH = layer.height;

  if (!srcW || !srcH || srcW * srcH !== layer.pixels.length) {
    const len = layer.pixels.length;
    if (len === 21 * 28) {
      srcW = 21;
      srcH = 28;
    } else if (len === 25 * 32) {
      srcW = 25;
      srcH = 32;
    } else if (len === 32 * 32) {
      srcW = 32;
      srcH = 32;
    } else if (len === 36 * 36) {
      srcW = 36;
      srcH = 36;
    } else {
      const side = Math.round(Math.sqrt(len));
      if (side * side === len) {
        srcW = side;
        srcH = side;
      } else {
        const clean = new Array(targetTotal).fill('');
        for (let i = 0; i < Math.min(len, targetTotal); i++) {
          clean[i] = layer.pixels[i] || '';
        }
        return clean;
      }
    }
  }

  const result = new Array(targetTotal).fill('');
  const offsetX = fallbackAnchor === 'center' ? Math.floor((targetWidth - srcW) / 2) : 0;
  const offsetY = fallbackAnchor === 'center' ? Math.floor((targetHeight - srcH) / 2) : 0;

  for (let sy = 0; sy < srcH; sy++) {
    for (let sx = 0; sx < srcW; sx++) {
      const srcIdx = sy * srcW + sx;
      const color = layer.pixels[srcIdx];
      if (color) {
        const dx = sx + offsetX;
        const dy = sy + offsetY;
        if (dx >= 0 && dx < targetWidth && dy >= 0 && dy < targetHeight) {
          result[dy * targetWidth + dx] = color;
        }
      }
    }
  }

  return result;
}

