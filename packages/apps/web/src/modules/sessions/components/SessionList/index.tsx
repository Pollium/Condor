import { SessionSummary } from '@condor/contracts/sessions/domain';
import { Screen } from '@carbon/icons-react';
import type { KeyboardEvent } from 'react';
import ActivityStrip from '@/modules/sessions/components/ActivityStrip';
import { copy } from '@/modules/sessions/i18n';
import { DEVICE_LABELS, initials, join, personName, place } from '@/modules/sessions/utils/labels';
import EmptyState from '@/shared/components/EmptyState';
import { RowList } from '@/shared/components/RowList';
import { copy as shared } from '@/shared/i18n';
import { fmt } from '@/shared/utils/format';

interface SessionListProps{
    sessions: SessionSummary[];
    narrowed: boolean;
    onOpen: (id: string) => void;
    onPeek: (session: SessionSummary) => void;
}

const notes = (session: SessionSummary) => join(
    session.live && copy.live,
    session.signals.errors > 0 && copy.counts.errors(session.signals.errors),
    session.signals.rage > 0 && copy.sessionList.rage,
    session.signals.dead > 0 && copy.sessionList.dead,
    session.converted && copy.sessionList.converted,
    !session.hasReplay && copy.sessionList.noReplay
);

const SessionList = ({ sessions, narrowed, onOpen, onPeek }: SessionListProps) => {
    const peek = (event: KeyboardEvent<HTMLDivElement>) => {
        if(event.key !== ' ') return;
        const item = (event.target as HTMLElement).closest('li');
        const index = item?.parentElement ? Array.from(item.parentElement.children).indexOf(item) : -1;
        if(index < 0 || !sessions[index]) return;
        event.preventDefault();
        event.stopPropagation();
        onPeek(sessions[index]);
    };

    return (
        <div onKeyDownCapture={peek}>
            <RowList
                label={shared.views.sessions}
                onOpen={onOpen}
                valueClassName='max-w-[42%] sm:w-60 sm:max-w-none'
                empty={
                    <EmptyState
                        compact
                        icon={Screen}
                        title={narrowed ? copy.sessionList.noMatch : copy.sessionList.empty}
                        description={narrowed ? copy.sessionList.noMatchHint : copy.sessionList.emptyHint}
                    />
                }
                rows={sessions.map((session) => ({
                    id: session.id,
                    text: personName(session),
                    leading: (
                        <span aria-hidden className='relative flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-[0.6875rem] text-foreground'>
                            {initials(session)}
                            {session.live ? <span className='absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-background bg-foreground' /> : null}
                        </span>
                    ),
                    title: personName(session),
                    subtitle: join(session.live ? copy.sessionList.at(session.currentPath ?? session.entryPath ?? '/') : fmt.ago(session.startedAt), place(session), DEVICE_LABELS[session.device], session.os, session.browser, copy.pages(session.pageviews)),
                    trailing: (
                        <span className='hidden md:block'>
                            <ActivityStrip values={session.activity} />
                        </span>
                    ),
                    value: fmt.clock(session.duration),
                    meta: notes(session) || ' '
                }))}
            />
        </div>
    );
};

export default SessionList;
