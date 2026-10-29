import { Button, InlineLoading } from '@carbon/react';
import { Add, Application } from '@carbon/icons-react';
import { useWorkspace } from '@/modules/projects/hooks/use-workspace';
import { readLastProject } from '@/modules/projects/utils/last-project';
import EmptyState from '@/shared/components/EmptyState';
import { PageHeader } from '@/shared/components/Page';
import { Navigate } from 'react-router-dom';

const HomePage = () => {
    const { projects, loading, setAdding } = useWorkspace();

    if(loading && projects.length === 0) return <InlineLoading description='Cargando tus apps…' />;

    const last = readLastProject();
    const target = projects.find((project) => project.id === last) ?? projects[0];
    if(target !== undefined) return <Navigate to={`/${target.id}`} replace />;

    return (
        <>
            <PageHeader title='Condor' hint='Sin apps todavía' />
            <EmptyState icon={Application} title='Conecta tu primera app' description='Cada app tiene su propia clave. Instalas el SDK con una línea y las sesiones, métricas y errores empiezan a llegar.'>
                <Button renderIcon={Add} onClick={() => setAdding(true)}>Añadir una app</Button>
            </EmptyState>
        </>
    );
};

export default HomePage;
