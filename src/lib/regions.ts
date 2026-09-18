// Region presets and shared FireLens domain values (browser-safe).
export interface Region {
  id: string;
  name: string;
  bbox: string; // "west,south,east,north"
  center: [number, number]; // [lat, lon]
  zoom: number;
}

export const REGIONS: Region[] = [
  { id: "bangladesh", name: "Bangladesh", bbox: "88.0,20.5,92.7,26.6", center: [23.7, 90.4], zoom: 7 },
  { id: "india", name: "India", bbox: "68.1,6.5,97.4,35.5", center: [21.0, 78.0], zoom: 5 },
  { id: "amazon", name: "Amazon Basin", bbox: "-75.0,-15.0,-50.0,5.0", center: [-5.0, -62.0], zoom: 5 },
  { id: "australia", name: "Australia", bbox: "113.0,-44.0,154.0,-10.0", center: [-25.0, 133.0], zoom: 4 },
  { id: "california", name: "California", bbox: "-124.5,32.5,-114.1,42.0", center: [37.5, -119.5], zoom: 6 },
];

export const DEFAULT_REGION: Region = REGIONS[0]!;

export function getRegion(id: string): Region {
  return REGIONS.find((r) => r.id === id) ?? DEFAULT_REGION;
}

export function parseBbox(bbox: string): { west: number; south: number; east: number; north: number } {
  const [west, south, east, north] = bbox.split(",").map(Number);
  return { west: west!, south: south!, east: east!, north: north! };
}

export const SENSOR_META = {
  MODIS: {
    label: "MODIS",
    color: "#c2410c", // deep ember
    description: "Aqua & Terra · 1 km pixels · twice daily per satellite",
  },
  VIIRS: {
    label: "VIIRS",
    color: "#1d4ed8", // steel blue
    description: "Suomi NPP & NOAA-20/21 · 375 m pixels · finer detail, different revisit times",
  },
} as const;

export type SensorId = keyof typeof SENSOR_META;

export const CONFIDENCE_TIERS = ["low", "nominal", "high"] as const;
export type ConfidenceTier = (typeof CONFIDENCE_TIERS)[number];
