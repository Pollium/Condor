import Project from '@/modules/projects/models/Project';
import Person from '@/modules/sessions/models/Person';
import { tableRef } from '@readable/utils/models/table-ref';
import { TraitSummary } from '@condor/contracts/events/domain';

const HIDDEN = ['name', 'email'];
const KEY_LIMIT = 30;
const VALUE_LIMIT = 12;

interface TraitRow{
    key: string;
    keyPeople: string;
    value: string;
    people: string;
}

export default class TraitCatalogService{
    async list(project: Project): Promise<TraitSummary[]>{
        const manager = Person.getRepository().manager;
        const rows = await manager.query<TraitRow[]>(`
            WITH pairs AS (
                SELECT trait.key, trait.value #>> '{}' AS value
                FROM ${tableRef(manager, Person).table} p, jsonb_each(p.traits) AS trait(key, value)
                WHERE p."projectId" = $1
                    AND jsonb_typeof(trait.value) IN ('string', 'number', 'boolean')
                    AND NOT (trait.key = ANY($2::text[]))
            ),
            keys AS (
                SELECT key, COUNT(*) AS "keyPeople" FROM pairs GROUP BY key ORDER BY "keyPeople" DESC, key LIMIT ${KEY_LIMIT}
            ),
            ranked AS (
                SELECT pairs.key, keys."keyPeople", pairs.value, COUNT(*) AS people,
                    ROW_NUMBER() OVER (PARTITION BY pairs.key ORDER BY COUNT(*) DESC, pairs.value) AS rank
                FROM pairs JOIN keys ON keys.key = pairs.key
                GROUP BY pairs.key, keys."keyPeople", pairs.value
            )
            SELECT key, "keyPeople", value, people FROM ranked WHERE rank <= ${VALUE_LIMIT}
            ORDER BY "keyPeople" DESC, key, people DESC, value
        `, [project.id, HIDDEN]);

        const byKey = new Map<string, TraitSummary>();
        for(const row of rows){
            const summary = byKey.get(row.key) ?? { key: row.key, people: Number(row.keyPeople), values: [] };
            summary.values.push({ value: row.value, people: Number(row.people) });
            byKey.set(row.key, summary);
        }

        return [...byKey.values()];
    }
}
