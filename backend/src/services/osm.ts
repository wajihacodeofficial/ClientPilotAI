import axios, { AxiosError } from 'axios';

const DEFAULT_NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const DEFAULT_OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const DEFAULT_USER_AGENT = 'ClientPilotAI/1.0 (configure OSM_USER_AGENT with contact email)';
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_RETRIES = 2;
const MAX_RADIUS_METERS = 50_000;

const NOMINATIM_URL = process.env.NOMINATIM_URL || DEFAULT_NOMINATIM_URL;
const OVERPASS_URL = process.env.OVERPASS_URL || DEFAULT_OVERPASS_URL;
const USER_AGENT = process.env.OSM_USER_AGENT || DEFAULT_USER_AGENT;
const REQUEST_TIMEOUT_MS = Number(process.env.OSM_REQUEST_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeocodeResult extends Coordinates {
  displayName: string;
  placeId?: number;
  osmType?: string;
  osmId?: number;
  boundingBox?: string[];
}

export interface NormalizedBusiness {
  osmId: string;
  osmType: 'node' | 'way' | 'relation';
  name: string;
  category: string;
  type: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  area?: string;
  phone?: string;
  website?: string;
  rawTags: Record<string, string>;
}

export interface NearbyBusinessSearchParams {
  lat: number;
  lng: number;
  radiusMeters?: number;
  categories?: string[];
  limit?: number;
}

export interface NearbyBusinessSearchResult {
  businesses: NormalizedBusiness[];
  center: Coordinates;
  radiusMeters: number;
  categories: string[];
}

type OsmElementType = 'node' | 'way' | 'relation';

type OverpassElement = {
  type: OsmElementType;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat?: number; lon?: number };
  tags?: Record<string, string>;
};

type NominatimPlace = {
  place_id?: number;
  osm_type?: string;
  osm_id?: number;
  lat?: string;
  lon?: string;
  display_name?: string;
  boundingbox?: string[];
};

type OSMTagFilter = { key: string; value?: string; regex?: string };

const CATEGORY_FILTERS: Record<string, OSMTagFilter[]> = {
  restaurant: [{ key: 'amenity', value: 'restaurant' }, { key: 'amenity', value: 'fast_food' }],
  retail: [{ key: 'shop' }],
  salon: [{ key: 'shop', value: 'hairdresser' }, { key: 'shop', value: 'beauty' }, { key: 'amenity', value: 'beauty_salon' }],
  clinic: [{ key: 'amenity', value: 'clinic' }, { key: 'amenity', value: 'doctors' }, { key: 'healthcare' }],
  auto_service: [{ key: 'shop', value: 'car_repair' }, { key: 'amenity', value: 'car_wash' }, { key: 'shop', value: 'tyres' }],
  bakery: [{ key: 'shop', value: 'bakery' }],
  pharmacy: [{ key: 'amenity', value: 'pharmacy' }, { key: 'shop', value: 'chemist' }],
  tailor: [{ key: 'shop', value: 'tailor' }, { key: 'craft', value: 'tailor' }],
  cafe: [{ key: 'amenity', value: 'cafe' }],
  gym: [{ key: 'leisure', value: 'fitness_centre' }, { key: 'amenity', value: 'gym' }],
  electronics: [{ key: 'shop', value: 'electronics' }, { key: 'shop', value: 'computer' }, { key: 'shop', value: 'mobile_phone' }],
  jewellery: [{ key: 'shop', value: 'jewelry' }, { key: 'shop', value: 'jewellery' }],
  real_estate: [{ key: 'office', value: 'estate_agent' }],
  catering: [{ key: 'shop', value: 'caterer' }, { key: 'amenity', value: 'restaurant' }],
};

const DEFAULT_BUSINESS_FILTERS: OSMTagFilter[] = [
  { key: 'shop' },
  { key: 'office' },
  { key: 'craft' },
  { key: 'healthcare' },
  { key: 'tourism', regex: 'hotel|guest_house|hostel|motel' },
  { key: 'amenity', regex: 'restaurant|cafe|fast_food|bar|pub|clinic|doctors|dentist|pharmacy|bank|fuel|car_wash|veterinary|marketplace|internet_cafe|childcare' },
  { key: 'leisure', regex: 'fitness_centre|sports_centre|dance' },
];

class OSMServiceError extends Error {
  constructor(message: string, public statusCode = 502) {
    super(message);
    this.name = 'OSMServiceError';
  }
}

export class OSMGeocodingError extends OSMServiceError {
  constructor(message: string, statusCode = 400) {
    super(message, statusCode);
    this.name = 'OSMGeocodingError';
  }
}

