import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { WashLocation } from '../api/contracts';
import { fetchWashLocations } from '../api/washLocationsApi';

interface WashLocationsState {
    washLocations: WashLocation[];
    isLoading: boolean;
    hasFailed: boolean;
}

const WashLocationsContext = createContext<WashLocationsState | null>(null);

// Справочник запрашивается один раз на всё приложение: его показывают карта, карточка локации, терминал
// и экран мойки. Отдельный запрос на каждом экране добавил бы задержку там, где данные уже есть на руках.
export function WashLocationsProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<WashLocationsState>({
        washLocations: [],
        isLoading: true,
        hasFailed: false,
    });

    useEffect(() => {
        // В StrictMode эффект отрабатывает дважды, и первый вызов отменяется: без флага ответ отменённого
        // запроса пришёл бы в уже размонтированное дерево.
        let isActive = true;

        fetchWashLocations()
            .then(washLocations => {
                if (isActive) {
                    setState({ washLocations, isLoading: false, hasFailed: false });
                }
            })
            .catch((error: unknown) => {
                console.error('Не удалось загрузить локации', error);

                if (isActive) {
                    setState({ washLocations: [], isLoading: false, hasFailed: true });
                }
            });

        return () => {
            isActive = false;
        };
    }, []);

    return <WashLocationsContext.Provider value={state}>{children}</WashLocationsContext.Provider>;
}

export function useWashLocations(): WashLocationsState {
    const state = useContext(WashLocationsContext);

    if (!state) {
        throw new Error('useWashLocations вызван вне WashLocationsProvider');
    }

    return state;
}

// Экраны локации, терминала и мойки открываются по прямой ссылке, поэтому кроме самой локации им нужно
// знать, что справочник ещё едет: иначе первый же кадр отправил бы пользователя обратно на карту.
export function useWashLocationById(locationId: string | undefined) {
    const { washLocations, isLoading } = useWashLocations();

    return { washLocation: washLocations.find(location => location.id === Number(locationId)), isLoading };
}
