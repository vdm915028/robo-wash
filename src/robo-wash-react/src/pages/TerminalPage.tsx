import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { findWashLocationById } from '../api/hardcodedWashLocations';

const washModeButtonBaseClasses = 'flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left';
const payButtonClasses =
    'bg-brand w-full rounded-2xl py-3.5 font-semibold text-white disabled:bg-slate-200 disabled:text-slate-400';

export function TerminalPage() {
    const { locationId } = useParams();
    const navigate = useNavigate();
    const washLocation = findWashLocationById(Number(locationId));
    const [selectedWashModeId, setSelectedWashModeId] = useState<number | null>(null);

    if (!washLocation) {
        return <Navigate to="/" replace />;
    }

    const selectedWashMode = washLocation.washModes.find(washMode => washMode.id === selectedWashModeId);

    // Демо-упрощение: платёжный провайдер не подключён, нажатие «Оплатить» сразу считается успешной оплатой.
    const payAndStartWash = () => {
        if (selectedWashMode) {
            navigate(`/locations/${washLocation.id}/wash/${selectedWashMode.id}`, { replace: true });
        }
    };

    return (
        <section className="absolute inset-x-0 bottom-0 flex max-h-[80dvh] flex-col rounded-t-3xl bg-white shadow-2xl">
            <div className="flex items-start gap-3 px-4 pt-4 pb-1">
                <div className="flex-1">
                    <h1 className="text-xl leading-tight font-semibold text-slate-900">Выберите режим мойки</h1>
                    <p className="mt-1 text-sm text-slate-500">{washLocation.address}</p>
                </div>
                <Link
                    to={`/locations/${washLocation.id}`}
                    aria-label="Вернуться к локации"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500"
                >
                    ×
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pt-3 pb-2">
                <ul className="space-y-2">
                    {washLocation.washModes.map(washMode => {
                        const isSelected = washMode.id === selectedWashModeId;
                        const selectionClasses = isSelected ? 'border-brand bg-brand/5' : 'border-slate-200';

                        return (
                            <li key={washMode.id}>
                                <button
                                    type="button"
                                    aria-pressed={isSelected}
                                    onClick={() => setSelectedWashModeId(washMode.id)}
                                    className={`${washModeButtonBaseClasses} ${selectionClasses}`}
                                >
                                    <span className="flex-1">
                                        <span className="block font-medium text-slate-900">{washMode.name}</span>
                                        <span className="block text-xs text-slate-500">
                                            {washMode.durationMinutes} мин · {washMode.description}
                                        </span>
                                    </span>
                                    <span className="font-semibold text-slate-900">{washMode.priceRub} ₽</span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Нижний отступ уводит кнопку из-под логотипа 2GIS: он рисуется поверх шторки, убирать его нельзя. */}
            <div className="px-4 pt-3 pb-12">
                <button type="button" disabled={!selectedWashMode} onClick={payAndStartWash} className={payButtonClasses}>
                    {selectedWashMode ? `Оплатить ${selectedWashMode.priceRub} ₽` : 'Выберите режим мойки'}
                </button>
            </div>
        </section>
    );
}
