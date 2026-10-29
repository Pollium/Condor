import { ReactNode } from 'react';

interface AuthFrameProps{
    title: string;
    lead: string;
    children: ReactNode;
}

const AuthFrame = ({ title, lead, children }: AuthFrameProps) => (
    <div className='flex min-h-dvh flex-col bg-canvas text-foreground'>
        <header className='flex h-12 items-center border-b border-separator px-4'>
            <span className='text-[0.875rem] font-semibold tracking-[0.01em]'>Condor</span>
        </header>
        <main className='flex flex-1 items-start justify-center px-4 py-16 sm:py-24'>
            <div className='w-full max-w-[26rem]'>
                <h1 className='text-[2rem] font-light leading-tight'>{title}</h1>
                <p className='mt-2 text-[0.875rem] text-label-2'>{lead}</p>
                <div className='mt-8'>{children}</div>
            </div>
        </main>
    </div>
);

export default AuthFrame;
