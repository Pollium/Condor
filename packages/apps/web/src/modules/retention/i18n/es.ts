import { fmt } from '@/shared/utils/format';

const people = (count: number) => `${fmt.n(count)} ${count === 1 ? 'persona' : 'personas'}`;

export default {
    people,
    units: {
        day: { short: 'D', one: 'el día', column: 'Día' },
        week: { short: 'S', one: 'la semana', column: 'Semana del' }
    },
    page: {
        hint: 'Personas que vuelven tras su primera visita',
        grains: {
            day: 'Día',
            week: 'Semana'
        },
        anyVisit: 'Cualquier visita',
        returnEvent: 'Cuenta como regreso',
        groupBy: 'Agrupar por',
        failed: 'No pudimos calcular la retención',
        retry: 'Reintentar',
        loading: 'Agrupando a las personas por cohorte…',
        emptyTitle: 'Aún no hay cohortes',
        emptyHint: 'Cuando lleguen personas nuevas a tu app verás aquí cuántas vuelven cada día o semana.',
        curve: 'Curva de retención',
        returning: 'Vuelven',
        cohorts: {
            day: 'Cohortes diarias',
            week: 'Cohortes semanales'
        },
        cohortsHint: {
            day: '% de cada cohorte que vuelve ese día',
            week: '% de cada cohorte que vuelve esa semana'
        }
    },
    stats: {
        returnIn: (unit: string, index: number) => `Vuelven ${unit} ${index}`,
        stillIn: (unit: string, index: number) => `Siguen ${unit} ${index}`,
        notThatFar: 'Aún no hay cohortes que lleguen tan lejos',
        weightedAverage: (count: number) => `Media ponderada de ${count} ${count === 1 ? 'cohorte' : 'cohortes'}`,
        best: 'Mejor cohorte',
        bestStart: {
            day: (day: string) => `Llegó el ${day}`,
            week: (day: string) => `Semana del ${day}`
        },
        noneBack: 'Aún no hay cohortes que vuelvan'
    },
    grid: {
        people: 'Personas',
        cell: (returned: number, size: number, unit: string, index: number) => `${fmt.n(returned)} de ${people(size)} en ${unit} ${index}`
    }
};
