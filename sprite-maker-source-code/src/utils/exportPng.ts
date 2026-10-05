import { Layer, ExportSettings } from '../types/sprite';
import { getBodyLayout, isHeadPixel } from '../constants/retroDev';

export interface RenderOptions {
  width: number;
  height: number;
  layers: Layer[];
  settings: ExportSettings;
  bodyOffsetX?: number;
  bodyOffsetY?: number;
}

export function renderSpriteToCanvas(
  canvas: HTMLCanvasElement,
  options: RenderOptions
) {
  const { width, height, layers, settings, bodyOffsetX = 0, bodyOffsetY = 0 } = options;

  let targetWidth: number;
  let targetHeight: number;

  if (settings.useCustomSize) {
    targetWidth = Math.max(1, Math.round(settings.customWidth));
    targetHeight = Math.max(1, Math.round(settings.customHeight));
  } else {
    targetWidth = width * settings.scale;
    targetHeight = height * settings.scale;
  }

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  // Crucial for pixel art: disable smoothing for pristine crisp pixels
  ctx.imageSmoothingEnabled = false;

  // Background
  if (settings.backgroundType === 'solid') {
    ctx.fillStyle = settings.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  } else if (settings.backgroundType === 'checkerboard') {
    const checkSize = Math.max(8, Math.round(targetWidth / 32));
    for (let cy = 0; cy < targetHeight; cy += checkSize) {
      for (let cx = 0; cx < targetWidth; cx += checkSize) {
        const isDark = (Math.floor(cx / checkSize) + Math.floor(cy / checkSize)) % 2 === 0;
        ctx.fillStyle = isDark ? '#22222b' : '#1a1a22';
        ctx.fillRect(cx, cy, checkSize, checkSize);
      }
    }
  } else {
    // Transparent: clearRect
    ctx.clearRect(0, 0, targetWidth, targetHeight);
  }

  // Calculate pixel size and offsets if custom aspect ratio
  const scaleX = targetWidth / width;
  const scaleY = targetHeight / height;

  // Composite layers from bottom to top
  const layersToRender = settings.visibleLayersOnly 
    ? layers.filter(l => l.visible) 
    : layers;

  layersToRender.forEach(layer => {
    if (layer.opacity <= 0) return;
    ctx.globalAlpha = Math.max(0, Math.min(1, layer.opacity));

    const layerW = layer.width || (layer.pixels.length === width * height ? width : undefined);
    const layerH = layer.height || (layer.pixels.length === width * height ? height : undefined);

    if (layerW && layerH && (layerW !== width || layerH !== height)) {
      const ox = Math.floor((width - layerW) / 2);
      const oy = Math.floor((height - layerH) / 2);
      for (let ly = 0; ly < layerH; ly++) {
        for (let lx = 0; lx < layerW; lx++) {
          const color = layer.pixels[ly * layerW + lx];
          if (color && color !== '') {
            ctx.fillStyle = color;
            const dx = lx + ox;
            const dy = ly + oy;
            if (dx >= 0 && dx < width && dy >= 0 && dy < height) {
              const px = Math.floor(dx * scaleX);
              const py = Math.floor(dy * scaleY);
              const pw = Math.ceil((dx + 1) * scaleX) - px;
              const ph = Math.ceil((dy + 1) * scaleY) - py;
              ctx.fillRect(px, py, pw, ph);
            }
          }
        }
      }
    } else {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const color = layer.pixels[y * width + x];
          if (color && color !== '') {
            ctx.fillStyle = color;
            // Render pixel rect
            const px = Math.floor(x * scaleX);
            const py = Math.floor(y * scaleY);
            const pw = Math.ceil((x + 1) * scaleX) - px;
            const ph = Math.ceil((y + 1) * scaleY) - py;
            ctx.fillRect(px, py, pw, ph);
          }
        }
      }
    }
  });

  ctx.globalAlpha = 1.0;

  // Optional Retro Dev Guide & Numbers overlay
  if (settings.includeGuides || settings.includeNumbers) {
    const layout = getBodyLayout(width, height, bodyOffsetX, bodyOffsetY);
    ctx.save();

    if (settings.includeGuides) {
      ctx.lineWidth = Math.max(1, Math.floor(scaleX * 0.1));

      // Head outline
      ctx.strokeStyle = '#F5CD2F';
      for (let ly = 0; ly < layout.head.height; ly++) {
        for (let lx = 0; lx < layout.head.width; lx++) {
          if (isHeadPixel(lx, ly)) {
            const gx = layout.head.x + lx;
            const gy = layout.head.y + ly;
            ctx.strokeRect(gx * scaleX, gy * scaleY, scaleX, scaleY);
          }
        }
      }

      // Torso outline (cyan/blue)
      ctx.strokeStyle = '#00D4FF';
      ctx.strokeRect(
        layout.torso.x * scaleX,
        layout.torso.y * scaleY,
        layout.torso.width * scaleX,
        layout.torso.height * scaleY
      );

      // Left Arm outline (yellow)
      ctx.strokeStyle = '#FFE600';
      ctx.strokeRect(
        layout.leftArm.x * scaleX,
        layout.leftArm.y * scaleY,
        layout.leftArm.width * scaleX,
        layout.leftArm.height * scaleY
      );

      // Right Arm outline (yellow)
      ctx.strokeRect(
        layout.rightArm.x * scaleX,
        layout.rightArm.y * scaleY,
        layout.rightArm.width * scaleX,
        layout.rightArm.height * scaleY
      );

      // Legs outline (lime/green)
      ctx.strokeStyle = '#39FF14';
      ctx.strokeRect(
        layout.legs.x * scaleX,
        layout.legs.y * scaleY,
        layout.legs.width * scaleX,
        layout.legs.height * scaleY
      );

      // Legs seam line
      ctx.strokeStyle = '#FF0055';
      ctx.strokeRect(
        layout.legs.seamCol * scaleX,
        layout.legs.y * scaleY,
        scaleX,
        layout.legs.height * scaleY
      );
    }

    if (settings.includeNumbers && scaleX >= 8) {
      const fontSize = Math.max(7, Math.floor(scaleX * 0.45));
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Pink numbers on head (rows 1-8)
      ctx.fillStyle = '#FF66CC';
      for (let i = 1; i <= 8; i++) {
        const py = (layout.head.y + layout.head.height - i + 0.5) * scaleY;
        const px = (layout.head.x + 0.5) * scaleX;
        ctx.fillText(i.toString(), px, py);
      }

      // Cyan numbers on torso (rows 11-20)
      ctx.fillStyle = '#00F0FF';
      for (let i = 11; i <= 20; i++) {
        const rowFromTop = 20 - i;
        const py = (layout.torso.y + rowFromTop + 0.5) * scaleY;
        const px = (layout.torso.x + 0.5) * scaleX;
        ctx.fillText(i.toString(), px, py);
      }

      // Red numbers on legs (rows 1-10)
      ctx.fillStyle = '#FF3333';
      for (let i = 1; i <= 10; i++) {
        const rowFromBottom = i - 1;
        const py = (layout.legs.y + layout.legs.height - 1 - rowFromBottom + 0.5) * scaleY;
        const px = (layout.legs.x + 0.5) * scaleX;
        ctx.fillText(i.toString(), px, py);
      }
    }

    ctx.restore();
  }
}

export async function downloadPng(options: RenderOptions) {
  const canvas = document.createElement('canvas');
  renderSpriteToCanvas(canvas, options);

  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `${options.settings.filename || 'retro-dev-sprite'}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function copyPngToClipboard(options: RenderOptions): Promise<boolean> {
  try {
    const canvas = document.createElement('canvas');
    renderSpriteToCanvas(canvas, options);

    return new Promise<boolean>((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(false);
          return;
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob,
            }),
          ]);
          resolve(true);
        } catch {
          resolve(false);
        }
      }, 'image/png');
    });
  } catch {
    return false;
  }
}
