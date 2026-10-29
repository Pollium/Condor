import { Button, SkeletonText } from '@carbon/react';
import { Query } from '@condor/ui/contracts/api';
import type { ReactNode } from 'react';
import { errorCopy } from '@/shared/utils/error-copy';

interface LoadedProps<T>{
    query: Query<T>;
    lines?: number;
    skeleton?: ReactNode;
    children: (data: T) => ReactNode;
}

const copy = errorCopy();

const Loaded = <T,>({ query, lines = 5, skeleton, children }: LoadedProps<T>) => {
    if(query.data !== null) return children(query.data);
    if(query.error !== undefined){
        return (
            <div className='flex items-center gap-3 text-[0.8125rem] text-label-2'>
                <span>{copy(query.error) ?? 'No se pudo cargar.'}</span>
                <Button kind='ghost' size='sm' onClick={query.reload}>Reintentar</Button>
            </div>
        );
    }
    return skeleton ?? <SkeletonText paragraph lineCount={lines} />;
};

export default Loaded;
