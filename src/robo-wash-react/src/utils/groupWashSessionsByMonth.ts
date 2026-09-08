import type { WashSession } from '../api/contracts';

export interface WashSessionMonthGroup {
    monthKey: string;
    monthLabel: string;
    washSessions: WashSession[];
}

const monthNameFormat = new Intl.DateTimeFormat('ru-RU', { month: 'long' });

// Intl отдаёт месяц со строчной буквы и в именительном падеже — как раз то, что нужно заголовку группы.
function buildMonthLabel(washedAt: Date): string {
    const monthName = monthNameFormat.format(washedAt);

    return `${monthName[0].toUpperCase()}${monthName.slice(1)} ${washedAt.getFullYear()}`;
}

// Порядок групп повторяет порядок записей, а не сортируется заново: сортировку истории задаёт сервер.
export function groupWashSessionsByMonth(washSessions: WashSession[]): WashSessionMonthGroup[] {
    const groupsByMonth = new Map<string, WashSessionMonthGroup>();

    for (const washSession of washSessions) {
        const washedAt = new Date(washSession.washedAt);
        const monthKey = `${washedAt.getFullYear()}-${washedAt.getMonth()}`;
        const group = groupsByMonth.get(monthKey);

        if (group) {
            group.washSessions.push(washSession);
        } else {
            groupsByMonth.set(monthKey, {
                monthKey,
                monthLabel: buildMonthLabel(washedAt),
                washSessions: [washSession],
            });
        }
    }

    return [...groupsByMonth.values()];
}
