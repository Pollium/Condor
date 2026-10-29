import ErrorFingerprintService from './ErrorFingerprint';
import Issue from '@/modules/issues/models/Issue';
import Event from '../models/Event';
import { tableRef } from '@readable/utils/models/table-ref';
import { IngestBatchJob, IngestEvent } from '@/modules/tracking/contracts/domain/queue';
import { eventsOfType, IngestOf } from '../contracts/domain/ingest';
import { EntityManager, In } from 'typeorm';

type ErrorEvent = IngestOf<'error'>;

interface IssueRow{
    id: string;
}

export default class IssueGrouperService{
    #fingerprints = new ErrorFingerprintService();

    async group(manager: EntityManager, job: IngestBatchJob, events: IngestEvent[]){
        const groups = this.#byFingerprint(eventsOfType(events, 'error'));

        const ordered = [...groups].sort(([left], [right]) => left.localeCompare(right));
        for(const [fingerprint, occurrences] of ordered){
            const issueId = await this.#upsert(manager, job, fingerprint, occurrences);
            await manager.update(Event, { id: In(occurrences.map((occurrence) => occurrence.id)) }, { name: issueId });
        }
    }

    #byFingerprint(errors: ErrorEvent[]): Map<string, ErrorEvent[]>{
        const groups = new Map<string, ErrorEvent[]>();
        for(const error of errors){
            const fingerprint = this.#fingerprints.of(error);
            groups.set(fingerprint, [...groups.get(fingerprint) ?? [], error]);
        }

        return groups;
    }

    async #upsert(manager: EntityManager, job: IngestBatchJob, fingerprint: string, occurrences: ErrorEvent[]): Promise<string>{
        const ordered = [...occurrences].sort((left, right) => left.timestamp - right.timestamp);
        const first = ordered[0];
        const last = ordered[ordered.length - 1];

        const [issue] = await manager.query<IssueRow[]>(`
            INSERT INTO ${tableRef(manager, Issue).table} AS issue (
                "projectId", fingerprint, "errorType", message, source, stack, status, occurrences,
                "firstSeenAt", "lastSeenAt", "firstRelease", "lastRelease"
            )
            VALUES ($1, $2, $3, $4, $5, $6, 'open', $7, $8, $9, $10, $10)
            ON CONFLICT ("projectId", fingerprint) DO UPDATE SET
                occurrences = issue.occurrences + EXCLUDED.occurrences,
                "firstSeenAt" = LEAST(issue."firstSeenAt", EXCLUDED."firstSeenAt"),
                "lastSeenAt" = GREATEST(issue."lastSeenAt", EXCLUDED."lastSeenAt"),
                "firstRelease" = COALESCE(issue."firstRelease", EXCLUDED."firstRelease"),
                "lastRelease" = CASE
                    WHEN EXCLUDED."lastSeenAt" >= issue."lastSeenAt" THEN COALESCE(EXCLUDED."lastRelease", issue."lastRelease")
                    ELSE issue."lastRelease"
                END,
                stack = COALESCE(EXCLUDED.stack, issue.stack),
                status = CASE
                    WHEN issue.status = 'resolved' AND EXCLUDED."lastSeenAt" > COALESCE(issue."resolvedAt", '-infinity'::timestamptz) THEN 'open'
                    ELSE issue.status
                END,
                "regressedAt" = CASE
                    WHEN issue.status = 'resolved' AND EXCLUDED."lastSeenAt" > COALESCE(issue."resolvedAt", '-infinity'::timestamptz) THEN EXCLUDED."lastSeenAt"
                    ELSE issue."regressedAt"
                END,
                "updatedAt" = now()
            RETURNING id
        `, [
            job.projectId,
            fingerprint,
            first.errorType,
            first.message,
            first.source ?? null,
            last.stack ?? null,
            ordered.length,
            new Date(first.timestamp),
            new Date(last.timestamp),
            job.context.release
        ]);

        return issue.id;
    }
}
