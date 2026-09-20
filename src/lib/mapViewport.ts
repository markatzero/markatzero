export type MapBounds = {
  west: number;
  east: number;
  south: number;
  north: number;
};

type MapViewportOptions = {
  center: [number, number];
  zoom: number;
};

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.min(max, Math.max(min, value));
}

export function getMapBounds({
  center,
  zoom,
}: MapViewportOptions): MapBounds {
  const safeZoom = Math.max(1, zoom);

  const longitudeSpan =
    Math.min(360, 360 / safeZoom);

  const latitudeSpan =
    Math.min(170, 170 / safeZoom);

  const halfLongitude =
    longitudeSpan / 2;

  const halfLatitude =
    latitudeSpan / 2;

  const west = clamp(
    center[0] - halfLongitude,
    -180,
    180
  );

  const east = clamp(
    center[0] + halfLongitude,
    -180,
    180
  );

  const south = clamp(
    center[1] - halfLatitude,
    -85,
    85
  );

  const north = clamp(
    center[1] + halfLatitude,
    -85,
    85
  );

  return {
    west,
    east,
    south,
    north,
  };
}