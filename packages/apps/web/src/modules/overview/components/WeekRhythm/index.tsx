import { SkeletonPlaceholder } from '@carbon/react';
import { HourCell } from '@condor/contracts/overview/domain';
import { useQuery } from '@condor/ui/hooks/api/use-query';
import { overviewApi } from '@/modules/overview/api/api';
import Loaded from '@/modules/overview/components/Loaded';
import Stats from '@/modules/overview/components/Stats';
import { useScope } from '@/modules/overview/hooks/use-scope';
import { WeekHeatmap, type HeatCell } from '@/shared/components/Charts';
import { fmt } from '@/shared/utils/format';

const WEEKDAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const filled = (hours: HourCell[]): HeatCell[] => {
    const counted = new Map(hours.map((cell) => [`${cell.weekday}-${cell.hour}`, cell.sessions]));
    return WEEKDAY_NAMES.flatMap((_, day) => Array.from({ length: 24 }, (__, hour) => ({
        isoWeekday: day + 1,
        hour,
        value: counted.get(`${day + 1}-${hour}`) ?? 0
    })));
};

const rhythm = (cells: HeatCell[]) => {
    const total = cells.reduce((sum, cell) => sum + cell.value, 0);
    if(total === 0) return [{ label: 'Hora pico', value: '—' }, { label: 'Día más activo', value: '—' }, { label: 'De noche, 20–02 h', value: '—' }];
    const peak = cells.reduce((best, cell) => cell.value > best.value ? cell : best);
    const byDay = WEEKDAY_NAMES.map((_, day) => cells.filter((cell) => cell.isoWeekday === day + 1).reduce((sum, cell) => sum + cell.value, 0));
    const busiest = byDay.indexOf(Math.max(...byDay));
    const night = cells.filter((cell) => cell.hour >= 20 || cell.hour < 2).reduce((sum, cell) => sum + cell.value, 0);
    return [
        { label: 'Hora pico', value: `${WEEKDAY_NAMES[peak.isoWeekday - 1].slice(0, 3)} ${String(peak.hour).padStart(2, '0')}:00` },
        { label: 'Día más activo', value: WEEKDAY_NAMES[busiest] },
        { label: 'De noche, 20–02 h', value: fmt.pct(night / total) }
    ];
};

const WeekRhythm = () => {
    const { projectId, period } = useScope();
    const query = useQuery(overviewApi.hours, [projectId, period]);

    return (
        <Loaded query={query} skeleton={<SkeletonPlaceholder className='h-64 w-full max-w-none' />}>
            {(hours) => {
                const cells = filled(hours);
                return (
                    <div className='flex flex-col gap-4'>
                        <WeekHeatmap cells={cells} unit='sesiones' />
                        <Stats items={rhythm(cells)} />
                    </div>
                );
            }}
        </Loaded>
    );
};

export default WeekRhythm;
