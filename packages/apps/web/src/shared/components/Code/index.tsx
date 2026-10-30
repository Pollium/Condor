import { CodeSnippet } from '@carbon/react';
import { copy as words } from '@/shared/i18n';

const Code = ({ children, copy = true }: { children: string; copy?: boolean }) => (
    <CodeSnippet type='multi' hideCopyButton={!copy} feedback={words.copied} copyButtonDescription={words.copy} maxCollapsedNumberOfRows={16} wrapText={false} className='max-w-none'>
        {children}
    </CodeSnippet>
);

export default Code;
