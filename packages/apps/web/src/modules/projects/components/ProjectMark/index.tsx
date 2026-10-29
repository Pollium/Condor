import { Project } from '@condor/contracts/projects/domain';

interface ProjectMarkProps{
    project: Pick<Project, 'name' | 'tint'>;
    size?: number;
}

const ProjectMark = ({ project, size = 28 }: ProjectMarkProps) => (
    <span
        aria-hidden
        className='flex shrink-0 items-center justify-center font-semibold text-white'
        style={{ width: size, height: size, background: project.tint, fontSize: size * 0.46 }}
    >
        {project.name.trim()[0]?.toUpperCase() ?? 'C'}
    </span>
);

export default ProjectMark;
