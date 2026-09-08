import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { hardcodedWashLocations } from './api/hardcodedWashLocations';
import { AppMenu } from './components/AppMenu';
import { WashLocationsMap } from './components/WashLocationsMap';
import { AboutPage } from './pages/AboutPage';
import { HistoryPage } from './pages/HistoryPage';
import { LocationPage } from './pages/LocationPage';
import { TerminalPage } from './pages/TerminalPage';
import { WashSessionPage } from './pages/WashSessionPage';

// Карта смонтирована выше роутера и не размонтируется никогда: экраны рисуются поверх неё. Иначе возврат
// с карточки пересобирал бы карту и сбрасывал позицию с зумом, которые пользователь выставил руками.
export function App() {
    const navigate = useNavigate();

    return (
        // Приложение мобильное, поэтому на широком экране колонка ограничена шириной телефона, а поля по бокам
        // подстраиваются под цветовую схему системы: так демо на ноутбуке выглядит как телефон, а не растягивается.
        <div className="flex h-dvh w-full justify-center bg-white dark:bg-black">
            <div className="relative h-full w-full max-w-md overflow-hidden">
                <WashLocationsMap
                    locations={hardcodedWashLocations}
                    onLocationSelected={locationId => navigate(`/locations/${locationId}`)}
                />
                {/* Меню объявлено до маршрутов, поэтому полноэкранные экраны перекрывают его сами, без условий. */}
                <AppMenu />
                <Routes>
                    <Route path="/" element={null} />
                    <Route path="/history" element={<HistoryPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/locations/:locationId" element={<LocationPage />} />
                    <Route path="/locations/:locationId/terminal" element={<TerminalPage />} />
                    <Route path="/locations/:locationId/wash/:washModeId" element={<WashSessionPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </div>
    );
}
