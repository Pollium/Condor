export interface InboundFrame{
    type: string;
    [field: string]: unknown;
}

export interface OutboundMessage<T>{
    type: string;
    data: T;
}

export type GatewayLifecycle = 'connect' | 'disconnect';

interface MessageRoute{
    kind: 'message';
    type: string;
}

interface LifecycleRoute{
    kind: GatewayLifecycle;
}

export type GatewayRoute = MessageRoute | LifecycleRoute;

export type GatewayHandler = GatewayRoute & {
    handlerName: string | symbol;
};
