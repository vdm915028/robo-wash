export type QueueLoadLevel = 'Free' | 'Moderate' | 'Busy';

// Пороги демонстрационные: до двух машин заезжаешь почти сразу, с шести ожидание уже дольше самой мойки.
export function getQueueLoadLevel(carsInQueue: number): QueueLoadLevel {
    if (carsInQueue <= 2) {
        return 'Free';
    }

    return carsInQueue <= 5 ? 'Moderate' : 'Busy';
}
