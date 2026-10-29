import { Principal } from './types';

declare module 'fastify'{
    interface FastifyRequest{
        principal?: Principal;
    }
}
