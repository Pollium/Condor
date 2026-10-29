import jwt from 'jsonwebtoken';
import { jwtSecret } from '../config';
import { TokenPayload } from './types';

export default class JWTService{
    sign(userId: string): string{
        return jwt.sign({ sub: String(userId) }, jwtSecret(), { expiresIn: '7d' });
    }

    verify(token: string): TokenPayload{
        return jwt.verify(token, jwtSecret()) as TokenPayload;
    }
}
