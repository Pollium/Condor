import { liveGateway, LiveFrames } from '@condor/contracts/live/gateway';

declare module '@condor/ui/contracts/channel'{
    interface ChannelMap{
        [liveGateway.channel]: LiveFrames & { 'live.watch': LiveFrames['live.snapshot'] };
    }
}
