import { Button, SkeletonText } from '@carbon/react';
import { describeError } from '@pollium/readable-react/errors/copy';
import { Query } from '@pollium/readable-react/query/useQuery';
import type { ReactNode } from 'react';
import { copy } from '@/modules/overview/i18n';

interface LoadedProps<T>{
    query: Pick<Query<T>, 'data' | 'error' | 'reload'>;
    lines?: number;
    skeleton?: ReactNode;
    children: (data: T) => ReactNode;
}

const Loaded = <T,>({ query, lines = 5, skeleton, children }: LoadedProps<T>) => {
    if(query.data !== null) return children(query.data);
    if(query.error !== undefined){
        return (
            <div className='flex items-center gap-3 text-[0.8125rem] text-label-2'>
                <span>{describeError(query.error) ?? copy.loaded.failed}</span>
                <Button kind='ghost' size='sm' onClick={query.reload}>{copy.loaded.retry}</Button>
            </div>
        );
    }
    return skeleton ?? <SkeletonText paragraph lineCount={lines} />;
};

export default Loaded;
