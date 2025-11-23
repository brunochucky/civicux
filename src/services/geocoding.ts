/**
 * Reverse geocoding service using Nominatim (OpenStreetMap)
 * Converts coordinates to human-readable addresses
 */

interface GeocodingResult {
    address: string;
    error?: string;
}

const cache = new Map<string, string>();

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodingResult> {
    const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    
    // Check cache first
    if (cache.has(cacheKey)) {
        return { address: cache.get(cacheKey)! };
    }

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'CidadaoAuditor/1.0'
                }
            }
        );

        if (!response.ok) {
            throw new Error('Geocoding failed');
        }

        const data = await response.json();
        
        // Build address from components
        const addressParts = [];
        if (data.address.road) addressParts.push(data.address.road);
        if (data.address.house_number) addressParts.push(data.address.house_number);
        if (data.address.suburb || data.address.neighbourhood) {
            addressParts.push(data.address.suburb || data.address.neighbourhood);
        }
        if (data.address.city || data.address.town || data.address.village) {
            addressParts.push(data.address.city || data.address.town || data.address.village);
        }
        if (data.address.state) addressParts.push(data.address.state);

        const address = addressParts.length > 0 
            ? addressParts.join(', ') 
            : data.display_name || 'Endereço não encontrado';

        // Cache the result
        cache.set(cacheKey, address);

        return { address };
    } catch (error) {
        console.error('Geocoding error:', error);
        return { 
            address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            error: 'Não foi possível obter o endereço'
        };
    }
}
