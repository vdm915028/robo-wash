import type { WashSession } from './contracts';

// Этап 1: история захардкожена, на этапе 3 её заменит запрос к RoboWash.Api по идентификатору устройства.
// Даты считаются от текущего момента: с фиксированными демо через полгода показывало бы мойки из прошлого года.
function washedAtDaysAgo(daysAgo: number, hour: number, minute: number): string {
    const washedAt = new Date();
    washedAt.setDate(washedAt.getDate() - daysAgo);
    washedAt.setHours(hour, minute, 0, 0);

    return washedAt.toISOString();
}

export const hardcodedWashSessions: WashSession[] = [
    {
        id: 1,
        locationAddress: 'Невский пр., 100',
        washModeName: 'Люкс',
        priceRub: 950,
        washedAt: washedAtDaysAgo(2, 18, 40),
    },
    {
        id: 2,
        locationAddress: 'ул. Савушкина, 112',
        washModeName: 'Стандарт',
        priceRub: 700,
        washedAt: washedAtDaysAgo(9, 12, 15),
    },
    {
        id: 3,
        locationAddress: 'Московский пр., 165',
        washModeName: 'Экспресс',
        priceRub: 500,
        washedAt: washedAtDaysAgo(23, 9, 5),
    },
];
