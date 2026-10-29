import { getEventGroup, getEvents } from '../decorators/queues/EventGroup';
import { EventError } from '../errors/Event';
import { eventBus } from './EventBus';

type EventHandler = (payload: unknown) => unknown;

export const registerEventGroup = (GroupClass: new () => object) => {
    const group = getEventGroup(GroupClass);
    if(!group) throw EventError.UndefinedGroup();

    const instance = new GroupClass() as Record<string | symbol, EventHandler>;

    for(const { event, handlerName } of getEvents(GroupClass)){
        eventBus.subscribe(`${group}.${event}`, instance[handlerName].bind(instance));
    }
};
