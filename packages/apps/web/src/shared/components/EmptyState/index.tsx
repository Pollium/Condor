import type { ComponentType, ReactNode } from 'react';

interface EmptyStateProps{
    icon: ComponentType<{ size?: number; className?: string }>;
    title: string;
    description?: string;
    compact?: boolean;
    children?: ReactNode;
}

const EmptyState = ({ icon: Icon, title, description, compact = false, children }: EmptyStateProps) => (
    <div className={`flex flex-col items-start ${compact ? 'px-4 py-8' : 'flex-1 justify-center px-6 py-16'}`}>
        <Icon size={compact ? 24 : 32} className='text-label-2' />
        <h2 className={`text-foreground ${compact ? 'mt-3 text-[0.875rem]' : 'mt-4 text-[1.25rem] font-light'}`}>{title}</h2>
        {description ? <p className={`max-w-sm text-label-2 ${compact ? 'mt-1 text-[0.8125rem]' : 'mt-1.5 text-[0.875rem]'}`}>{description}</p> : null}
        {children ? <div className={compact ? 'mt-4' : 'mt-6'}>{children}</div> : null}
    </div>
);

export default EmptyState;
