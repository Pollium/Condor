import { Accordion, AccordionItem, Button } from '@carbon/react';
import { env } from '@condor/ui/config/env';
import RotateKey from '@/modules/projects/components/RotateKey';
import { Group, Row } from '@/modules/projects/components/SettingsRows';
import { useCopy } from '@/modules/projects/hooks/use-copy';
import { useProject } from '@/modules/projects/hooks/use-workspace';
import { httpSnippet, npmSnippet, scriptSnippet } from '@/modules/projects/utils/snippets';
import Code from '@/shared/components/Code';
import Segmented from '@/shared/components/Segmented';
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

const NOTES: Record<Variant, string> = {
    script: 'Pega el fragmento antes de </head> en todas las páginas.',
    npm: 'Inicializa el SDK una vez al arrancar tu app.',
    http: 'Cualquier lenguaje sirve: es un POST con la clave pública.'
};

const InstallGroup = ({ disabled }: { disabled: boolean }) => {
    const project = useProject();
    const { copied, copy } = useCopy();
    const [variant, setVariant] = useState<Variant>(project.platform === 'web' ? 'script' : 'http');
    const [rotating, setRotating] = useState(false);
    const snippet = SNIPPETS[variant](env.ingestUrl, project.publicKey);

    return (
        <Group title='Instalación' note={NOTES[variant]}>
            <Row label='Clave pública' detail={<span className='font-mono'>{project.publicKey}</span>}>
                <Button kind='ghost' size='sm' onClick={() => copy('key', project.publicKey)} className='-mr-4'>
                    {copied === 'key' ? 'Copiada' : 'Copiar'}
                </Button>
            </Row>
            <Row label='Fragmento de instalación' detail={VARIANTS.find((entry) => entry.value === variant)?.label}>
                <Button kind='ghost' size='sm' onClick={() => copy('snippet', snippet)} className='-mr-4'>
                    {copied === 'snippet' ? 'Copiado' : 'Copiar'}
                </Button>
            </Row>
            <Accordion size='sm' className='accordion-flush'>
                <AccordionItem title='Ver el código'>
                    <div className='flex flex-col gap-3'>
                        <Segmented label='Variante' choices={VARIANTS} value={variant} onChange={setVariant} />
                        <Code>{snippet}</Code>
                    </div>
                </AccordionItem>
            </Accordion>
            <Row label='Rotar la clave' detail='La clave actual deja de funcionar al instante.'>
                <Button kind='danger--ghost' size='sm' disabled={disabled} onClick={() => setRotating(true)} className='-mr-4'>
                    Rotar
                </Button>
            </Row>
            <RotateKey open={rotating} onClose={() => setRotating(false)} />
        </Group>
    );
};

export default InstallGroup;
