import { localId } from './localId';

export function number(value) {
  return Number(String(value ?? '').replace(',', '.'));
}

export function measureSurface(surface) {
  const length = number(surface.length);
  const width = number(surface.width);
  const height = number(surface.height);
  const openings = number(surface.openings);
  const room = surface.mode === 'room';
  const valid = length > 0 && (room ? width > 0 && height > 0 : height > 0) && openings >= 0
    && [length, width, height, openings].every(Number.isFinite);
  if (!valid) return { valid: false, area: 0, volume: 0 };
  const walls = room ? 2 * (length + width) * height : length * height;
  const gross = walls + (room && surface.ceiling ? length * width : 0);
  if (openings > walls) return { valid: false, area: 0, volume: 0 };
  return { valid: true, area: gross - openings, volume: room ? length * width * height : 0 };
}

export function calculatePainting(surfaces, settings) {
  const measurements = surfaces.map(measureSurface);
  const area = measurements.reduce((sum, item) => sum + item.area, 0);
  const yieldPerLiter = number(settings.yield);
  const coats = number(settings.coats);
  const waste = number(settings.waste);
  const valid = surfaces.length > 0 && area > 0 && measurements.every((item) => item.valid)
    && yieldPerLiter > 0 && Number.isInteger(coats) && coats > 0 && waste >= 0 && waste <= 100
    && [yieldPerLiter, coats, waste].every(Number.isFinite);
  // Finished-area yield already includes the manufacturer's recommended coats.
  const liters = valid ? area * (settings.yieldMode === 'finished' ? 1 : coats) / yieldPerLiter * (1 + waste / 100) : null;
  return { valid, area, liters, volume: measurements.reduce((sum, item) => sum + item.volume, 0) };
}

export function newSurface() {
  return { id: localId(), name: '', mode: 'wall', length: '', width: '', height: '', openings: '0', ceiling: false };
}
