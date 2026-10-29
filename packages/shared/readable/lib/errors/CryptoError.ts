import { defineErrors } from '../utils/errors/define-errors';

export const CryptoError = defineErrors({
    domain: 'Crypto',
    causes: {
        EncryptFailed: 400,
        DecryptFailed: 500
    }
});
