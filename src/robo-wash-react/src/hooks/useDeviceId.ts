import { useState } from 'react';

const deviceIdStorageKey = 'robo-wash.device-id';

// Единственное, чем приложение отличает одного пользователя от другого: логина и пароля здесь нет, а история
// моек к чему-то привязываться обязана. Идентификатор живёт в localStorage, поэтому чистка данных браузера
// стирает историю вместе с ним — в боевой системе на этом месте была бы учётная запись.
function readOrCreateDeviceId(): string {
    const storedDeviceId = localStorage.getItem(deviceIdStorageKey);

    if (storedDeviceId) {
        return storedDeviceId;
    }

    const deviceId = crypto.randomUUID();
    localStorage.setItem(deviceIdStorageKey, deviceId);

    return deviceId;
}

export function useDeviceId(): string {
    // Инициализатор ленивый: в localStorage лезем один раз за жизнь компонента, а не на каждый рендер.
    const [deviceId] = useState(readOrCreateDeviceId);

    return deviceId;
}
