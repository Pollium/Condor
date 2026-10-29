import { defineErrors } from '../utils/errors/define-errors';

export const EventError = defineErrors({
    domain: 'Events',
    causes: {
        UndefinedGroup: 500
    }
});