import { Button } from '@carbon/react';
import { Link, Screen } from '@carbon/icons-react';
import { useQuery } from '@condor/ui/hooks/api/use-query';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ReplayPanel from '@/modules/sessions/components/ReplayPanel';
import ReplayView from '@/modules/sessions/components/ReplayView';
import SessionStats from '@/modules/sessions/components/SessionStats';
import { sessionsApi } from '@/modules/sessions/api/api';
import { useRecording } from '@/modules/sessions/hooks/use-recording';
import { useReplayer } from '@/modules/sessions/hooks/use-replayer';
import { copy } from '@/modules/sessions/i18n';
import { DEVICE_LABELS, join, personName, place } from '@/modules/sessions/utils/labels';
import { pageAt } from '@/modules/sessions/utils/timeline';
import { useProject } from '@/modules/projects/hooks/use-workspace';
import EmptyState from '@/shared/components/EmptyState';
import { PageHeader } from '@/shared/components/Page';
import { copy as shared } from '@/shared/i18n';
import { errorCopy } from '@/shared/utils/error-copy';
import { fmt } from '@/shared/utils/format';
import { viewPath } from '@/shared/utils/views';

const failure = errorCopy({ 'Session::NotFound': copy.errors.notFound });

const IGNORED = 'input, textarea, select, button, a, [contenteditable], [role="listbox"], [role="combobox"], [role="menu"], [role="tab"], [role="dialog"]';

const ReplayPage = () => {
    const project = useProject();
    const { sessionId } = useParams();
    const [params] = useSearchParams();
    const detail = useQuery(sessionsApi.get, [project.id, sessionId]);
    const session = detail.data;
    const { recording, state, lead, marks } = useRecording(project.id, session);
    const player = useReplayer(recording, Math.max(0, Number(params.get('t')) || 0) * 1000);
    const [copied, setCopied] = useState(false);
    const back = { to: viewPath(project.id, 'sesiones'), label: shared.views.sessions };
    const { toggle, ready } = player;

    useEffect(() => {
        if(!ready) return;
        const onKey = (event: KeyboardEvent) => {
            if(event.key !== ' ' || (event.target as HTMLElement).closest(IGNORED)) return;
            event.preventDefault();
            toggle();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [ready, toggle]);

    if(!session){
        return (
            <div className='w-full'>
                <PageHeader back={back} title={copy.session.title} />
                {detail.error ? <EmptyState icon={Screen} title={copy.session.openFailed} description={failure(detail.error) ?? undefined} /> : null}
            </div>
        );
    }

    const page = pageAt(session.timeline, player.ready ? player.time + lead : null);

    const copyLink = async () => {
        const link = new URL(window.location.href);
        link.search = player.ready ? `?t=${Math.floor(player.time / 1000)}` : '';
        try{
            await navigator.clipboard.writeText(link.toString());
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
        }catch{
            setCopied(false);
        }
    };

    return (
        <div className='w-full'>
            <PageHeader
                back={back}
                title={personName(session)}
                hint={join(session.email ?? (session.userId ? null : session.anonymousId), place(session), DEVICE_LABELS[session.device], session.os, session.browser, `${fmt.day(session.startedAt)} ${fmt.time(session.startedAt)}`, session.live && copy.live)}
            >
                <Button kind='ghost' size='sm' renderIcon={Link} onClick={copyLink}>
                    {copied ? copy.session.linkCopied : copy.session.copyLink}
                </Button>
            </PageHeader>

            <div className='grid gap-x-8 gap-y-10 xl:grid-cols-[minmax(0,1fr)_25rem]'>
                <div className='flex min-w-0 flex-col gap-10'>
                    <ReplayView player={player} marks={marks} address={`${project.host}${page ?? session.entryPath ?? '/'}`} state={state} />
                    <SessionStats session={session} />
                </div>
                <ReplayPanel session={session} recording={recording} lead={lead} player={player} />
            </div>
        </div>
    );
};

export default ReplayPage;
