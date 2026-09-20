import type { WashLocation } from './contracts';

const washLocationsUrl = '/api/wash-locations';

export async function fetchWashLocations(): Promise<WashLocation[]> {
    const response = await fetch(washLocationsUrl);

    if (!response.ok) {
        throw new Error(`${washLocationsUrl} ответил ${response.status}`);
    }

    return response.json();
}
