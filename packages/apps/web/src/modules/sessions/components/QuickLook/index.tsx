import { SessionSummary } from '@condor/contracts/sessions/domain';
import { Button } from '@carbon/react';
import { useQuery } from '@condor/ui/hooks/api/use-query';
import { createPortal } from 'react-dom';
import ReplayView from '@/modules/sessions/components/ReplayView';
import { sessionsApi } from '@/modules/sessions/api/api';
import { useRecording } from '@/modules/sessions/hooks/use-recording';
import { useReplayer } from '@/modules/sessions/hooks/use-replayer';
import { DEVICE_LABELS, join, personName, place } from '@/modules/sessions/utils/labels';
import { pageAt } from '@/modules/sessions/utils/timeline';
import Modal from '@/shared/components/Modal';
import { fmt } from '@/shared/utils/format';

interface QuickLookProps{
    projectId: string;
    host: string;
    session: SessionSummary;
    onClose: () => void;
    onOpen: () => void;
}

const QuickLook = ({ projectId, host, session, onClose, onOpen }: QuickLookProps) => {
    const detail = useQuery(sessionsApi.get, [projectId, session.id]);
    const { recording, state, lead, marks } = useRecording(projectId, detail.data);
    const player = useReplayer(recording);

    return createPortal(
        <Modal isOpen onOpenChange={(open) => !open && onClose()} title={personName(session)} width='lg'>
            <div className='flex flex-col gap-4'>
                <ReplayView player={player} marks={marks} address={`${host}${(detail.data && player.ready ? pageAt(detail.data.timeline, player.time + lead) : null) ?? session.entryPath ?? '/'}`} state={detail.data ? state : 'loading'} fit={0.5} />
                <div className='flex flex-wrap items-center justify-between gap-3'>
                    <p className='text-[0.8125rem] text-label-2'>
                        {join(place(session), DEVICE_LABELS[session.device], session.os, fmt.duration(session.duration))}
                    </p>
                    <Button size='sm' onClick={onOpen}>
                        Abrir sesión
                    </Button>
                </div>
            </div>
        </Modal>,
        document.body
    );
};

export default QuickLook;
