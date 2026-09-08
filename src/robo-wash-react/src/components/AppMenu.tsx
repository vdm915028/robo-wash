import { useState } from 'react';
import { Link } from 'react-router-dom';

const menuButtonClasses =
    'pointer-events-auto m-3 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg';
const menuItemClasses = 'block px-5 py-4 text-lg font-medium text-slate-900';

export function AppMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const closeMenu = () => setIsOpen(false);

    return (
        // Контейнер растянут во всю ширину ради раскрытого меню, поэтому клики сквозь него пропускаем:
        // иначе верхняя полоса экрана перестала бы таскать карту.
        <div className="pointer-events-none absolute inset-x-0 top-0 pt-[env(safe-area-inset-top)]">
            <button
                type="button"
                aria-label="Меню"
                aria-expanded={isOpen}
                onClick={() => setIsOpen(isMenuOpen => !isMenuOpen)}
                className={menuButtonClasses}
            >
                <span aria-hidden="true" className="flex h-3.5 w-5 flex-col justify-between">
                    <span className="h-0.5 rounded bg-slate-700" />
                    <span className="h-0.5 rounded bg-slate-700" />
                    <span className="h-0.5 rounded bg-slate-700" />
                </span>
            </button>

            {isOpen && (
                <>
                    {/* Подложка ловит нажатие мимо меню раньше карты, иначе тап уходил бы в маркеры. */}
                    <div className="pointer-events-auto fixed inset-0" onClick={closeMenu} />
                    <nav className="pointer-events-auto relative border-y border-slate-200 bg-white shadow-lg">
                        <Link to="/history" onClick={closeMenu} className={menuItemClasses}>
                            История моек
                        </Link>
                        <Link to="/about" onClick={closeMenu} className={`${menuItemClasses} border-t border-slate-100`}>
                            О приложении
                        </Link>
                    </nav>
                </>
            )}
        </div>
    );
}
