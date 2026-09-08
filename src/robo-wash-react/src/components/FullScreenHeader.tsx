import { Link } from 'react-router-dom';

// Белая шапка заходит под вырез экрана, поэтому верхний отступ считается вместе с safe area.
const fullScreenHeaderClasses =
    'flex items-center gap-3 bg-white px-4 pt-[calc(env(safe-area-inset-top)_+_0.75rem)] pb-3 shadow-sm';

interface FullScreenHeaderProps {
    title: string;
}

export function FullScreenHeader({ title }: FullScreenHeaderProps) {
    return (
        <header className={fullScreenHeaderClasses}>
            <Link
                to="/"
                aria-label="Вернуться к карте"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500"
            >
                ←
            </Link>
            <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        </header>
    );
}
