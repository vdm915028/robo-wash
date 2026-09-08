import { useState } from 'react';
import type { WashMode } from '../api/contracts';

interface WashModeListProps {
    washModes: WashMode[];
}

export function WashModeList({ washModes }: WashModeListProps) {
    // Раскрыт всегда не больше одного режима: на телефоне развёрнутые списки шагов иначе не помещаются на экран.
    const [expandedWashModeId, setExpandedWashModeId] = useState<number | null>(null);

    return (
        <ul className="space-y-2">
            {washModes.map(washMode => {
                const isExpanded = washMode.id === expandedWashModeId;

                return (
                    <li key={washMode.id} className="overflow-hidden rounded-xl border border-slate-200">
                        <button
                            type="button"
                            aria-expanded={isExpanded}
                            onClick={() => setExpandedWashModeId(isExpanded ? null : washMode.id)}
                            className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
                        >
                            <span className="flex-1 font-medium text-slate-900">{washMode.name}</span>
                            <span className="text-sm text-slate-500">
                                {washMode.priceRub} ₽ · {washMode.durationMinutes} мин
                            </span>
                            <span
                                aria-hidden="true"
                                className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            >
                                ▾
                            </span>
                        </button>

                        {isExpanded && (
                            <div className="border-t border-slate-200 bg-slate-50 px-3 py-2.5">
                                <p className="text-sm text-slate-600">{washMode.description}</p>
                                <ol className="mt-2 space-y-1">
                                    {washMode.steps.map((step, stepIndex) => (
                                        <li key={stepIndex} className="flex gap-2 text-sm text-slate-600">
                                            <span className="text-slate-400">{stepIndex + 1}.</span>
                                            {step}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}
