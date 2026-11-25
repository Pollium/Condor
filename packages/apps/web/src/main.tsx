import '@/assets/styles/index.css';
import { mount } from '@pollium/readable-react/app/mount';
import ConsoleLayout from '@/app/layouts/ConsoleLayout';
import { initLocale } from '@/shared/i18n/locale';
import { initTheme } from '@/shared/store/theme';
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
