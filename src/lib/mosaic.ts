import type { PaidMark } from "../types/mark";

export type MosaicCell = {
  id: string;
  longitude: number;
  latitude: number;
  count: number;
  representativeMark: PaidMark;
};

function getCellSize(zoom: number) {
  if (zoom < 3) {
    return 8;
  }

  if (zoom < 6) {
    return 4;
  }

  if (zoom < 9) {
    return 2;
  }

  return 1;
}

export function buildMosaicCells(
  marks: PaidMark[],
  zoom: number
): MosaicCell[] {
  const cellSize = getCellSize(zoom);

  const cells = new Map<
    string,
    {
      longitudeTotal: number;
      latitudeTotal: number;
      count: number;
      representativeMark: PaidMark;
    }
  >();

  for (const mark of marks) {
    if (
      typeof mark.longitude !== "number" ||
      typeof mark.latitude !== "number"
    ) {
      continue;
    }

    const x = Math.floor(
      (mark.longitude + 180) / cellSize
    );

    const y = Math.floor(
      (mark.latitude + 90) / cellSize
    );

    const id = `${x}:${y}`;

    const existing = cells.get(id);

    if (existing) {
      existing.longitudeTotal += mark.longitude;
      existing.latitudeTotal += mark.latitude;
      existing.count += 1;

      continue;
    }

    cells.set(id, {
      longitudeTotal: mark.longitude,
      latitudeTotal: mark.latitude,
      count: 1,
      representativeMark: mark,
    });
  }

  return Array.from(
    cells.entries(),
    ([id, cell]) => ({
      id,
      longitude:
        cell.longitudeTotal / cell.count,
      latitude:
        cell.latitudeTotal / cell.count,
      count: cell.count,
      representativeMark:
        cell.representativeMark,
    })
  );
}