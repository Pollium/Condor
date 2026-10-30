import { copy } from '@/modules/account/i18n';
import Segmented, { type Choice } from '@/shared/components/Segmented';
import { locale } from '@/shared/i18n/locale';
import { Locale } from '@condor/ui/contracts/locale';
import { switchLocale } from '@condor/ui/utils/session/locale';

const CHOICES: Choice<Locale>[] = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
    { value: 'pt', label: 'Português' }
];

const LanguageChoice = () => (
    <Segmented label={copy.language} choices={CHOICES} value={locale} onChange={(next) => next !== locale && switchLocale(next)} />
);

export default LanguageChoice;
