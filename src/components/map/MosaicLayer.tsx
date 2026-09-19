"use client";

import { Marker } from "react-simple-maps";

import { buildMosaicCells } from "../../lib/mosaic";
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

  if (detailLevel === "marks") {
    return null;
  }

  const cells = buildMosaicCells(
    marks,
    zoom
  );

  return (
    <g
      data-map-layer={detailLevel}
      data-cell-count={cells.length}
    >
      {cells.map((cell) => {
        const size =
          detailLevel === "world"
            ? 4
            : Math.max(
                5,
                Math.min(
                  12,
                  5 + zoom * 0.7
                )
              );

        return (
          <Marker
            key={cell.id}
            coordinates={[
              cell.longitude,
              cell.latitude,
            ]}
          >
            <g pointerEvents="none">
              <rect
                x={-size / 2 - 0.5}
                y={-size / 2 - 0.5}
                width={size + 1}
                height={size + 1}
                rx={1}
                fill="#083344"
                stroke="rgba(103,232,249,.55)"
                strokeWidth={0.5 / zoom}
              />

              <image
                href={
                  cell.representativeMark
                    .image_url
                }
                x={-size / 2}
                y={-size / 2}
                width={size}
                height={size}
                preserveAspectRatio="xMidYMid slice"
                opacity={
                  detailLevel === "world"
                    ? 0.72
                    : 0.9
                }
              />

              {cell.count > 1 && (
                <circle
                  cx={size / 2}
                  cy={-size / 2}
                  r={2.2}
                  fill="#67e8f9"
                />
              )}
            </g>
          </Marker>
        );
      })}
    </g>
  );
}