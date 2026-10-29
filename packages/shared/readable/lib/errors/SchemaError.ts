import { defineErrors } from '../utils/errors/define-errors';

export const SchemaError = defineErrors({
    domain: 'Schema',
    causes: {
        PendingMigrations: 500,
        Irreversible: 500
    }
});
