"use client";

import { useEffect, useState } from "react";

export type MosaicTile = {
  id: string;
  level: number;
  tileX: number;
  tileY: number;
  west: number;
  east: number;
  south: number;
  north: number;
  imageUrl: string;
  markCount: number;
  version: number;
};

type MosaicTilesResponse = {
  level: number;
  tiles: MosaicTile[];
  limit: number;
};

export function useMosaicTiles(
  level: number,
  enabled = true
) {
  const [tiles, setTiles] = useState<
    MosaicTile[]
  >([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!enabled) {
      setTiles([]);
      setLoading(false);
      setError(null);
      return;
    }

    const controller =
      new AbortController();

    async function loadTiles() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/mosaic-tiles?level=${level}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            `Mosaic tiles request failed: ${response.status}`
          );
        }

        const data =
          (await response.json()) as MosaicTilesResponse;

        if (!controller.signal.aborted) {
          setTiles(data.tiles ?? []);
        }
      } catch (requestError) {
        if (controller.signal.aborted) {
          return;
        }

        console.error(
          "Failed to load mosaic tiles:",
          requestError
        );

        setTiles([]);
        setError(
          "Failed to load mosaic tiles"
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadTiles();

    return () => {
      controller.abort();
    };
  }, [level, enabled]);

  return {
    tiles,
    loading,
    error,
  };
}