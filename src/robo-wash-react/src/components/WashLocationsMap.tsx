import { load } from '@2gis/mapgl';
import type { Map as MapGLMap } from '@2gis/mapgl/types';
import { useEffect, useRef, useState } from 'react';
import type { WashLocation } from '../api/contracts';
import { getQueueLoadLevel, type QueueLoadLevel } from '../utils/queueLoadLevel';

type MapGLApi = Awaited<ReturnType<typeof load>>;

const saintPetersburgCenter = [30.3141, 59.9386];
const cityZoom = 10.2;

const queueLoadMarkerColors: Record<QueueLoadLevel, string> = {
    Free: '#16a34a',
    Moderate: '#d97706',
    Busy: '#dc2626',
};

interface WashLocationsMapProps {
    locations: WashLocation[];
    onLocationSelected: (locationId: number) => void;
}

export function WashLocationsMap({ locations, onLocationSelected }: WashLocationsMapProps) {
    // navigate из react-router меняет идентичность на каждой навигации, поэтому обработчик держим в ref:
    // иначе эффект маркеров перезапускался бы на каждый переход и пересоздавал все точки на карте.
    const onLocationSelectedRef = useRef(onLocationSelected);
    useEffect(() => {
        onLocationSelectedRef.current = onLocationSelected;
    });

    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<MapGLMap | null>(null);
    const mapglApiRef = useRef<MapGLApi | null>(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const mapKey = import.meta.env.VITE_2GIS_MAP_KEY;

    useEffect(() => {
        if (!mapKey) {
            return;
        }

        let createdMap: MapGLMap | undefined;
        let mapDisposed = false;

        load()
            .then(mapglApi => {
                // Пока грузился MapGL, компонент мог размонтироваться — в StrictMode это происходит на каждом запуске.
                if (mapDisposed || !mapContainerRef.current) {
                    return;
                }

                const map = new mapglApi.Map(mapContainerRef.current, {
                    key: mapKey,
                    center: saintPetersburgCenter,
                    zoom: cityZoom,
                    zoomControl: false,
                    lang: 'ru', // без явного языка MapGL подписывает город и пригороды латиницей
                });
                createdMap = map;
                mapglApiRef.current = mapglApi;
                mapRef.current = map;
                setIsMapReady(true);
            })
            .catch(error => console.error('MapGL не загрузился, карта показана не будет', error));

        return () => {
            mapDisposed = true;
            createdMap?.destroy();
            mapRef.current = null;
            setIsMapReady(false);
        };
    }, [mapKey]);

    // Маркеры живут в своём эффекте: список локаций поедет с сервера и будет меняться, а пересоздание карты
    // ради нового списка сбрасывало бы позицию и зум, которые пользователь выставил руками.
    useEffect(() => {
        const map = mapRef.current;
        const mapglApi = mapglApiRef.current;
        if (!isMapReady || !map || !mapglApi) {
            return;
        }

        const markers = locations.map(washLocation => {
            const marker = new mapglApi.CircleMarker(map, {
                coordinates: [washLocation.longitude, washLocation.latitude],
                color: queueLoadMarkerColors[getQueueLoadLevel(washLocation.carsInQueue)],
                diameter: 22,
                strokeColor: '#ffffff',
                strokeWidth: 3,
            });
            marker.on('click', () => onLocationSelectedRef.current(washLocation.id));
            return marker;
        });

        return () => {
            // Если карту уже уничтожили, маркеры ушли вместе с ней и трогать их нельзя.
            if (mapRef.current) {
                markers.forEach(marker => marker.destroy());
            }
        };
    }, [isMapReady, locations]);

    if (!mapKey) {
        return (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-slate-600">
                Не задан VITE_2GIS_MAP_KEY: скопируйте .env.example в .env и вставьте ключ 2GIS.
            </div>
        );
    }

    return <div ref={mapContainerRef} className="h-full w-full" />;
}
