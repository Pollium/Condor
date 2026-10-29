import { InlineLoading } from '@carbon/react';
import { VideoOff } from '@carbon/icons-react';
import ReplayControls, { type Mark } from '@/modules/sessions/components/ReplayControls';
import ReplayStage from '@/modules/sessions/components/ReplayStage';
import type { Player } from '@/modules/sessions/hooks/use-replayer';
import EmptyState from '@/shared/components/EmptyState';

interface ReplayViewProps{
    player: Player;
    marks: Mark[];
    address: string | null;
    state: 'ready' | 'loading' | 'missing' | 'failed';
    fit?: number;
}

const COPY = {
    missing: { title: 'Esta sesión no tiene grabación', description: 'La grabación estaba desactivada o la página no la permitió. Los eventos y los datos de la persona siguen disponibles.' },
    failed: { title: 'No pudimos cargar la grabación', description: 'Los eventos y los datos de la persona siguen disponibles. Vuelve a intentarlo en un momento.' }
};

const ReplayView = ({ player, marks, address, state, fit }: ReplayViewProps) => {
    if(state === 'ready'){
        return (
            <section className='flex flex-col gap-4'>
                <ReplayStage player={player} address={address} fit={fit} />
                <ReplayControls player={player} marks={marks} />
            </section>
        );
    }
    return (
        <section className='flex min-h-[16rem] flex-col justify-center border border-separator'>
            {state === 'loading' ? (
                <div className='px-6 py-16'>
                    <InlineLoading description='Cargando la grabación…' />
                </div>
            ) : (
                <EmptyState icon={VideoOff} title={COPY[state].title} description={COPY[state].description} />
            )}
        </section>
    );
};

export default ReplayView;
