import type { WashLocation } from './contracts';

// В разработке переменная пустая, и запрос уходит относительным путём — его перекидывает прокси Vite.
// В Cloud Run клиент и API развёрнуты разными сервисами, поэтому адрес API запекается в бандл при
// сборке: переменная окружения контейнера до готовой статики не доедет.
const washLocationsUrl = `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/wash-locations`;

export async function fetchWashLocations(): Promise<WashLocation[]> {
    const response = await fetch(washLocationsUrl);

    if (!response.ok) {
        throw new Error(`${washLocationsUrl} ответил ${response.status}`);
    }

    return response.json();
}
