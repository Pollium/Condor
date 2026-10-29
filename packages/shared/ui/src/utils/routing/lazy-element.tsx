import { PageLoader } from '../../contracts/route';
import { lazy, Suspense, ReactElement } from 'react';

export const lazyElement = (load: PageLoader): ReactElement => {
    const Page = lazy(load);

    return (
        <Suspense fallback={null}>
            <Page />
        </Suspense>
    );
};
