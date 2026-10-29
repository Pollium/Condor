import { HeatMode, HeatWidth } from '@condor/contracts/heatmaps/domain';

export const HEAT_MODES: readonly HeatMode[] = ['clicks', 'rage', 'scroll'];

export const HEAT_WIDTHS: readonly HeatWidth[] = ['desktop', 'tablet', 'mobile'];

export interface HeatScope{
    projectId: string;
    path: string;
    from: Date;
    width: HeatWidth;
}
