import 'reflect-metadata';
import 'dotenv/config';

import createApp from '@/core/Application';
import { listen } from '@readable/http/listen';

listen(createApp());
