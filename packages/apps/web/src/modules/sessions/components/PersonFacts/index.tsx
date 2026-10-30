import { SessionDetail } from '@condor/contracts/sessions/domain';
import { Button } from '@carbon/react';
import { useNavigate } from 'react-router-dom';
import { sessionsApi } from '@/modules/sessions/api/api';
import { copy } from '@/modules/sessions/i18n';
import { CHANNEL_LABELS, DEVICE_LABELS, join, place } from '@/modules/sessions/utils/labels';
import { useProject } from '@/modules/projects/hooks/use-workspace';
import { RowList } from '@/shared/components/RowList';
import { copy as shared } from '@/shared/i18n';
import { intlLocale } from '@/shared/i18n/locale';
import { fmt } from '@/shared/utils/format';
import { viewPath } from '@/shared/utils/views';
import { useQuery } from '@condor/ui/hooks/api/use-query';

const day = new Intl.DateTimeFormat(intlLocale, { day: 'numeric', month: 'long', year: 'numeric' });

const Fact = ({ label, value }: { label: string; value: string | number | null | undefined }) =>
    value === null || value === undefined || value === '' ? null : (
        <div className='flex items-baseline justify-between gap-4 border-b border-separator py-2.5 last:border-b-0'>
            <dt className='shrink-0 text-[0.8125rem] text-label-2'>{label}</dt>
            <dd className='min-w-0 truncate text-right text-[0.875rem] text-foreground' title={String(value)}>{value}</dd>
        </div>
    );

const PersonFacts = ({ session }: { session: SessionDetail }) => {
    const project = useProject();
    const navigate = useNavigate();
    const person = useQuery(sessionsApi.person, [project.id, session.personId]);
    const others = (person.data?.recent ?? []).filter((entry) => entry.id !== session.id);
    const sessions = viewPath(project.id, 'sesiones');

    return (
        <div className='min-h-0 flex-1 overflow-y-auto px-4 py-3'>
            <dl>
                <Fact label={copy.person.name} value={session.name} />
                <Fact label={copy.person.email} value={session.email} />
                <Fact label={copy.person.userId} value={session.userId} />
                {Object.entries(session.person.traits).filter(([key]) => key !== 'name' && key !== 'email').map(([key, value]) => (
                    <Fact key={key} label={key} value={value === null ? null : String(value)} />
                ))}
                <Fact label={copy.person.place} value={place(session)} />
                <Fact label={copy.person.device} value={join(DEVICE_LABELS[session.device], session.screenWidth && session.screenHeight ? `${session.screenWidth} × ${session.screenHeight}` : null)} />
                <Fact label={copy.person.os} value={join(session.os, session.osVersion)} />
                <Fact label={copy.person.browser} value={join(session.browser, session.browserVersion)} />
                <Fact label={copy.person.language} value={session.language} />
                <Fact label={copy.person.timezone} value={session.timezone} />
                <Fact label={copy.person.connection} value={session.connection} />
                <Fact label={copy.person.channel} value={CHANNEL_LABELS[session.channel]} />
                <Fact label={copy.person.referrer} value={session.referrer ?? session.source} />
                <Fact label={copy.person.campaign} value={session.utmCampaign} />
                <Fact label={copy.person.release} value={session.release} />
                <Fact label={copy.person.firstSeen} value={day.format(new Date(session.person.firstSeenAt))} />
                <Fact label={shared.views.sessions} value={fmt.n(session.person.sessions)} />
                <Fact label={copy.person.anonymousId} value={session.anonymousId} />
            </dl>

            {others.length ? (
                <div className='mt-6 flex flex-col gap-2'>
                    <div className='flex items-center justify-between gap-2'>
                        <h3 className='text-[0.875rem] text-foreground'>{copy.person.others}</h3>
                        <Button kind='ghost' size='sm' onClick={() => navigate(`${sessions}?persona=${encodeURIComponent(session.personId)}`)}>
                            {copy.person.seeAll}
                        </Button>
                    </div>
                    <RowList
                        label={copy.person.others}
                        onOpen={(id) => navigate(`${sessions}/${id}`)}
                        rows={others.map((entry) => ({
                            id: entry.id,
                            text: entry.entryPath ?? entry.id,
                            title: entry.entryPath ?? '/',
                            subtitle: join(fmt.ago(entry.startedAt), DEVICE_LABELS[entry.device], copy.pages(entry.pageviews)),
                            value: fmt.clock(entry.duration),
                            meta: entry.live ? copy.live : entry.hasReplay ? copy.person.recorded : ' '
                        }))}
                    />
                </div>
            ) : null}
        </div>
    );
};

export default PersonFacts;
