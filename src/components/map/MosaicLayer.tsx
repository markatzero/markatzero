"use client";

import type { PaidMark } from "../../types/mark";

export type MapDetailLevel =
  | "world"
  | "mosaic"
  | "marks";

type MosaicLayerProps = {
  zoom: number;
  marks: PaidMark[];
};

export function getMapDetailLevel(
  zoom: number
): MapDetailLevel {
  if (zoom < 3) {
    return "world";
  }

  if (zoom < 12) {
    return "mosaic";
  }

  return "marks";
}

export default function MosaicLayer({
  zoom,
  marks,
}: MosaicLayerProps) {
  const detailLevel = getMapDetailLevel(zoom);

  /*
   * Phase C foundation:
   *
   * world:
   *   Lightweight global representation.
   *
   * mosaic:
   *   Precomputed / aggregated mosaic tiles.
   *
   * marks:
   *   Individual interactive Marks.
   *
   * We intentionally do not render millions of
   * SVG or DOM elements here.
   */

  if (detailLevel === "marks") {
    return null;
  }

  if (detailLevel === "mosaic") {
    return (
      <g
        data-map-layer="mosaic"
        data-mark-count={marks.length}
      />
    );
  }

  return (
    <g
      data-map-layer="world"
      data-mark-count={marks.length}
    />
  );
}