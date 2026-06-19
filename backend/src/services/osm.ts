import axios from 'axios';

// Add delay for retries/rate limiting
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const USER_AGENT = 'ClientPilotAI/1.0 (contact@example.com)';

export interface OSMNode {
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
}

export const geocodeLocation = async (location: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    const response = await axios.get(NOMINATIM_URL, {
      params: { q: location, format: 'json', limit: 1 },
      headers: { 'User-Agent': USER_AGENT }
    });

    if (response.data && response.data.length > 0) {
      return {
        lat: parseFloat(response.data[0].lat),
        lng: parseFloat(response.data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error('Nominatim Geocoding Error:', error);
    return null;
  }
};

const mapCategoryToOSMTags = (category: string): string => {
  const mapping: Record<string, string[]> = {
    restaurant: ['node["amenity"="restaurant"]'],
    retail: ['node["shop"]'],
    salon: ['node["shop"="hairdresser"]', 'node["shop"="beauty"]'],
    clinic: ['node["amenity"="clinic"]', 'node["amenity"="doctors"]'],
    auto_service: ['node["shop"="car_repair"]'],
    bakery: ['node["shop"="bakery"]'],
    pharmacy: ['node["amenity"="pharmacy"]'],
    tailor: ['node["shop"="tailor"]'],
    cafe: ['node["amenity"="cafe"]'],
    gym: ['node["leisure"="fitness_centre"]'],
    electronics: ['node["shop"="electronics"]'],
    jewellery: ['node["shop"="jewelry"]'],
    real_estate: ['node["office"="estate_agent"]'],
    catering: ['node["amenity"="catering"]'] // Rare in OSM, but adding for completeness
  };

  const tags = mapping[category];
  if (!tags) return 'node["shop"]'; // fallback
  return tags.join(';');
};

export const queryOverpass = async (lat: number, lng: number, radiusMeters: number, categories: string[]): Promise<OSMNode[]> => {
  let queryParts = [];
  
  if (categories.length === 0) {
    queryParts.push(`node["amenity"](around:${radiusMeters},${lat},${lng});`);
    queryParts.push(`node["shop"](around:${radiusMeters},${lat},${lng});`);
  } else {
    for (const cat of categories) {
      const tags = mapCategoryToOSMTags(cat).split(';');
      for (const tag of tags) {
        queryParts.push(`${tag}(around:${radiusMeters},${lat},${lng});`);
      }
    }
  }

  const query = `
    [out:json][timeout:25];
    (
      ${queryParts.join('\n      ')}
    );
    out body;
    >;
    out skel qt;
  `;

  let retries = 3;
  while (retries > 0) {
    try {
      const response = await axios.post(OVERPASS_URL, `data=${encodeURIComponent(query)}`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': USER_AGENT
        },
        timeout: 30000
      });

      return response.data.elements.filter((e: any) => e.type === 'node' && e.tags && e.tags.name) as OSMNode[];
    } catch (error: any) {
      console.error(`Overpass API Error (Retries left: ${retries - 1}):`, error.message);
      retries--;
      if (retries === 0) throw new Error('Overpass API failed after retries');
      await delay(2000); // 2 second backoff
    }
  }
  return [];
};
