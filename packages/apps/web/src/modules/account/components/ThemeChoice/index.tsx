import { copy } from '@/modules/account/i18n';
import { readPreference, rememberSystem, systemTheme, type ThemePreference } from '@/modules/account/utils/theme-preference';
import Segmented from '@/shared/components/Segmented';
import { useThemeStore } from '@condor/ui/store/theme';
import { useState } from 'react';

const CHOICES: { value: ThemePreference; label: string }[] = [
    { value: 'light', label: copy.themes.light },
    { value: 'dark', label: copy.themes.dark },
    { value: 'system', label: copy.themes.system }
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

    return <Segmented label={copy.appearance} choices={CHOICES} value={preference} onChange={choose} />;
};

export default ThemeChoice;
