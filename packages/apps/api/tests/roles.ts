import { Role } from '@condor/contracts/auth/domain';
import { seed } from './Seed';

export const actor = async (role: Role = 'owner'): Promise<string> => (await seed.user(role)).id;
