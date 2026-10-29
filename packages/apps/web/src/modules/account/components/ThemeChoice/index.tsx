import { readPreference, rememberSystem, systemTheme, type ThemePreference } from '@/modules/account/utils/theme-preference';
import Segmented from '@/shared/components/Segmented';
import { useThemeStore } from '@condor/ui/store/theme';
import { useState } from 'react';

const CHOICES: { value: ThemePreference; label: string }[] = [
    { value: 'light', label: 'Claro' },
    { value: 'dark', label: 'Oscuro' },
    { value: 'system', label: 'Sistema' }
];

const ThemeChoice = () => {
    const setTheme = useThemeStore((state) => state.set);
    const [preference, setPreference] = useState<ThemePreference>(readPreference);

    const choose = (next: ThemePreference) => {
        setPreference(next);
        if(next !== 'system'){
            setTheme(next);
            return;
        }
        setTheme(systemTheme());
        rememberSystem();
    };

    return <Segmented label='Apariencia' choices={CHOICES} value={preference} onChange={choose} />;
};

export default ThemeChoice;
