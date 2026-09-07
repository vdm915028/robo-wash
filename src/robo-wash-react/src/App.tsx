import { Navigate, Route, Routes } from 'react-router-dom';
import { LocationPage } from './pages/LocationPage';
import { MapPage } from './pages/MapPage';

export function App() {
    return (
        <Routes>
            <Route path="/" element={<MapPage />} />
            <Route path="/locations/:locationId" element={<LocationPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
