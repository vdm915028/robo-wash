import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { findWashLocationById } from '../api/hardcodedWashLocations';
import { pluralizeRussian } from '../utils/pluralizeRussian';

const washDurationSeconds = 5;
const washCompletedScreenSeconds = 2;

const washScreenClasses = 'absolute inset-0 flex flex-col items-center justify-center bg-slate-900 px-8 text-center';

export function WashSessionPage() {
    const { locationId, washModeId } = useParams();
    const navigate = useNavigate();
    const washLocation = findWashLocationById(Number(locationId));
    const washMode = washLocation?.washModes.find(mode => mode.id === Number(washModeId));
    const [secondsLeft, setSecondsLeft] = useState(washDurationSeconds);
    const isWashCompleted = secondsLeft === 0;

    // Демо-упрощение: в боевой системе о ходе мойки сообщает оборудование, здесь это отсчёт на клиенте.
    useEffect(() => {
        if (isWashCompleted) {
            return;
        }

        const countdown = setInterval(() => setSecondsLeft(seconds => Math.max(0, seconds - 1)), 1000);
        return () => clearInterval(countdown);
    }, [isWashCompleted]);

    useEffect(() => {
        if (!isWashCompleted) {
            return;
        }

        const returnToMap = setTimeout(() => navigate('/', { replace: true }), washCompletedScreenSeconds * 1000);
        return () => clearTimeout(returnToMap);
    }, [isWashCompleted, navigate]);

    if (!washLocation || !washMode) {
        return <Navigate to="/" replace />;
    }

    if (isWashCompleted) {
        return (
            <section className={washScreenClasses}>
                <span aria-hidden="true" className="bg-brand flex h-16 w-16 items-center justify-center rounded-full">
                    <span className="text-3xl leading-none text-white">✓</span>
                </span>
                <p className="mt-6 text-2xl font-semibold text-white">Мойка завершена</p>
                <p className="mt-2 text-slate-400">Ждём Вас снова!</p>
            </section>
        );
    }

    const washedPercent = ((washDurationSeconds - secondsLeft) / washDurationSeconds) * 100;

    return (
        <section className={washScreenClasses}>
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
