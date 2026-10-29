import { Middleware, getClassMiddleware, getMiddleware } from '../lib/decorators/middleware/Middleware';
import { describe, expect, it } from 'vitest';

const root = () => {};
const branch = () => {};
const leaf = () => {};
const handler = () => {};

@Middleware(root)
abstract class Root{}

@Middleware(branch)
abstract class Branch extends Root{}

@Middleware(leaf)
class Leaf extends Branch{
    @Middleware(handler)
    handle(){}
}

describe('@Middleware inheritance', () => {
    it('runs inherited class middleware first, then the class own, then the handler', () => {
        expect(getMiddleware(Leaf, 'handle')).toEqual([root, branch, leaf, handler]);
        expect(getClassMiddleware(Leaf)).toEqual([root, branch, leaf]);
        expect(getClassMiddleware(Branch)).toEqual([root, branch]);
    });
});
