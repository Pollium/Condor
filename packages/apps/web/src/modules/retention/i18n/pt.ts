import type es from '@/modules/retention/i18n/es';
import { fmt } from '@/shared/utils/format';

const people = (count: number) => `${fmt.n(count)} ${count === 1 ? 'pessoa' : 'pessoas'}`;

const pt: typeof es = {
    people,
    units: {
        day: { short: 'D', one: 'no dia', column: 'Dia' },
        week: { short: 'S', one: 'na semana', column: 'Semana de' }
    },
    page: {
        hint: 'Pessoas que voltam após a primeira visita',
        grains: {
            day: 'Dia',
            week: 'Semana'
        },
        anyVisit: 'Qualquer visita',
        returnEvent: 'Conta como retorno',
        groupBy: 'Agrupar por',
        failed: 'Não foi possível calcular a retenção',
        retry: 'Tentar novamente',
        loading: 'Agrupando as pessoas por coorte…',
        emptyTitle: 'Ainda não há coortes',
        emptyHint: 'Quando pessoas novas chegarem ao seu app, você verá aqui quantas voltam a cada dia ou semana.',
        curve: 'Curva de retenção',
        returning: 'Voltam',
        cohorts: {
            day: 'Coortes diárias',
            week: 'Coortes semanais'
        },
        cohortsHint: {
            day: '% de cada coorte que volta naquele dia',
            week: '% de cada coorte que volta naquela semana'
        }
    },
    stats: {
        returnIn: (unit: string, index: number) => `Voltam ${unit} ${index}`,
        stillIn: (unit: string, index: number) => `Continuam ${unit} ${index}`,
        notThatFar: 'Ainda não há coortes que cheguem tão longe',
        weightedAverage: (count: number) => `Média ponderada de ${count} ${count === 1 ? 'coorte' : 'coortes'}`,
        best: 'Melhor coorte',
        bestStart: {
            day: (day: string) => `Chegou em ${day}`,
            week: (day: string) => `Semana de ${day}`
        },
        noneBack: 'Ainda não há coortes que voltem'
    },
    grid: {
        people: 'Pessoas',
        cell: (returned: number, size: number, unit: string, index: number) => `${fmt.n(returned)} de ${people(size)} ${unit} ${index}`
    }
};

export default pt;
