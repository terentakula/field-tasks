export const CANDIDATE_CODE = "ALEX-123";

export interface PresetLocation {
  label: string;
  latitude: number;
  longitude: number;
}

export const PRESET_LOCATIONS: PresetLocation[] = [
  { label: "Independence Square", latitude: 53.895, longitude: 27.547 },
  { label: "Victory Square", latitude: 53.9086, longitude: 27.575 },
  { label: "National Library", latitude: 53.9314, longitude: 27.6464 },
  { label: "Railway Station", latitude: 53.891, longitude: 27.551 },
];
