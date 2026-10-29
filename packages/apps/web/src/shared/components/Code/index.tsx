import { CodeSnippet } from '@carbon/react';

const Code = ({ children, copy = true }: { children: string; copy?: boolean }) => (
    <CodeSnippet type='multi' hideCopyButton={!copy} feedback='Copiado' copyButtonDescription='Copiar' maxCollapsedNumberOfRows={16} wrapText={false} className='max-w-none'>
        {children}
    </CodeSnippet>
);

export default Code;
