import { ProjectChangedPayload } from '../domain/project';

declare global{
    interface EventMap{
        'project.changed': ProjectChangedPayload;
    }
}
