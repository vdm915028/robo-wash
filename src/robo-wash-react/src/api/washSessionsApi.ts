import { apiBaseUrl } from './apiBaseUrl';
import type { CreateWashSessionRequest, WashSession } from './contracts';

const washSessionsUrl = `${apiBaseUrl}/api/wash-sessions`;
const deviceIdHeader = 'X-Device-Id';

export async function createWashSession(deviceId: string, request: CreateWashSessionRequest): Promise<WashSession> {
    const response = await fetch(washSessionsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', [deviceIdHeader]: deviceId },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        throw new Error(`${washSessionsUrl} ответил ${response.status}`);
    }

    return response.json();
}

export async function fetchWashHistory(deviceId: string): Promise<WashSession[]> {
    const response = await fetch(washSessionsUrl, { headers: { [deviceIdHeader]: deviceId } });

    if (!response.ok) {
        throw new Error(`${washSessionsUrl} ответил ${response.status}`);
    }

    return response.json();
}
