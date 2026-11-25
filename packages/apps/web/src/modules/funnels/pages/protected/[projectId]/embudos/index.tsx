import { Button, InlineLoading, OverflowMenuItem } from '@carbon/react';
import { Add, Filter, WarningAlt } from '@carbon/icons-react';
import { Funnel } from '@condor/contracts/funnels/domain';
import { funnelRoutes } from '@condor/contracts/funnels/routes';
import { describeError } from '@pollium/readable-react/errors/copy';
import { useQuery } from '@pollium/readable-react/query/useQuery';
import { useState } from 'react';
import { canEdit, useMe } from '@/modules/auth/hooks/use-me';
import SegmentMenu from '@/modules/events/components/SegmentMenu';
import { useSegmentQuery } from '@/modules/events/hooks/use-segment';
import FunnelDelete from '@/modules/funnels/components/FunnelDelete';
import FunnelEditor from '@/modules/funnels/components/FunnelEditor';
import FunnelResults from '@/modules/funnels/components/FunnelResults';
import { copy } from '@/modules/funnels/i18n';
import { windowChoices } from '@/modules/funnels/utils/funnel-copy';
import { useProject } from '@/modules/projects/hooks/use-workspace';
import ActionMenu from '@/shared/components/ActionMenu';
import EmptyState from '@/shared/components/EmptyState';
import { PageHeader } from '@/shared/components/Page';
import ToolbarMenu from '@/shared/components/ToolbarMenu';
import { copy as shared } from '@/shared/i18n';
import { usePeriodStore } from '@/shared/store/period';

const FunnelsPage = () => {
    const project = useProject();
    const editor = canEdit(useMe().data);
    const period = usePeriodStore((state) => state.period);
    const funnels = useQuery(funnelRoutes.list, { path: { projectId: project.id } });
    const [chosen, setChosen] = useState<string | null>(null);
    const [hours, setHours] = useState<number | null>(null);
    const [editing, setEditing] = useState<Funnel | 'new' | null>(null);
    const [deleting, setDeleting] = useState<Funnel | null>(null);

    const list = funnels.data ?? [];
    const funnel = list.find((entry) => entry.id === chosen) ?? list[0];
    const windowHours = hours ?? funnel?.windowHours ?? 24;
    const segment = useSegmentQuery(project.id);
    const results = useQuery(funnelRoutes.results, { path: { projectId: project.id, funnelId: funnel?.id }, query: { period, windowHours, ...segment } });

    const pick = (id: string | null) => {
        setChosen(id);
        setHours(null);
    };

    const saved = (entry: Funnel) => {
        setEditing(null);
        pick(entry.id);
    };

    const deleted = () => {
        setDeleting(null);
        pick(null);
    };

    const body = () => {
        if(funnels.error && !funnels.data){
            return (
                <EmptyState icon={WarningAlt} title={copy.page.loadFailed} description={describeError(funnels.error) ?? undefined}>
                    <Button kind='tertiary' size='sm' onClick={funnels.reload}>{copy.page.retry}</Button>
                </EmptyState>
            );
        }
        if(!funnels.data) return <InlineLoading description={copy.page.loading} />;
        if(!funnel){
            return (
                <EmptyState
                    icon={Filter}
                    title={copy.page.emptyTitle}
                    description={copy.page.emptyHint}
                >
                    {editor ? <Button size='md' renderIcon={Add} onClick={() => setEditing('new')}>{copy.page.createFirst}</Button> : null}
                </EmptyState>
            );
        }
        return <FunnelResults query={results} />;
    };

    return (
        <div className='w-full'>
            <PageHeader title={shared.views.funnels} hint={funnel ? copy.page.steps(funnel.steps.length) : undefined}>
                {funnel ? (
                    <>
                        <SegmentMenu projectId={project.id} />
                        <ToolbarMenu label={copy.page.funnel} choices={list.map((entry) => ({ value: entry.id, label: entry.name }))} value={funnel.id} onChange={pick} />
                        <ToolbarMenu label={copy.page.window} choices={windowChoices(windowHours)} value={String(windowHours)} onChange={(value) => setHours(Number(value))} />
                    </>
                ) : null}
                {editor && funnel ? (
                    <>
                        <Button kind='ghost' size='sm' renderIcon={Add} onClick={() => setEditing('new')}>{copy.page.create}</Button>
                        <ActionMenu subject={funnel.name}>
                            <OverflowMenuItem itemText={copy.page.edit} onClick={() => setEditing(funnel)} />
                            <OverflowMenuItem itemText={copy.page.remove} isDelete hasDivider onClick={() => setDeleting(funnel)} />
                        </ActionMenu>
                    </>
                ) : null}
            </PageHeader>

            {body()}

            {editing ? (
                <FunnelEditor projectId={project.id} funnel={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={saved} />
            ) : null}
            {deleting ? <FunnelDelete projectId={project.id} funnel={deleting} onClose={() => setDeleting(null)} onDeleted={deleted} /> : null}
        </div>
    );
};

export default FunnelsPage;
