import BaseController from '../lib/controllers/BaseController';
import { Controller, getControllerPrefix } from '../lib/decorators/controllers/Controller';
import { Reply } from '../lib/decorators/controllers/Params';
import { Route, routesByController } from '../lib/decorators/controllers/Route';
import Fastify, { FastifyReply } from 'fastify';
import { describe, expect, it } from 'vitest';

class Recorded{
    @Route('/x', { method: 'POST', wrap: false, bodyLimit: 10 })
    handle(){}

    @Route('/y', 'PATCH')
    legacy(){}
}

@Controller('')
class Root{}

@Controller('')
class ProbeController extends BaseController{
    @Route('/wrapped')
    wrapped(){
        return { ok: true };
    }

    @Route('/bare', { wrap: false })
    bare(){
        return { ok: true };
    }

    @Route('/hijack', { wrap: false })
    hijack(@Reply() reply: FastifyReply){
        return reply.send({ hijacked: true });
    }
}

describe('Route options', () => {
    it('records wrap and bodyLimit on the options form', () => {
        const [route] = routesByController.get(Recorded);

        expect(route).toMatchObject({
            path: '/x',
            method: 'POST',
            wrap: false,
            bodyLimit: 10,
            absolute: false
        });
    });

    it('keeps the string method form wrapping by default', () => {
        const route = routesByController.get(Recorded)[1];

        expect(route).toMatchObject({ path: '/y', method: 'PATCH', wrap: true });
    });
});

describe('Controller prefix', () => {
    it('stores an explicit prefix including root', () => {
        expect(getControllerPrefix(Root)).toBe('');
    });
});

describe('BaseController wrap', () => {
    it('envelopes by default and passes through when wrap is false', async () => {
        const app = Fastify();
        await new ProbeController().register(app, '');

        const wrapped = await app.inject({ method: 'GET', url: '/wrapped' });
        const bare = await app.inject({ method: 'GET', url: '/bare' });

        expect(wrapped.json()).toEqual({ data: { ok: true } });
        expect(bare.json()).toEqual({ ok: true });

        const hijack = await app.inject({ method: 'GET', url: '/hijack' });
        expect(hijack.json()).toEqual({ hijacked: true });

        await app.close();
    });
});
