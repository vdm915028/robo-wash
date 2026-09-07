import type { WashLocation, WashMode } from './contracts';

// Этап 1: локации живут на клиенте, на этапе 3 этот модуль заменит запрос к RoboWash.Api.
// Адреса и координаты — правдоподобные демо-данные, реальные точки моек тут не заведены.

const expressWashMode: WashMode = {
    id: 1,
    name: 'Экспресс',
    priceRub: 500,
    durationMinutes: 5,
    description: 'Быстрая бесконтактная мойка кузова без сушки.',
    steps: ['Ополаскивание', 'Эмульсия', 'Смыв водой'],
};

const standardWashMode: WashMode = {
    id: 2,
    name: 'Стандарт',
    priceRub: 700,
    durationMinutes: 8,
    description: 'Базовый режим на каждый день: цветная пена и обдув.',
    steps: ['Ополаскивание', 'Эмульсия', 'Смыв водой', 'Цветная пена', 'Обдув'],
};

const luxuryWashMode: WashMode = {
    id: 3,
    name: 'Люкс',
    priceRub: 950,
    durationMinutes: 11,
    description: 'Полная программа: диски, гидрофобное покрытие и ополаскивание осмосом.',
    steps: [
        'Ополаскивание',
        'Эмульсия',
        'Смыв водой',
        'Цветная пена',
        'Мойка дисков',
        'Гидрофоб',
        'Осмос',
        'Обдув 2x',
    ],
};

// Люкс-программу тянет только новое оборудование.
const legacyRobotWashModes = [expressWashMode, standardWashMode];
const modernRobotWashModes = [expressWashMode, standardWashMode, luxuryWashMode];

export const hardcodedWashLocations: WashLocation[] = [
    {
        id: 1,
        address: 'Невский пр., 100',
        longitude: 30.3608,
        latitude: 59.9319,
        robotEquipmentGeneration: 'Modern',
        carsInQueue: 2,
        washModes: modernRobotWashModes,
    },
    {
        id: 2,
        address: 'Московский пр., 165',
        longitude: 30.3199,
        latitude: 59.8663,
        robotEquipmentGeneration: 'Legacy',
        carsInQueue: 0,
        washModes: legacyRobotWashModes,
    },
    {
        id: 3,
        address: 'Ленинский пр., 114',
        longitude: 30.2317,
        latitude: 59.8532,
        robotEquipmentGeneration: 'Modern',
        carsInQueue: 5,
        washModes: modernRobotWashModes,
    },
    {
        id: 4,
        address: 'пр. Энгельса, 154',
        longitude: 30.3236,
        latitude: 60.0505,
        robotEquipmentGeneration: 'Legacy',
        carsInQueue: 1,
        washModes: legacyRobotWashModes,
    },
    {
        id: 5,
        address: 'ул. Савушкина, 112',
        longitude: 30.2246,
        latitude: 59.9862,
        robotEquipmentGeneration: 'Modern',
        carsInQueue: 3,
        washModes: modernRobotWashModes,
    },
    {
        id: 6,
        address: 'Пулковское ш., 30',
        longitude: 30.3253,
        latitude: 59.8083,
        robotEquipmentGeneration: 'Modern',
        carsInQueue: 11,
        washModes: modernRobotWashModes,
    },
    {
        id: 7,
        address: 'Индустриальный пр., 44',
        longitude: 30.4726,
        latitude: 59.9483,
        robotEquipmentGeneration: 'Legacy',
        carsInQueue: 4,
        washModes: legacyRobotWashModes,
    },
];

export function findWashLocationById(locationId: number): WashLocation | undefined {
    return hardcodedWashLocations.find(washLocation => washLocation.id === locationId);
}
