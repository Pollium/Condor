import { flag } from '@/modules/overview/utils/labels';

const Flag = ({ code }: { code?: string }) => (
    <span aria-hidden className='w-6 shrink-0 text-center text-[1.125rem] leading-none'>
        {flag(code)}
    </span>
);

export default Flag;
