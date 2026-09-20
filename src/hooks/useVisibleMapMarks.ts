"use client";

import {
  useEffect,
  useState,
} from "react";

import type { PaidMark } from "../types/mark";
import type { MapBounds } from "../lib/mapViewport";

type VisibleMapMarksState = {
  marks: PaidMark[];
  loading: boolean;
  error: string;
};

export default function useVisibleMapMarks(
  bounds: MapBounds | null,
  enabled: boolean
): VisibleMapMarksState {
  const [marks, setMarks] = useState<PaidMark[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enabled || !bounds) {
      setMarks([]);
      setLoading(false);
      setError("");
      return;
    }

    const activeBounds = bounds;
    const controller = new AbortController();

    async function loadMarks() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          west: String(activeBounds.west),
          east: String(activeBounds.east),
          south: String(activeBounds.south),
          north: String(activeBounds.north),
        });

        const response = await fetch(
          `/api/map?${params.toString()}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ||
              "Could not load visible map marks."
          );
        }

        if (!controller.signal.aborted) {
          setMarks(
            Array.isArray(result.marks)
              ? result.marks
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
          setMarks([]);
          setError(
            error instanceof Error
              ? error.message
              : "Could not load visible map marks."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadMarks();

    return () => {
      controller.abort();
    };
  }, [
    enabled,
    bounds?.west,
    bounds?.east,
    bounds?.south,
    bounds?.north,
  ]);

  return {
    marks,
    loading,
    error,
  };
}