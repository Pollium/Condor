import AppGroup from '@/modules/projects/components/AppGroup';
import CaptureGroup from '@/modules/projects/components/CaptureGroup';
import ConversionGroup from '@/modules/projects/components/ConversionGroup';
import DangerZone from '@/modules/projects/components/DangerZone';
import InstallGroup from '@/modules/projects/components/InstallGroup';
import PrivacyGroup from '@/modules/projects/components/PrivacyGroup';
import RecordingGroup from '@/modules/projects/components/RecordingGroup';
import RouteGroups from '@/modules/projects/components/RouteGroups';
import StatusGroup from '@/modules/projects/components/StatusGroup';
import { useProject } from '@/modules/projects/hooks/use-workspace';
import { copy } from '@/modules/projects/i18n';
import { canEdit, useMe } from '@/modules/auth/hooks/use-me';
import { PageHeader } from '@/shared/components/Page';

const SettingsPage = () => {
    const project = useProject();
    const me = useMe();
    const disabled = !canEdit(me.data);

    return (
        <div key={project.id} className='mx-auto flex w-full max-w-2xl flex-col gap-10 pb-16 pt-2'>
            <PageHeader title={copy.settings.title} hint={project.host} />
            {disabled && me.data !== null ? <p className='-mb-6 text-[0.8125rem] text-label-2'>{copy.settings.readOnly}</p> : null}
            <InstallGroup disabled={disabled} />
            <AppGroup disabled={disabled} />
            <PrivacyGroup disabled={disabled} />
            <RecordingGroup disabled={disabled} />
            <CaptureGroup disabled={disabled} />
            <RouteGroups disabled={disabled} />
            <ConversionGroup disabled={disabled} />
            <StatusGroup />
            <DangerZone disabled={disabled} />
        </div>
    );
};

export default SettingsPage;
