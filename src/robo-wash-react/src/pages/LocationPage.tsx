import { Link, Navigate, useParams } from 'react-router-dom';
import { findWashLocationById } from '../api/hardcodedWashLocations';
import { WashModeList } from '../components/WashModeList';
import { pluralizeRussian } from '../utils/pluralizeRussian';
import { getQueueLoadLevel, type QueueLoadLevel } from '../utils/queueLoadLevel';

const queueLoadBadgeClasses: Record<QueueLoadLevel, string> = {
    Free: 'bg-green-100 text-green-700',
    Moderate: 'bg-amber-100 text-amber-700',
    Busy: 'bg-red-100 text-red-700',
};

export function LocationPage() {
    const { locationId } = useParams();
    const washLocation = findWashLocationById(Number(locationId));

    if (!washLocation) {
        return <Navigate to="/" replace />;
    }

    const { carsInQueue } = washLocation;
    const queueLabel =
        carsInQueue === 0
            ? 'Очереди нет'
            : `Очередь: ${carsInQueue} ${pluralizeRussian(carsInQueue, 'машина', 'машины', 'машин')}`;
    const queueBadgeColorClasses = queueLoadBadgeClasses[getQueueLoadLevel(carsInQueue)];

    return (
        <section className="absolute inset-x-0 bottom-0 flex max-h-[80dvh] flex-col rounded-t-3xl bg-white shadow-2xl">
            <div className="flex items-start gap-3 px-4 pt-4 pb-1">
                <h1 className="flex-1 text-xl leading-tight font-semibold text-slate-900">{washLocation.address}</h1>
                <Link
                    to="/"
                    aria-label="Вернуться к карте"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500"
                >
                    ×
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pt-2 pb-2">
                <div className="flex flex-wrap gap-2">
                    {washLocation.robotEquipmentGeneration === 'Modern' && (
                        <span className="bg-brand/10 text-brand rounded-full px-2.5 py-1 text-xs font-medium">
                            Новое оборудование
                        </span>
                    )}
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${queueBadgeColorClasses}`}>
                        {queueLabel}
                    </span>
                </div>

                <h2 className="mt-5 mb-3 text-base font-semibold text-slate-900">Режимы мойки</h2>
                <WashModeList washModes={washLocation.washModes} />
            </div>

            {/* Нижний отступ уводит кнопку из-под логотипа 2GIS: он рисуется поверх шторки, убирать его нельзя. */}
            <div className="px-4 pt-3 pb-12">
                <Link
                    to={`/locations/${washLocation.id}/terminal`}
                    className="bg-brand block w-full rounded-2xl py-3.5 text-center font-semibold text-white"
                >
                    Я у терминала
                </Link>
            </div>
        </section>
    );
}
