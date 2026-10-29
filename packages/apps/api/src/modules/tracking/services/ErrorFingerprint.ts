import { IngestOf } from '../contracts/domain/ingest';
import { createHash } from 'node:crypto';

const URLS = /\b[a-z][a-z0-9+.-]*:\/\/[^\s'"`)]+/gi;
const UUIDS = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;
const QUOTED = /(["'`])(?:(?!\1).)*\1/g;
const NUMBERS = /\b0x[0-9a-f]+\b|\d+(?:\.\d+)?/gi;
const FRAME = /^at\s|@.*:\d+(?::\d+)?\)?$/;
const LINE_COLUMN = /:\d+(?::\d+)?(?=\)?$)/;
const QUERY = /\?[^\s):]*/g;
const BUILD_HASH = /([-.])(?=[A-Za-z0-9_]*[A-Z0-9])[A-Za-z0-9_]{8,}(?=\.m?js\b)/g;

export default class ErrorFingerprintService{
    of(error: IngestOf<'error'>): string{
        const parts = [error.errorType, this.#normalize(error.message), this.#topFrame(error)];

        return createHash('sha1').update(parts.join('\n')).digest('hex');
    }

    #normalize(message: string): string{
        return message
            .replace(URLS, '<url>')
            .replace(UUIDS, '<uuid>')
            .replace(QUOTED, '<value>')
            .replace(NUMBERS, '<n>')
            .trim();
    }

    #topFrame(error: IngestOf<'error'>): string{
        const frame = error.stack
            ?.split('\n')
            .map((line) => line.trim())
            .find((line) => FRAME.test(line));

        return (frame ?? error.source ?? '')
            .replace(QUERY, '')
            .replace(LINE_COLUMN, '')
            .replace(BUILD_HASH, '$1<hash>');
    }
}
