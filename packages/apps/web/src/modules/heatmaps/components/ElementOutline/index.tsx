import { fmt } from '@/shared/utils/format';

export interface OutlineBox{
    x: number;
    y: number;
    width: number;
    height: number;
}

interface ElementOutlineProps{
    label: string;
    count: number;
    box: OutlineBox;
}

const ElementOutline = ({ label, count, box }: ElementOutlineProps) => (
    <div
        className='pointer-events-none absolute'
        style={{ left: box.x - 4, top: box.y - 4, width: box.width + 8, height: box.height + 8, boxShadow: '0 0 0 2px var(--accent), 0 0 0 6px rgba(255, 255, 255, 0.65)' }}
    >
        <span className={`absolute left-0 max-w-[20rem] truncate whitespace-nowrap bg-black/75 px-3 py-1 text-[0.8125rem] text-white ${box.y < 40 ? 'top-full mt-3' : '-top-9'}`}>
            {label} · {fmt.n(count)}
        </span>
    </div>
);

export default ElementOutline;
