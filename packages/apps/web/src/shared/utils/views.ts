import { Calendar, ChartMultitype, Dashboard, Debug, Filter, Flow, HeatMap, Screen, Settings } from '@carbon/icons-react';
import { copy } from '@/shared/i18n';
import { ComponentType } from 'react';

export interface View{
    segment: string;
    label: string;
    icon: ComponentType;
}

export const VIEWS: View[] = [
    { segment: '', label: copy.views.overview, icon: Dashboard },
    { segment: 'sesiones', label: copy.views.sessions, icon: Screen },
    { segment: 'eventos', label: copy.views.events, icon: ChartMultitype },
    { segment: 'mapas-de-calor', label: copy.views.heatmaps, icon: HeatMap },
    { segment: 'embudos', label: copy.views.funnels, icon: Filter },
    { segment: 'recorridos', label: copy.views.journeys, icon: Flow },
    { segment: 'retencion', label: copy.views.retention, icon: Calendar },
    { segment: 'errores', label: copy.views.issues, icon: Debug }
];

export const SETTINGS_VIEW: View = { segment: 'ajustes', label: copy.views.settings, icon: Settings };

export const viewPath = (projectId: string, segment: string): string => segment === '' ? `/${projectId}` : `/${projectId}/${segment}`;
