import { logger } from '../utils/Logger';

export interface ListenTarget{
    start(): Promise<void>;
    stop(): Promise<void>;
}

export const listen = (app: ListenTarget, failed = 'Failed to start server') => {
    app.start().catch((err) => {
        logger.error(failed, err);
        process.exit(1);
    });

    for(const signal of ['SIGTERM', 'SIGINT'] as const){
        process.on(signal, () => {
            app.stop().finally(() => process.exit(0));
        });
    }
};
