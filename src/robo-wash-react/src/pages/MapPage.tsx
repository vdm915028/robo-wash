import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { hardcodedWashLocations } from '../api/hardcodedWashLocations';
import { WashLocationsMap } from '../components/WashLocationsMap';

export function MapPage() {
    const navigate = useNavigate();

    // Ссылка на обработчик должна быть стабильной, иначе маркеры пересоздаются на каждый рендер.
    const openWashLocationCard = useCallback((locationId: number) => navigate(`/locations/${locationId}`), [navigate]);

    return (
        <div className="h-dvh w-full">
            <WashLocationsMap locations={hardcodedWashLocations} onLocationSelected={openWashLocationCard} />
        </div>
    );
}
