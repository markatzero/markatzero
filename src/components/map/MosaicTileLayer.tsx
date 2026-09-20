"use client";

import { useMapContext } from "react-simple-maps";

export type MosaicTile = {
  id: string;
  west: number;
  east: number;
  south: number;
  north: number;
  imageUrl: string;
};

type MosaicTileLayerProps = {
  tiles: MosaicTile[];
  opacity?: number;
};

export default function MosaicTileLayer({
  tiles,
  opacity = 1,
}: MosaicTileLayerProps) {
  const { projection } = useMapContext();

  return (
    <g
      data-map-layer="mosaic-tiles"
      pointerEvents="none"
    >
      {tiles.map((tile) => {
        const topLeft = projection([
          tile.west,
          tile.north,
        ]);

        const bottomRight = projection([
          tile.east,
          tile.south,
        ]);

        if (!topLeft || !bottomRight) {
          return null;
        }

        const x = Math.min(
          topLeft[0],
          bottomRight[0]
        );

        const y = Math.min(
          topLeft[1],
          bottomRight[1]
        );

        const width = Math.abs(
          bottomRight[0] - topLeft[0]
        );

        const height = Math.abs(
          bottomRight[1] - topLeft[1]
        );

        if (
          width <= 0 ||
          height <= 0
        ) {
          return null;
        }

        return (
          <image
            key={tile.id}
            href={tile.imageUrl}
            x={x}
            y={y}
            width={width}
            height={height}
            preserveAspectRatio="none"
            opacity={opacity}
          />
        );
      })}
    </g>
  );
}