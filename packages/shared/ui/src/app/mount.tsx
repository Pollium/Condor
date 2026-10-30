import { initLocale } from '../utils/session/locale';
import { initTheme } from '../utils/session/theme';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, RouterProviderProps } from 'react-router-dom';

export const mountApp = (router: RouterProviderProps['router']) => {
    initTheme();
    initLocale();

    const root = document.getElementById('root');
    if(root === null) return;

    createRoot(root).render(
        <StrictMode>
            <RouterProvider router={router} />
        </StrictMode>
    );
};
