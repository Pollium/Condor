const BLOCK = 520;

const Lines = ({ count }: { count: number }) => (
    <div className='flex flex-col gap-3'>
        {Array.from({ length: count }, (_, index) => (
            <span key={index} className='h-3 bg-fill' style={{ width: `${index === count - 1 ? 56 : 100 - index * 7}%` }} />
        ))}
    </div>
);

const Block = ({ index }: { index: number }) => (
    <div className='flex flex-wrap gap-8' style={{ height: BLOCK - 64 }}>
        {index % 2 === 0 ? (
            <>
                <div className='min-w-[14rem] flex-[3] bg-fill' />
                <div className='flex min-w-[14rem] flex-[2] flex-col justify-center gap-6'>
                    <span className='h-6 w-3/4 bg-fill' />
                    <Lines count={4} />
                    <span className='h-10 w-40 bg-fill' />
                </div>
            </>
        ) : (
            Array.from({ length: 3 }, (_, card) => (
                <div key={card} className='flex min-w-[14rem] flex-1 flex-col gap-4'>
                    <div className='flex-1 bg-fill' />
                    <Lines count={3} />
                </div>
            ))
        )}
    </div>
);

const PageSilhouette = ({ height }: { height: number }) => (
    <div className='absolute inset-0 flex flex-col overflow-hidden bg-background' aria-hidden>
        <div className='flex h-16 shrink-0 items-center gap-6 border-b border-separator px-[4%]'>
            <span className='h-5 w-28 bg-fill' />
            <span className='ml-auto h-3 w-16 bg-fill' />
            <span className='h-3 w-16 bg-fill' />
            <span className='h-3 w-16 bg-fill' />
        </div>
        <div className='flex flex-col gap-16 px-[4%] pt-12'>
            {Array.from({ length: Math.max(1, Math.ceil((height - 64) / BLOCK)) }, (_, index) => (
                <Block key={index} index={index} />
            ))}
        </div>
    </div>
);

export default PageSilhouette;
