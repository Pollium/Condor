import { IconButton } from '@carbon/react';
import { ChevronLeft } from '@carbon/icons-react';
import { Children, Fragment, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useToolbarStore } from '@/shared/store/toolbar';

interface PageHeaderProps{
    title: string;
    hint?: string;
    back?: { to: string; label: string };
    children?: ReactNode;
}

export const PageHeader = ({ title, hint, back, children }: PageHeaderProps) => {
    const toolbar = useToolbarStore((state) => state.toolbar);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = `${title} · Condor`;
    }, [title]);

    if(!toolbar) return null;

    return createPortal(
        <>
            <div className='flex min-w-[9rem] flex-1 items-center gap-1.5'>
                {back ? (
                    <IconButton kind='ghost' size='sm' label={`Volver a ${back.label}`} onClick={() => navigate(back.to)} align='bottom-start'>
                        <ChevronLeft />
                    </IconButton>
                ) : null}
                <div className='min-w-0'>
                    <h1 className='truncate text-[1.25rem] font-normal leading-tight text-foreground'>{title}</h1>
                    {hint ? <p className='truncate text-[0.75rem] leading-tight text-label-2'>{hint}</p> : null}
                </div>
            </div>
            {children ? <div className='flex min-w-0 flex-wrap items-center gap-2'>{children}</div> : null}
        </>,
        toolbar
    );
};

interface SectionProps{
    title?: string;
    aside?: ReactNode;
    children: ReactNode;
    className?: string;
}

export const Section = ({ title, aside, children, className = '' }: SectionProps) => (
    <section className={`flex min-w-0 flex-col gap-4 ${className}`}>
        {title ? (
            <div className='flex flex-wrap items-center justify-between gap-x-4 gap-y-2'>
                <h2 className='text-[1rem] font-normal text-foreground'>{title}</h2>
                {aside}
            </div>
        ) : null}
        {children}
    </section>
);

export const Legend = ({ items }: { items: { label: string; className: string }[] }) => (
    <div className='flex flex-wrap gap-4 text-[0.8125rem] text-label-2'>
        {items.map((item) => (
            <span key={item.label} className='flex items-center gap-2'>
                <span className={`h-2 w-2 rounded-full ${item.className}`} />
                {item.label}
            </span>
        ))}
    </div>
);

export const Stack = ({ children }: { children: ReactNode }) => (
    <div className='flex flex-col'>
        {Children.toArray(children).map((child, index) => (
            <Fragment key={index}>
                {index ? <div role='separator' className='my-8 h-px bg-separator' /> : null}
                {child}
            </Fragment>
        ))}
    </div>
);
