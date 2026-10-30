import { Accordion, AccordionItem, Button } from '@carbon/react';
import { env } from '@condor/ui/config/env';
import RotateKey from '@/modules/projects/components/RotateKey';
import { Group, Row } from '@/modules/projects/components/SettingsRows';
import { useCopy } from '@/modules/projects/hooks/use-copy';
import { useProject } from '@/modules/projects/hooks/use-workspace';
import { copy } from '@/modules/projects/i18n';
import { httpSnippet, npmSnippet, scriptSnippet } from '@/modules/projects/utils/snippets';
import Code from '@/shared/components/Code';
import Segmented from '@/shared/components/Segmented';
import { copy as shared } from '@/shared/i18n';
import { useState } from 'react';

type Variant = 'script' | 'npm' | 'http';

const VARIANTS: { value: Variant; label: string }[] = [
    { value: 'script', label: 'Script' },
    { value: 'npm', label: 'npm' },
    { value: 'http', label: 'HTTP' }
];

const SNIPPETS: Record<Variant, (origin: string, key: string) => string> = {
    script: scriptSnippet,
    npm: npmSnippet,
    http: httpSnippet
};

const NOTES: Record<Variant, string> = copy.install.notes;

const InstallGroup = ({ disabled }: { disabled: boolean }) => {
    const project = useProject();
    const { copied, copy: copyText } = useCopy();
    const [variant, setVariant] = useState<Variant>(project.platform === 'web' ? 'script' : 'http');
    const [rotating, setRotating] = useState(false);
    const snippet = SNIPPETS[variant](env.ingestUrl, project.publicKey);

    return (
        <Group title={copy.install.title} note={NOTES[variant]}>
            <Row label={copy.install.publicKey} detail={<span className='font-mono'>{project.publicKey}</span>}>
                <Button kind='ghost' size='sm' onClick={() => copyText('key', project.publicKey)} className='-mr-4'>
                    {copied === 'key' ? copy.install.keyCopied : shared.copy}
                </Button>
            </Row>
            <Row label={copy.install.snippet} detail={VARIANTS.find((entry) => entry.value === variant)?.label}>
                <Button kind='ghost' size='sm' onClick={() => copyText('snippet', snippet)} className='-mr-4'>
                    {copied === 'snippet' ? shared.copied : shared.copy}
                </Button>
            </Row>
            <Accordion size='sm' className='accordion-flush'>
                <AccordionItem title={copy.install.showCode}>
                    <div className='flex flex-col gap-3'>
                        <Segmented label={copy.install.variant} choices={VARIANTS} value={variant} onChange={setVariant} />
                        <Code>{snippet}</Code>
                    </div>
                </AccordionItem>
            </Accordion>
            <Row label={copy.install.rotate} detail={copy.install.rotateDetail}>
                <Button kind='danger--ghost' size='sm' disabled={disabled} onClick={() => setRotating(true)} className='-mr-4'>
                    {copy.install.rotateAction}
                </Button>
            </Row>
            <RotateKey open={rotating} onClose={() => setRotating(false)} />
        </Group>
    );
};

export default InstallGroup;
