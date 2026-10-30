import { IssueDetail as Detail, IssueStatus } from '@condor/contracts/issues/domain';
import { InlineNotification } from '@carbon/react';
import IssueActions from '@/modules/issues/components/IssueActions';
import { copy } from '@/modules/issues/i18n';
import { hourlyBars, shortSource, STATES } from '@/modules/issues/utils/issue-copy';
import { BarsChart } from '@/shared/components/Charts';
import Code from '@/shared/components/Code';
import { Section } from '@/shared/components/Page';
import StatTile, { StatRow } from '@/shared/components/StatTile';
import { fmt } from '@/shared/utils/format';

interface IssueDetailProps{
    issue: Detail;
    editable: boolean;
    busy: boolean;
    failure: string | null;
    onStatus: (status: IssueStatus) => void;
}

const IssueDetail = ({ issue, editable, busy, failure, onStatus }: IssueDetailProps) => {
    const meta = [STATES[issue.state], issue.errorType, issue.lastRelease, shortSource(issue.source)].filter(Boolean).join(' · ');

    return (
        <section className='flex min-w-0 flex-col gap-8 lg:border-l lg:border-separator lg:pl-10'>
            <div className='flex flex-wrap items-start justify-between gap-4'>
                <div className='min-w-0 max-w-3xl'>
                    <h2 className='break-words text-[1.25rem] font-normal leading-snug text-foreground'>{issue.message}</h2>
                    <p className='mt-1 break-words text-[0.8125rem] text-label-2'>{meta}</p>
                </div>
                <IssueActions issue={issue} editable={editable} busy={busy} onStatus={onStatus} />
            </div>

            {failure ? <InlineNotification kind='error' lowContrast hideCloseButton title={failure} /> : null}

            <StatRow columns={4}>
                <StatTile label={copy.detail.occurrences} value={fmt.n(issue.occurrences)} />
                <StatTile label={copy.detail.sessions} value={fmt.n(issue.sessions)} />
                <StatTile label={copy.detail.people} value={fmt.n(issue.people)} />
                <StatTile label={copy.detail.since} value={fmt.day(issue.firstSeenAt)} hint={copy.detail.lastSeen(fmt.ago(issue.lastSeenAt))} />
            </StatRow>

            <Section title={copy.detail.lastDay}>
                <BarsChart data={hourlyBars(issue.hourly)} unit={copy.detail.occurrences} className='h-40' />
            </Section>

            <Section title={copy.detail.trace}>
                <Code>{issue.stack ?? `${issue.errorType}: ${issue.message}`}</Code>
            </Section>
        </section>
    );
};

export default IssueDetail;
