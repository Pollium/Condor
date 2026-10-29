import { PageMeta } from '@condor/contracts/shared/http';
import { Page } from '../../contracts/params';

export default class Paginated<T>{
    constructor(
        readonly items: T[],
        readonly page: Page,
        readonly total: number
    ){}

    get meta(): PageMeta{
        return {
            total: this.total,
            limit: this.page.limit,
            offset: this.page.offset
        };
    }
}
