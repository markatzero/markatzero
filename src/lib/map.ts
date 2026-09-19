type Position = [number, number];

type PolygonCoordinates = Position[][];
type MultiPolygonCoordinates = Position[][][];

export type CountryFeature = {
  type: "Feature";
  properties?: {
    name?: string;
    ADMIN?: string;
  };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: PolygonCoordinates | MultiPolygonCoordinates;
  };
};

export type CountryGeoJson = {
  type: "FeatureCollection";
  features: CountryFeature[];
};

export type MarkCoordinates = {
  longitude: number;
  latitude: number;
};

const normalizeCountryName = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");

const countryAliases: Record<string, string> = {
  unitedstates: "unitedstatesofamerica",
  russia: "russianfederation",
  southkorea: "korea",
  northkorea: "demrepkorea",
  democraticrepublicofthecongo: "demrepcongo",
  congnorepublicofthe: "congo",
  czechia: "czechrepublic",
  turkiye: "turkey",
};

function seeded(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function pointInRing(point: Position, ring: Position[]) {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];

    const intersects =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

function polygonAreaEstimate(ring: Position[]) {
  const xs = ring.map((point) => point[0]);
  const ys = ring.map((point) => point[1]);

  return (
    (Math.max(...xs) - Math.min(...xs)) *
    (Math.max(...ys) - Math.min(...ys))
  );
}

function findCountry(
  countryName: string,
  geoJson: CountryGeoJson
): CountryFeature | null {
  const normalized =
    countryAliases[normalizeCountryName(countryName)] ??
    normalizeCountryName(countryName);

  return (
    geoJson.features.find((feature) => {
      const featureName =
        feature.properties?.name ??
        feature.properties?.ADMIN ??
        "";

      const actual =
        countryAliases[normalizeCountryName(featureName)] ??
        normalizeCountryName(featureName);

      return (
        actual === normalized ||
        actual.includes(normalized) ||
        normalized.includes(actual)
      );
    }) ?? null
  );
}

export function getPermanentMarkCoordinates(
  countryName: string,
  markNumber: number,
  geoJson: CountryGeoJson
): MarkCoordinates | null {
  const country = findCountry(countryName, geoJson);

  if (!country) {
    return null;
  }

  const polygons: MultiPolygonCoordinates =
    country.geometry.type === "Polygon"
      ? [country.geometry.coordinates as PolygonCoordinates]
      : (country.geometry.coordinates as MultiPolygonCoordinates);

  if (polygons.length === 0) {
    return null;
  }

  const polygon = polygons.reduce((largest, current) => {
    const largestRing = largest[0];
    const currentRing = current[0];

    if (!largestRing) return current;
    if (!currentRing) return largest;

    return polygonAreaEstimate(currentRing) >
      polygonAreaEstimate(largestRing)
      ? current
      : largest;
  });

  const ring = polygon[0];

  if (!ring || ring.length === 0) {
    return null;
  }

  const xs = ring.map((point) => point[0]);
  const ys = ring.map((point) => point[1]);

  const minLongitude = Math.min(...xs);
  const maxLongitude = Math.max(...xs);
  const minLatitude = Math.min(...ys);
  const maxLatitude = Math.max(...ys);

  for (let attempt = 0; attempt < 500; attempt++) {
    const longitude =
      minLongitude +
      seeded(markNumber * 101 + attempt * 17) *
        (maxLongitude - minLongitude);

    const latitude =
      minLatitude +
      seeded(markNumber * 211 + attempt * 29) *
        (maxLatitude - minLatitude);

    const point: Position = [longitude, latitude];

    if (pointInRing(point, ring)) {
      return {
        longitude,
        latitude,
      };
    }
  }

  return null;
}