export class OSMOverpassError extends OSMServiceError {
  constructor(message: string, statusCode = 502) {
    super(message, statusCode);
    this.name = 'OSMOverpassError';
  }
}

const toFiniteNumber = (value: unknown): number | null => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const clampRadius = (radiusMeters?: number): number => {
  const radius = Number(radiusMeters || 5_000);
  if (!Number.isFinite(radius) || radius < 100) return 5_000;
  return Math.min(Math.round(radius), MAX_RADIUS_METERS);
};

const normalizeCategories = (categories?: string[]): string[] =>
  [...new Set((categories || []).map(c => c.trim()).filter(Boolean))];

const requestHeaders = () => ({
  'User-Agent': USER_AGENT,
  'Accept': 'application/json',
});

const axiosMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const ax = error as AxiosError;
    const status = ax.response?.status ? `HTTP ${ax.response.status}` : 'network error';
    return `${status}: ${ax.message}`;
  }
  return error instanceof Error ? error.message : String(error);
};

export const geocodeLocation = async (location: string): Promise<GeocodeResult> => {
  const query = location.trim();
  if (!query) throw new OSMGeocodingError('Location is required for geocoding');

  try {
    const response = await axios.get<NominatimPlace[]>(NOMINATIM_URL, {
      params: { q: query, format: 'jsonv2', limit: 1, addressdetails: 1 },
      headers: requestHeaders(),
      timeout: REQUEST_TIMEOUT_MS,
    });

    if (!Array.isArray(response.data)) {
      throw new OSMGeocodingError('Nominatim returned an invalid geocoding response', 502);
    }

    const place = response.data[0];
    if (!place) throw new OSMGeocodingError(`No coordinates found for location: ${query}`, 404);

    const lat = toFiniteNumber(place.lat);
    const lng = toFiniteNumber(place.lon);
    if (lat === null || lng === null) {
      throw new OSMGeocodingError('Nominatim response did not include valid coordinates', 502);
    }

    return {
      lat,
      lng,
      displayName: place.display_name || query,
      placeId: place.place_id,
      osmType: place.osm_type,
      osmId: place.osm_id,
      boundingBox: place.boundingbox,
    };
  } catch (error) {
    if (error instanceof OSMGeocodingError) throw error;
    throw new OSMGeocodingError(`Geocoding failed: ${axiosMessage(error)}`, 502);
  }
};

const tagFilterToOverpass = (filter: OSMTagFilter): string => {
  if (filter.regex) return `["${filter.key}"~"^(${filter.regex})$",i]`;
  if (filter.value) return `["${filter.key}"="${filter.value}"]`;
  return `["${filter.key}"]`;
};

