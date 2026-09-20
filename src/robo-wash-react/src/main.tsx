import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { WashLocationsProvider } from './context/WashLocationsContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <WashLocationsProvider>
                <App />
            </WashLocationsProvider>
        </BrowserRouter>
    </StrictMode>,
);
