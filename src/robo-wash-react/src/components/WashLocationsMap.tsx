import { load } from '@2gis/mapgl';
import type { Map as MapGLMap } from '@2gis/mapgl/types';
import { useEffect, useRef, useState } from 'react';
import type { WashLocation } from '../api/contracts';

type MapGLApi = Awaited<ReturnType<typeof load>>;

const saintPetersburgCenter = [30.3141, 59.9386];
const cityZoom = 10.2;

interface WashLocationsMapProps {
    locations: WashLocation[];
    onLocationSelected: (locationId: number) => void;
}

export function WashLocationsMap({ locations, onLocationSelected }: WashLocationsMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<MapGLMap | null>(null);
    const mapglApiRef = useRef<MapGLApi | null>(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const mapKey = import.meta.env.VITE_2GIS_MAP_KEY;

    useEffect(() => {
        if (!mapKey) {
            return;
        }

        let mapDisposed = false;

        load()
            .then(mapglApi => {
                // Пока грузился MapGL, компонент мог размонтироваться — в StrictMode это происходит на каждом запуске.
                if (mapDisposed || !mapContainerRef.current) {
                    return;
                }

                mapglApiRef.current = mapglApi;
                mapRef.current = new mapglApi.Map(mapContainerRef.current, {
                    key: mapKey,
                    center: saintPetersburgCenter,
                    zoom: cityZoom,
                    zoomControl: false,
                    lang: 'ru', // без явного языка MapGL подписывает город и пригороды латиницей
                });
                setIsMapReady(true);
            })
            .catch(error => console.error('MapGL не загрузился, карта показана не будет', error));

        return () => {
            mapDisposed = true;
            mapRef.current?.destroy();
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
            const marker = new mapglApi.Marker(map, {
                coordinates: [washLocation.longitude, washLocation.latitude],
            });
            marker.on('click', () => onLocationSelected(washLocation.id));
            return marker;
        });

        return () => {
            // Если карту уже уничтожили, маркеры ушли вместе с ней и трогать их нельзя.
            if (mapRef.current) {
                markers.forEach(marker => marker.destroy());
            }
        };
    }, [isMapReady, locations, onLocationSelected]);

    if (!mapKey) {
        return (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-slate-600">
                Не задан VITE_2GIS_MAP_KEY: скопируйте .env.example в .env и вставьте ключ 2GIS.
            </div>
        );
    }

    return <div ref={mapContainerRef} className="h-full w-full" />;
}
