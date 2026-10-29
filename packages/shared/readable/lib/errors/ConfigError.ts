import { defineErrors } from '../utils/errors/define-errors';

export const ConfigError = defineErrors({
    domain: 'Config',
    causes: {
        MissingEnv: 500,
        InvalidEncryptionKey: 500
    }
});
