import '@/assets/styles/index.css';
import { initLocale } from '@condor/ui/utils/session/locale';
import { initTheme } from '@condor/ui/utils/session/theme';
import { mount } from '@pollium/readable-react/app/mount';
import ConsoleLayout from '@/app/layouts/ConsoleLayout';
import { appCopy } from '@/shared/utils/error-copy';

initTheme();
initLocale();

mount({
    name: 'condor',
    apiUrl: import.meta.env.VITE_API_URL,
    pages: import.meta.glob('/src/modules/*/pages/**/{index,layout}.tsx'),
    layout: ConsoleLayout,
    signIn: '/entrar',
    home: '/',
    copy: appCopy
});