const filtersForCategories = (categories: string[]): OSMTagFilter[] => {
  if (categories.length === 0) return DEFAULT_BUSINESS_FILTERS;

  const filters = categories.flatMap(category => {
    if (CATEGORY_FILTERS[category]) return CATEGORY_FILTERS[category];
    if (category.includes('=')) {
      const [key, value] = category.split('=').map(part => part.trim());
      return key && value ? [{ key, value }] : [];
    }
    return [{ key: 'shop', value: category }, { key: 'amenity', value: category }, { key: 'office', value: category }];
  });

  const seen = new Set<string>();
  return filters.filter(filter => {
    const id = `${filter.key}:${filter.value || ''}:${filter.regex || ''}`;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

const buildOverpassQuery = (lat: number, lng: number, radiusMeters: number, categories: string[]): string => {
  const filters = filtersForCategories(categories);
  const elementTypes: OsmElementType[] = ['node', 'way', 'relation'];
  const selectors = filters.flatMap(filter =>
    elementTypes.map(type => `  ${type}${tagFilterToOverpass(filter)}(around:${radiusMeters},${lat},${lng});`)
  );

  return `
[out:json][timeout:25];
(
${selectors.join('\n')}
);
out center tags;
`.trim();
};

const pickFirst = (tags: Record<string, string>, keys: string[]): string | undefined =>
  keys.map(key => tags[key]).find(value => typeof value === 'string' && value.trim().length > 0)?.trim();

const normalizeWebsite = (website?: string): string | undefined => {
  if (!website) return undefined;
  const trimmed = website.trim();
  if (!trimmed) return undefined;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const normalizeCategory = (tags: Record<string, string>): { category: string; type: string } => {
  if (tags.shop) return { category: tags.shop, type: 'shop' };
  if (tags.amenity) return { category: tags.amenity, type: 'amenity' };
  if (tags.office) return { category: tags.office, type: 'office' };
  if (tags.leisure) return { category: tags.leisure, type: 'leisure' };
  if (tags.healthcare) return { category: tags.healthcare, type: 'healthcare' };
  if (tags.craft) return { category: tags.craft, type: 'craft' };
  if (tags.tourism) return { category: tags.tourism, type: 'tourism' };
  return { category: 'business', type: 'place' };
};

const buildAddress = (tags: Record<string, string>): string => {
  const explicit = pickFirst(tags, ['addr:full', 'addr:place']);
  if (explicit) return explicit;

  const streetLine = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ').trim();
  const parts = [streetLine, tags['addr:suburb'], tags['addr:neighbourhood'], tags['addr:city']].filter(Boolean);
  return parts.join(', ');
};

const normalizeBusiness = (element: OverpassElement): NormalizedBusiness | null => {
  const tags = element.tags || {};
  const name = pickFirst(tags, ['name', 'brand', 'operator']);
  const lat = toFiniteNumber(element.lat ?? element.center?.lat);
  const lng = toFiniteNumber(element.lon ?? element.center?.lon);

  if (!name || lat === null || lng === null) return null;

  const { category, type } = normalizeCategory(tags);
  return {
    osmId: `${element.type}:${element.id}`,
    osmType: element.type,
    name,
    category,
    type,
    latitude: lat,
    longitude: lng,
    address: buildAddress(tags),
    city: pickFirst(tags, ['addr:city', 'addr:town', 'addr:village', 'addr:suburb', 'addr:district']) || '',
    area: pickFirst(tags, ['addr:suburb', 'addr:neighbourhood', 'addr:district']),
    phone: pickFirst(tags, ['phone', 'contact:phone', 'mobile', 'contact:mobile']),
    website: normalizeWebsite(pickFirst(tags, ['website', 'contact:website', 'url'])),
    rawTags: tags,
  };
};

export const searchNearbyBusinesses = async (
  params: NearbyBusinessSearchParams,
): Promise<NearbyBusinessSearchResult> => {
  const lat = toFiniteNumber(params.lat);
  const lng = toFiniteNumber(params.lng);
  if (lat === null || lng === null) throw new OSMOverpassError('Valid latitude and longitude are required', 400);

  const radiusMeters = clampRadius(params.radiusMeters);
  const categories = normalizeCategories(params.categories);
  const query = buildOverpassQuery(lat, lng, radiusMeters, categories);
  const limit = Math.max(1, Math.min(params.limit || 100, 250));

  let lastError: unknown;
  for (let attempt = 0; attempt <= DEFAULT_RETRIES; attempt++) {
    try {
      const response = await axios.post<{ elements?: OverpassElement[] }>(OVERPASS_URL, `data=${encodeURIComponent(query)}`, {
        headers: { ...requestHeaders(), 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: REQUEST_TIMEOUT_MS,
      });

      if (!response.data || !Array.isArray(response.data.elements)) {
        throw new OSMOverpassError('Overpass returned an invalid response', 502);
      }

      const seen = new Set<string>();
      const businesses = response.data.elements
        .map(normalizeBusiness)
        .filter((business): business is NormalizedBusiness => Boolean(business))
        .filter(business => {
          if (seen.has(business.osmId)) return false;
          seen.add(business.osmId);
          return true;
        })
        .slice(0, limit);

      return { businesses, center: { lat, lng }, radiusMeters, categories };
    } catch (error) {
      lastError = error;
      if (error instanceof OSMOverpassError || attempt === DEFAULT_RETRIES) break;
      await delay(750 * (attempt + 1));
    }
  }

  if (lastError instanceof OSMOverpassError) throw lastError;
  throw new OSMOverpassError(`Overpass business search failed: ${axiosMessage(lastError)}`, 502);
};

export const discoverBusinessesByLocation = async (params: {
  location: string;
  radiusMeters?: number;
  categories?: string[];
  limit?: number;
}): Promise<NearbyBusinessSearchResult & { geocodedLocation: GeocodeResult }> => {
  const geocodedLocation = await geocodeLocation(params.location);
  const result = await searchNearbyBusinesses({
    lat: geocodedLocation.lat,
    lng: geocodedLocation.lng,
    radiusMeters: params.radiusMeters,
    categories: params.categories,
    limit: params.limit,
  });

  return { ...result, geocodedLocation };
};

// Backwards-compatible alias for older route code. Prefer searchNearbyBusinesses for new usage.
export const queryOverpass = async (
  lat: number,
  lng: number,
  radiusMeters: number,
  categories: string[],
): Promise<NormalizedBusiness[]> => {
  const result = await searchNearbyBusinesses({ lat, lng, radiusMeters, categories });
  return result.businesses;
};
