import { Button, InlineLoading } from '@carbon/react';
import { Add, Application } from '@carbon/icons-react';
import { useWorkspace } from '@/modules/projects/hooks/use-workspace';
import { copy } from '@/modules/projects/i18n';
import { readLastProject } from '@/modules/projects/utils/last-project';
import EmptyState from '@/shared/components/EmptyState';
import { PageHeader } from '@/shared/components/Page';
import { Navigate } from 'react-router-dom';

const HomePage = () => {
    const { projects, loading, setAdding } = useWorkspace();

    if(loading && projects.length === 0) return <InlineLoading description={copy.home.loading} />;

    const last = readLastProject();
    const target = projects.find((project) => project.id === last) ?? projects[0];
    if(target !== undefined) return <Navigate to={`/${target.id}`} replace />;

    return (
        <>
            <PageHeader title='Condor' hint={copy.home.hint} />
            <EmptyState icon={Application} title={copy.home.title} description={copy.home.description}>
                <Button renderIcon={Add} onClick={() => setAdding(true)}>{copy.home.add}</Button>
            </EmptyState>
        </>
    );
};

export default HomePage;
