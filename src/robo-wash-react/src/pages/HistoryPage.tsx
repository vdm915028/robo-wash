import { hardcodedWashSessions } from '../api/hardcodedWashSessions';
import { FullScreenHeader } from '../components/FullScreenHeader';
import { groupWashSessionsByMonth } from '../utils/groupWashSessionsByMonth';

const washSessionDateFormat = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
});

const washModeBadgeClasses = 'bg-brand/10 text-brand mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-medium';

export function HistoryPage() {
    const monthGroups = groupWashSessionsByMonth(hardcodedWashSessions);

    return (
        <section className="absolute inset-0 flex flex-col bg-slate-100">
            <FullScreenHeader title="История моек" />

            <div className="flex-1 overflow-y-auto p-4">
                {monthGroups.map(monthGroup => (
                    <div key={monthGroup.monthKey} className="mb-5 last:mb-0">
                        <h2 className="mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                            {monthGroup.monthLabel}
                        </h2>
                        <ul className="space-y-2">
                            {monthGroup.washSessions.map(washSession => (
                                <li key={washSession.id} className="rounded-2xl bg-white p-4 shadow-sm">
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="font-medium text-slate-900">
                                            {washSessionDateFormat.format(new Date(washSession.washedAt))}
                                        </p>
                                        <p className="shrink-0 font-semibold text-slate-900">
                                            {washSession.priceRub} ₽
                                        </p>
                                    </div>
                                    <span className={washModeBadgeClasses}>{washSession.washModeName}</span>
                                    <p className="mt-2 text-sm text-slate-500">{washSession.locationAddress}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    );
}
