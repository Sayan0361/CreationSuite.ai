import React from 'react';

const Gauge = ({ value }) => {
    const percentage = Math.min(Math.max(value, 0), 100);
    const color = 
        percentage < 40 ? 'text-red-500' :
        percentage < 70 ? 'text-yellow-500' :
        'text-green-500';

    return (
        <div className='relative w-full h-4 bg-zinc-700 rounded-full overflow-hidden'>
            <div 
                className={`absolute top-0 left-0 h-full ${color} bg-current rounded-full`}
                style={{ width: `${percentage}%` }}
            ></div>
            <div className='absolute top-0 left-0 w-full h-full flex items-center justify-center'>
                <span className='text-xs font-bold text-white'>{percentage}%</span>
            </div>
        </div>
    );
};

export default Gauge;  