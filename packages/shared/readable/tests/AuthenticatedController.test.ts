import AuthenticatedController from '../lib/auth/AuthenticatedController';
import { Route } from '../lib/decorators/controllers/Route';
import Fastify from 'fastify';
import { describe, expect, it } from 'vitest';

class ProbeController extends AuthenticatedController{
    @Route('/probe')
    probe(){
        return { reached: true };
    }
}

describe('AuthenticatedController', () => {
    it('refuses a request with no token before the handler runs', async () => {
        const app = Fastify();
        await new ProbeController().register(app, '');

        const res = await app.inject({ method: 'GET', url: '/probe' });

        expect(res.statusCode).toBe(401);
        expect(res.json()).toMatchObject({ message: 'Auth::Unauthorized' });

        await app.close();
    });
});
