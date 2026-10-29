import 'reflect-metadata';
import 'dotenv/config';

import createApp from '@/core/Application';
import User from '@/modules/users/models/User';
import PasswordService from '@readable/auth/PasswordService';

const [email, password] = process.argv.slice(2);

const run = async (): Promise<number> => {
    if(email === undefined || password === undefined){
        console.error('Usage: pnpm --filter @condor/api set-password <email> <password>');
        return 1;
    }

    const app = createApp();
    await app.build({ queues: false });

    try{
        const user = await User.findOneBy({ email: email.toLowerCase() });
        if(user === null){
            console.error(`No member with email ${email}`);
            return 1;
        }

        user.passwordHash = await new PasswordService().hash(password);
        await user.save();
        console.log(`Password set for ${user.email}`);
        return 0;
    }finally{
        await app.stop();
    }
};

process.exitCode = await run();
