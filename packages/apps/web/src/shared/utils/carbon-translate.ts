import { copy } from '@/shared/i18n';

const MESSAGES: Record<string, string> = copy.carbon;

export const translate = (id: string) => MESSAGES[id] ?? id;
