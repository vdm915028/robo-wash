export type RobotEquipmentGeneration = 'Legacy' | 'Modern';

export interface WashMode {
    id: number;
    name: string;
    priceRub: number;
    durationMinutes: number;
    description: string;
    steps: string[];
}

export interface WashLocation {
    id: number;
    address: string;
    longitude: number;
    latitude: number;
    robotEquipmentGeneration: RobotEquipmentGeneration;
    carsInQueue: number;
    washModes: WashMode[];
}

// История приезжает с сервера уже собранной: адрес и режим лежат в самой записи, чтобы клиенту не пришлось
// сводить её с локациями — на этапе с API этот тип станет DTO эндпоинта истории как есть.
export interface WashSession {
    id: number;
    locationAddress: string;
    washModeName: string;
    priceRub: number;
    washedAt: string;
}
