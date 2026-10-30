import { Calendar, ChartMultitype, Dashboard, Debug, Filter, Flow, HeatMap, Screen, Settings } from '@carbon/icons-react';
import { ComponentType } from 'react';

export interface View{
    segment: string;
    label: string;
    icon: ComponentType;
}

export const VIEWS: View[] = [
    { segment: '', label: 'Resumen', icon: Dashboard },
    { segment: 'sesiones', label: 'Sesiones', icon: Screen },
    { segment: 'eventos', label: 'Eventos', icon: ChartMultitype },
    { segment: 'mapas-de-calor', label: 'Mapas de calor', icon: HeatMap },
    { segment: 'embudos', label: 'Embudos', icon: Filter },
    { segment: 'recorridos', label: 'Recorridos', icon: Flow },
    { segment: 'retencion', label: 'Retención', icon: Calendar },
    { segment: 'errores', label: 'Errores', icon: Debug }
];

export const SETTINGS_VIEW: View = { segment: 'ajustes', label: 'Ajustes de la app', icon: Settings };

export const viewPath = (projectId: string, segment: string): string => segment === '' ? `/${projectId}` : `/${projectId}/${segment}`;
