export type RobotEquipmentGeneration = 'Legacy' | 'Modern';

export interface WashMode {
    id: number;
    name: string;
    priceRub: number;
    durationMinutes: number;
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
