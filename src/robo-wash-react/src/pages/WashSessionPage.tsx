import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { findWashLocationById } from '../api/hardcodedWashLocations';
import { pluralizeRussian } from '../utils/pluralizeRussian';

const washDurationSeconds = 5;

export function WashSessionPage() {
    const { locationId, washModeId } = useParams();
    const navigate = useNavigate();
    const washLocation = findWashLocationById(Number(locationId));
    const washMode = washLocation?.washModes.find(mode => mode.id === Number(washModeId));
    const [secondsLeft, setSecondsLeft] = useState(washDurationSeconds);

    // Демо-упрощение: в боевой системе о ходе мойки сообщает оборудование, здесь это отсчёт на клиенте.
    useEffect(() => {
        const countdown = setInterval(() => setSecondsLeft(seconds => Math.max(0, seconds - 1)), 1000);
        return () => clearInterval(countdown);
    }, []);

    useEffect(() => {
        if (secondsLeft === 0) {
            navigate('/', { replace: true });
        }
    }, [secondsLeft, navigate]);

    if (!washLocation || !washMode) {
        return <Navigate to="/" replace />;
    }

    const washedPercent = ((washDurationSeconds - secondsLeft) / washDurationSeconds) * 100;

    return (
        <section className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 px-8 text-center">
            <p className="text-sm font-medium tracking-wide text-slate-400 uppercase">Мойка в процессе</p>
            <p className="mt-2 text-2xl font-semibold text-white">{washMode.name}</p>
            <p className="mt-1 text-sm text-slate-400">{washLocation.address}</p>

            <p className="mt-10 text-7xl font-semibold text-white tabular-nums">{secondsLeft}</p>
            <p className="mt-2 text-sm text-slate-400">
                {pluralizeRussian(secondsLeft, 'секунда', 'секунды', 'секунд')} до конца
            </p>

            <div className="mt-8 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/15">
                {/* Ширина в процентах — значение считается на лету, готовым классом Tailwind его не выразить. */}
                <div className="bg-brand h-full transition-all duration-1000" style={{ width: `${washedPercent}%` }} />
            </div>
        </section>
    );
}
