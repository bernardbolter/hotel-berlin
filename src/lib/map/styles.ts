/**
 * Mapbox-maintained styles useful for a light hotel map.
 * Classic Light (light-v11) is what we use today; Standard is Mapbox's
 * current recommended basemap (configurable light presets + themes).
 *
 * Docs: https://docs.mapbox.com/map-styles/reference/
 */

export type MapStyleOption = {
  id: string
  label: string
  /** Style username/id, e.g. mapbox/light-v11 or mapbox/standard */
  styleId: string
  group: 'classic' | 'standard'
  description: string
  /** Applied after style load via map.setConfigProperty('basemap', …) */
  basemapConfig?: Record<string, string | boolean | number>
}

/** Soft Faded — brand tokens washed light; used by homepage map + style preview. */
export const STANDARD_SOFT_FADED_CONFIG: Record<string, string | boolean | number> = {
  lightPreset: 'day',
  theme: 'default',
  showPointOfInterestLabels: false,
  showTransitLabels: false,
  showRoadLabels: false,
  showLandmarkIcons: false,
  showLandmarkIconLabels: false,
  show3dLandmarks: false,
  colorLand: '#F8F9FA',
  colorWater: '#DCE8EC',
  colorGreenspace: '#D2DCD0',
  colorBuildings: '#E8EAEE',
  colorRoads: '#E0E3E7',
  colorMotorways: '#D8DCE1',
  colorTrunks: '#DCE0E4',
  colorPlaceLabels: '#8A96A2',
  colorRoadLabels: '#A3ADB6',
  colorCommercial: '#F0F2F4',
  colorIndustrial: '#EEF0F2',
  colorEducation: '#F2F7F8',
  colorMedical: '#F0F2F4',
}

export const LIGHT_MAP_STYLES: MapStyleOption[] = [
  {
    id: 'light-v11',
    label: 'Light v11',
    styleId: 'mapbox/light-v11',
    group: 'classic',
    description: 'Current site default — minimal pale basemap for overlays.',
  },
  {
    id: 'streets-v12',
    label: 'Streets v12',
    styleId: 'mapbox/streets-v12',
    group: 'classic',
    description: 'General-purpose street map with roads and place labels.',
  },
  {
    id: 'outdoors-v12',
    label: 'Outdoors v12',
    styleId: 'mapbox/outdoors-v12',
    group: 'classic',
    description: 'Terrain-focused — parks, contours, outdoor features.',
  },
  {
    id: 'navigation-day',
    label: 'Navigation Day',
    styleId: 'mapbox/navigation-day-v1',
    group: 'classic',
    description: 'High-contrast daytime navigation style.',
  },
  {
    id: 'standard-day',
    label: 'Standard · Day',
    styleId: 'mapbox/standard',
    group: 'standard',
    description: 'Mapbox’s current default basemap — day lighting.',
    basemapConfig: { lightPreset: 'day', theme: 'default' },
  },
  {
    id: 'standard-dawn',
    label: 'Standard · Dawn',
    styleId: 'mapbox/standard',
    group: 'standard',
    description: 'Standard with soft dawn lighting.',
    basemapConfig: { lightPreset: 'dawn', theme: 'default' },
  },
  {
    id: 'standard-faded',
    label: 'Standard · Faded',
    styleId: 'mapbox/standard',
    group: 'standard',
    description: 'Quieter palette — good for custom pins on top.',
    basemapConfig: { lightPreset: 'day', theme: 'faded' },
  },
  {
    id: 'standard-soft',
    label: 'Standard · Soft',
    styleId: 'mapbox/standard',
    group: 'standard',
    description:
      'Brand tokens (silver / teal / green / dim), muted — POI / transit / shields off.',
    basemapConfig: {
      lightPreset: 'day',
      // Avoid theme:"faded" — that LUT overrides / washes out color* tokens so Soft ≈ Faded.
      theme: 'default',
      showPointOfInterestLabels: false,
      showTransitLabels: false,
      showRoadLabels: false,
      showLandmarkIcons: false,
      showLandmarkIconLabels: false,
      show3dLandmarks: false,
      // Brand tokens, deliberately readable (still quiet, not neon).
      colorLand: '#F4F6F7', // site.bgSubtle
      colorWater: '#C5D9DF', // tealLight → teal wash
      colorGreenspace: '#B4C2AE', // brand.green #56674F washed
      colorBuildings: '#DEE1E7', // brand.silver
      colorRoads: '#D0D5DB', // site.rule, slightly softer
      colorMotorways: '#C4CAD2',
      colorTrunks: '#CDD2D8',
      colorPlaceLabels: '#6B7C8D', // site.dim
      colorRoadLabels: '#8A96A2',
      colorCommercial: '#E8EBEE',
      colorIndustrial: '#E5E8EC',
      colorEducation: '#EBF3F5', // site.tealLight
      colorMedical: '#E8EBEE',
    },
  },
  {
    id: 'standard-soft-faded',
    label: 'Standard · Soft Faded',
    styleId: 'mapbox/standard',
    group: 'standard',
    description: 'Same as Soft, tokens washed further toward white / silver.',
    basemapConfig: STANDARD_SOFT_FADED_CONFIG,
  },
  {
    id: 'standard-mono',
    label: 'Standard · Monochrome',
    styleId: 'mapbox/standard',
    group: 'standard',
    description: 'Near-greyscale Standard — closest modern cousin to Light.',
    basemapConfig: { lightPreset: 'day', theme: 'monochrome' },
  },
]

export const DEFAULT_PREVIEW_STYLE_ID = 'light-v11'

export function getMapStyleOption(id: string): MapStyleOption {
  return LIGHT_MAP_STYLES.find((s) => s.id === id) ?? LIGHT_MAP_STYLES[0]!
}
