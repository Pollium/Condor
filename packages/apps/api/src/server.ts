import 'reflect-metadata';
import 'dotenv/config';

import createApp from '@/core/Application';
import { listen } from '@pollium/readable/app/Application';

listen(createApp());
