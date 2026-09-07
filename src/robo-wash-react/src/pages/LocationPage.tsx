import { Link, Navigate, useParams } from 'react-router-dom';
import { findWashLocationById } from '../api/hardcodedWashLocations';
import type { RobotEquipmentGeneration } from '../api/contracts';
import { pluralizeRussian } from '../utils/pluralizeRussian';

const robotEquipmentGenerationLabels: Record<RobotEquipmentGeneration, string> = {
    Legacy: 'Роботы прошлого поколения',
    Modern: 'Роботы нового поколения',
};

export function LocationPage() {
    const { locationId } = useParams();
    const washLocation = findWashLocationById(Number(locationId));

    if (!washLocation) {
        return <Navigate to="/" replace />;
    }

    const queueLabel =
        washLocation.carsInQueue === 0
            ? 'Очереди нет'
            : `${washLocation.carsInQueue} ${pluralizeRussian(washLocation.carsInQueue, 'машина', 'машины', 'машин')}`;

    return (
        <div className="flex h-dvh flex-col bg-slate-100">
            <header className="border-b border-slate-200 bg-white px-4 py-3">
                <Link to="/" className="text-brand inline-flex items-center gap-2 text-sm font-medium">
                    <span aria-hidden="true" className="text-lg leading-none">←</span>
                    К карте
                </Link>
            </header>

            <main className="flex-1 overflow-y-auto p-4">
                <section className="rounded-2xl bg-white p-4 shadow-sm">
                    <h1 className="text-xl leading-tight font-semibold text-slate-900">{washLocation.address}</h1>
                    <dl className="mt-4 space-y-3 text-sm">
                        <div className="flex justify-between gap-4">
                            <dt className="text-slate-500">Оборудование</dt>
                            <dd className="text-right font-medium text-slate-900">
                                {robotEquipmentGenerationLabels[washLocation.robotEquipmentGeneration]}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="text-slate-500">Очередь перед шлагбаумом</dt>
                            <dd className="text-right font-medium text-slate-900">{queueLabel}</dd>
                        </div>
                    </dl>
                </section>

                <section className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
                    <h2 className="text-base font-semibold text-slate-900">Режимы мойки</h2>
                    <ul className="mt-3 space-y-2">
                        {washLocation.washModes.map(washMode => (
                            <li
                                key={washMode.id}
                                className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2"
                            >
                                <span className="font-medium text-slate-900">{washMode.name}</span>
                                <span className="text-sm text-slate-500">
                                    {washMode.priceRub} ₽ · {washMode.durationMinutes} мин
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>
            </main>
        </div>
    );
}
