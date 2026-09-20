"use client";

import {
  useEffect,
  useState,
} from "react";

export type MosaicLevel =
  | "world"
  | "medium"
  | "detail";

export type MapMosaicCell = {
  cell_x: number;
  cell_y: number;
  longitude: number;
  latitude: number;
  mark_count: number;
  representative_mark_id: number;
  representative_image_url: string;
};

type MapMosaicState = {
  cells: MapMosaicCell[];
  loading: boolean;
  error: string;
};

export default function useMapMosaic(
  level: MosaicLevel,
  enabled: boolean
): MapMosaicState {
  const [cells, setCells] = useState<
    MapMosaicCell[]
  >([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!enabled) {
      setCells([]);
      setLoading(false);
      setError("");
      return;
    }

    const controller =
      new AbortController();

    async function loadMosaic() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/mosaic?level=${level}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ||
              "Could not load map mosaic."
          );
        }

        if (!controller.signal.aborted) {
          setCells(
            Array.isArray(result.cells)
              ? result.cells
              : []
          );
        }
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        if (!controller.signal.aborted) {
          setCells([]);

          setError(
            error instanceof Error
              ? error.message
              : "Could not load map mosaic."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadMosaic();

    return () => {
      controller.abort();
    };
  }, [level, enabled]);

  return {
    cells,
    loading,
    error,
  };
}