export interface EventBinding{
    event: string;
    handlerName: string | symbol;
}

declare global{
    interface EventMap{}
}
