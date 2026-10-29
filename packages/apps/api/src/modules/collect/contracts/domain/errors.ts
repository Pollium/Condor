import { defineErrors } from '@readable/utils/errors/define-errors';
import { IngestErrors } from '@condor/contracts/ingest/errors';

export const IngestError = defineErrors(IngestErrors);

export const ScriptError = defineErrors({
    domain: 'Script',
    causes: {
        Missing: 404
    }
} as const);
